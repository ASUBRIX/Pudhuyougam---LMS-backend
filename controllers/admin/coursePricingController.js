const { query } = require('../../config/database');

// Get all pricing plans for a course
const getPricingPlansByCourse = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM course_pricing_plans WHERE course_id = $1 ORDER BY created_at DESC',
      [req.params.courseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pricing plans:', err);
    res.status(500).json({ error: 'Failed to fetch pricing plans', details: err.message });
  }
};

// Helper function to calculate effective price
const calculateEffectivePrice = (price, discount) => {
  const priceNum = parseFloat(price);
  const discountNum = parseFloat(discount || 0);
  return priceNum - (priceNum * discountNum / 100);
};

// Create a new pricing plan
const createPricingPlan = async (req, res) => {
  try {
    const { course_id, duration, unit, price, discount, is_promoted } = req.body;
    
    // Validate required fields
    if (!course_id || !duration || !unit || price === undefined || price === null) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['course_id', 'duration', 'unit', 'price'],
        received: { course_id, duration, unit, price }
      });
    }

    // Validate numeric fields
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }

    if (discount !== undefined && discount !== null && discount !== '') {
      if (isNaN(parseFloat(discount)) || parseFloat(discount) < 0 || parseFloat(discount) > 100) {
        return res.status(400).json({ error: 'Discount must be a valid number between 0 and 100' });
      }
    }

    // Validate unit
    const validUnits = ['days', 'months', 'years'];
    if (!validUnits.includes(unit)) {
      return res.status(400).json({ error: 'Unit must be one of: days, months, years' });
    }

    // Validate duration
    if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      return res.status(400).json({ error: 'Duration must be a positive integer' });
    }

    // Calculate effective price
    const effective_price = calculateEffectivePrice(price, discount);

    console.log('Creating pricing plan with data:', {
      course_id,
      duration,
      unit,
      price,
      discount,
      is_promoted,
      effective_price
    });

    const result = await query(
      `INSERT INTO course_pricing_plans 
       (course_id, duration, unit, price, discount, is_promoted, effective_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        parseInt(course_id), 
        parseInt(duration), 
        unit, 
        parseFloat(price), 
        discount ? parseFloat(discount) : null, 
        Boolean(is_promoted), 
        effective_price
      ]
    );
    
    console.log('Pricing plan created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating pricing plan:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Failed to create pricing plan', details: err.message });
  }
};

// Update a pricing plan
const updatePricingPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration, unit, price, discount, is_promoted } = req.body;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid pricing plan ID' });
    }

    // Validate numeric fields if provided
    if (price !== undefined && price !== null && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }

    if (discount !== undefined && discount !== null && discount !== '') {
      if (isNaN(parseFloat(discount)) || parseFloat(discount) < 0 || parseFloat(discount) > 100) {
        return res.status(400).json({ error: 'Discount must be a valid number between 0 and 100' });
      }
    }

    // Validate unit if provided
    if (unit) {
      const validUnits = ['days', 'months', 'years'];
      if (!validUnits.includes(unit)) {
        return res.status(400).json({ error: 'Unit must be one of: days, months, years' });
      }
    }

    // Validate duration if provided
    if (duration !== undefined && duration !== null && (isNaN(parseInt(duration)) || parseInt(duration) <= 0)) {
      return res.status(400).json({ error: 'Duration must be a positive integer' });
    }

    // Calculate effective price
    const effective_price = calculateEffectivePrice(price, discount);

    console.log('Updating pricing plan with ID:', id, 'Data:', {
      duration,
      unit,
      price,
      discount,
      is_promoted,
      effective_price
    });

    const result = await query(
      `UPDATE course_pricing_plans SET
       duration = $1,
       unit = $2,
       price = $3,
       discount = $4,
       is_promoted = $5,
       effective_price = $6,
       updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [
        parseInt(duration), 
        unit, 
        parseFloat(price), 
        discount ? parseFloat(discount) : null, 
        Boolean(is_promoted), 
        effective_price, 
        parseInt(id)
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    console.log('Pricing plan updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating pricing plan:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Failed to update pricing plan', details: err.message });
  }
};

// Delete a pricing plan
const deletePricingPlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid pricing plan ID' });
    }

    console.log('Deleting pricing plan with ID:', id);

    const result = await query('DELETE FROM course_pricing_plans WHERE id = $1 RETURNING id', [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    console.log('Pricing plan deleted successfully');
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting pricing plan:', err);
    res.status(500).json({ error: 'Failed to delete pricing plan', details: err.message });
  }
};

module.exports = {
  getPricingPlansByCourse,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
};
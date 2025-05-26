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
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
};

// Create a new pricing plan
const createPricingPlan = async (req, res) => {
  const { course_id, duration, unit, price, discount, is_promoted } = req.body;
  const effective_price = parseFloat(price) - (parseFloat(price) * parseFloat(discount || 0) / 100);

  try {
    const result = await query(
      `INSERT INTO course_pricing_plans 
       (course_id, duration, unit, price, discount, is_promoted, effective_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [course_id, duration, unit, price, discount, is_promoted, effective_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create pricing plan' });
  }
};

// Update a pricing plan
const updatePricingPlan = async (req, res) => {
  const { id } = req.params;
  const { duration, unit, price, discount, is_promoted } = req.body;
  const effective_price = parseFloat(price) - (parseFloat(price) * parseFloat(discount || 0) / 100);

  try {
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
      [duration, unit, price, discount, is_promoted, effective_price, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pricing plan' });
  }
};

// Delete a pricing plan
const deletePricingPlan = async (req, res) => {
  try {
    await query('DELETE FROM course_pricing_plans WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete pricing plan' });
  }
};

module.exports = {
  getPricingPlansByCourse,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
};

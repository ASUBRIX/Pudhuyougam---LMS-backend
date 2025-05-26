const { query } = require('../../config/database');

// Get all coupons
const getAllCoupons = async (req, res) => {
  try {
    const result = await query("SELECT * FROM coupons ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
};

// Create a new coupon
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      usageLimit,
      expirationDate,
      isActive
    } = req.body;

    const result = await query(
      `INSERT INTO coupons (code, discount_type, discount_value, max_usage, expiry_date, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [code, discountType, discountValue, usageLimit, expirationDate, isActive]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create coupon" });
  }
};

// Update coupon
const updateCoupon = async (req, res) => {
  const { id } = req.params;
  const {
    code,
    discountType,
    discountValue,
    usageLimit,
    expirationDate,
    isActive
  } = req.body;

  try {
    const result = await query(
      `UPDATE coupons 
       SET code = $1, discount_type = $2, discount_value = $3, max_usage = $4, expiry_date = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [code, discountType, discountValue, usageLimit, expirationDate, isActive, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update coupon" });
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query("DELETE FROM coupons WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
};

module.exports = {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};

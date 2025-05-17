const express = require("express");
const router = express.Router();
const{query} = require("../config/database");

// Get all coupons
router.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM coupons ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});


router.post('/', async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      max_usage,
      expiry_date,
      is_active
    } = req.body;

    const result = await query(`
      INSERT INTO coupons 
      (code, discount_type, discount_value, max_usage, expiry_date, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [code, discount_type, discount_value, max_usage, expiry_date, is_active]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating coupon:', err);
    res.status(500).send('Internal Server Error');
  }
});


// Delete coupon
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query("DELETE FROM coupons WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

module.exports = router;

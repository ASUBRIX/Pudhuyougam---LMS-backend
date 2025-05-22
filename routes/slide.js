const express = require('express');
const router = express.Router();
const { query } = require("../config/database");


router.get('/', async (req, res) => {
    console.log("fn for fetch slides");
    
  try {
    const sql = `
      SELECT id, title, description, image_url, link, status, sort_order
      FROM banners
      WHERE status = 'Active'
      ORDER BY sort_order ASC, created_at DESC
    `;
    const { rows } = await query(sql);
    

    res.json(rows);
  } catch (err) {
    console.error('Error fetching banners:', err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

module.exports = router;

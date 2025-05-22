const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET latest announcements for notice board
router.get('/', async (req, res) => {
  console.log("hit notice board");
  
  try {
    // Fetch only active, latest 10 (or change as needed)
    const result = await query(
      `SELECT id, title, content, created_at FROM announcements WHERE is_active = true ORDER BY created_at DESC LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch announcements:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET all published blogs (for students)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM blogs WHERE is_published = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching published blogs:', err);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// (Optional) GET a single blog by id
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM blogs WHERE id = $1 AND is_published = true',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

module.exports = router;

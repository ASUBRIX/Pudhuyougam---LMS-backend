// routes/publicInstructors.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET public instructor list
router.get('/', async (req, res) => {
  console.log("fetch instructors");
  
  try {
    const result = await query(
      `SELECT id, faculty_id, name, department, designation, avatar, experience 
       FROM faculties WHERE status = 'active' ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch instructors:', err);
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
});

module.exports = router;

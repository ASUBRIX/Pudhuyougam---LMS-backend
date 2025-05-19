const express = require('express');
const router = express.Router();
const { query } = require('../config/database'); 

// POST create new enquiry
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !message || !subject) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await query(
      `INSERT INTO enquiries (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, phone, subject, message]
    );

    res.status(201).json({
      message: 'Enquiry submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error inserting enquiry:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all enquiries
router.get('/', async (req, res) => {
  console.log("get api request for fetch data");

  try {
    const result = await query('SELECT * FROM enquiries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

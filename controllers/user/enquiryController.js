const { query } = require('../../config/database');

// Public: Submit new enquiry
const createEnquiry = async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createEnquiry };

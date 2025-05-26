const { query } = require('../../config/database');

// Admin: Get all enquiries
const getAllEnquiries = async (req, res) => {
  try {
    const result = await query('SELECT * FROM enquiries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getAllEnquiries };

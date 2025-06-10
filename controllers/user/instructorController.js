const { query } = require('../../config/database');

// Get public instructor list (active) with board_member field
const getPublicInstructors = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, faculty_id, name, department, designation, avatar, experience, board_member
       FROM faculties
       WHERE status = 'active'
       ORDER BY id DESC`
    );
    return res.json(result.rows);

  } catch (err) {
    console.error('Error fetching instructors:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to fetch instructors' });
    }
  }
};

module.exports = { getPublicInstructors };

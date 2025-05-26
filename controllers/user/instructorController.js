const { query } = require('../../config/database');

// Get public instructor list (active)
const getPublicInstructors = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, faculty_id, name, department, designation, avatar, experience 
       FROM faculties WHERE status = 'active' ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
};

module.exports = { getPublicInstructors };

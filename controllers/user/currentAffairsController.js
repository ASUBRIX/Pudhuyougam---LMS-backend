const { query } = require('../../config/database');

// Get all active current affairs (for user)
const getAllCurrentAffairs = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM current_affairs WHERE is_active = true ORDER BY date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current affairs' });
  }
};

// Get single current affair by ID (for user)
const getCurrentAffairById = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM current_affairs WHERE id = $1 AND is_active = true',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Current affair not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current affair' });
  }
};

module.exports = {
  getAllCurrentAffairs,
  getCurrentAffairById,
};

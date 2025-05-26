const { query } = require('../../config/database');

// Get latest active announcements for notice board
const getLatestAnnouncements = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, content, created_at 
       FROM announcements 
       WHERE is_active = true 
       ORDER BY created_at DESC 
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

module.exports = { getLatestAnnouncements };

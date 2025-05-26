const { query } = require('../../config/database');

// Get all published blogs (for students)
const getAllPublishedBlogs = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM blogs WHERE is_published = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// Get a single published blog by id
const getPublishedBlogById = async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

module.exports = {
  getAllPublishedBlogs,
  getPublishedBlogById,
};

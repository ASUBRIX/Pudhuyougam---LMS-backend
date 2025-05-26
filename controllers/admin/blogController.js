const { query } = require('../../config/database');

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const result = await query('SELECT * FROM blogs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// Create blog
const createBlog = async (req, res) => {
  const { title, date, author, excerpt, content, imageUrl, tags, isPublished } = req.body;
  try {
    const result = await query(
      `INSERT INTO blogs (title, date, author, excerpt, content, image_url, tags, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, date, author, excerpt, content, imageUrl, tags, isPublished]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

// Update blog
const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, date, author, excerpt, content, imageUrl, tags, isPublished } = req.body;
  try {
    const result = await query(
      `UPDATE blogs SET 
        title=$1, date=$2, author=$3, excerpt=$4, content=$5,
        image_url=$6, tags=$7, is_published=$8
       WHERE id=$9 RETURNING *`,
      [title, date, author, excerpt, content, imageUrl, tags, isPublished, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    await query('DELETE FROM blogs WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};

module.exports = {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog
};

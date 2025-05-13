const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM blogs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// POST create blog
router.post('/', async (req, res) => {
  console.log("create blog is working ");
  
  const { title, date, author, excerpt, content, imageUrl, tags, isPublished } = req.body;

  try {
    const result = await query(
      `INSERT INTO blogs (title, date, author, excerpt, content, image_url, tags, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, date, author, excerpt, content, imageUrl, tags, isPublished]
    );
    res.status(201).json(result.rows[0]);
    console.log(result);
    
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// PUT update blog
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, date, author, excerpt, content, imageUrl, tags, isPublished } = req.body;

  try {
    const result = await query(
      `UPDATE blogs SET 
        title=$1, date=$2, author=$3, excerpt=$4, content=$5,
        image_url=$6, tags=$7, is_published=$8
       WHERE id=$9 RETURNING *`, // ✅ Correct: no comma before WHERE
      [title, date, author, excerpt, content, imageUrl, tags, isPublished, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});


// DELETE blog
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM blogs WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

module.exports = router;

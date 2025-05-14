const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET all announcements
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// POST create announcement
router.post('/', async (req, res) => {
    console.log("announcements");
    
  const { title, content, isActive } = req.body;

  try {
    const result = await query(
      `INSERT INTO announcements (title, content, is_active) VALUES ($1, $2, $3) RETURNING *`,
      [title, content, isActive]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// PUT update announcement
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, isActive } = req.body;

  try {
    const result = await query(
      `UPDATE announcements SET title=$1, content=$2, is_active=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
      [title, content, isActive, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating announcement:', err);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// DELETE announcement
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;

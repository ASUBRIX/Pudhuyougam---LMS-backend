const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET all
router.get('/', async (req, res) => {
  const result = await query('SELECT * FROM current_affairs ORDER BY date DESC');
  res.json(result.rows);
});

// POST create
router.post('/', async (req, res) => {
  const { title, content, category, date, isActive } = req.body;
  const result = await query(
    `INSERT INTO current_affairs (title, content, category, date, is_active) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, content, category, date, isActive]
  );
  res.status(201).json(result.rows[0]);
});

// PUT update
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, category, date, isActive } = req.body;
  const result = await query(
    `UPDATE current_affairs SET title=$1, content=$2, category=$3, date=$4, is_active=$5, updated_at=NOW()
     WHERE id=$6 RETURNING *`,
    [title, content, category, date, isActive, id]
  );
  res.json(result.rows[0]);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await query('DELETE FROM current_affairs WHERE id=$1', [req.params.id]);
  res.sendStatus(204);
});

module.exports = router;

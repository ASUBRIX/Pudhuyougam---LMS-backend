const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET all faculties
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM faculties ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch faculties:', err);
    res.status(500).json({ error: 'Failed to fetch faculties' });
  }
});

// POST create a new faculty
router.post('/', async (req, res) => {
  console.log("hit faculty API");
  
  const {
    name, email, phone, department, designation,
    status, qualification, experience, avatar, joiningDate, facultyId
  } = req.body;

  try {
    const result = await query(
      `INSERT INTO faculties 
        (name, email, phone, department, designation, status, qualification, experience, avatar, joining_date, faculty_id) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [name, email, phone, department, designation, status, qualification, experience, avatar, joiningDate, facultyId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to add faculty:', err);
    res.status(500).json({ error: 'Failed to add faculty' });
  }
});

// PUT update faculty by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name, email, phone, department, designation,
    status, qualification, experience, avatar, joiningDate
  } = req.body;

  try {
    const result = await query(
      `UPDATE faculties SET
        name = $1,
        email = $2,
        phone = $3,
        department = $4,
        designation = $5,
        status = $6,
        qualification = $7,
        experience = $8,
        avatar = $9,
        joining_date = $10
       WHERE id = $11
       RETURNING *`,
      [name, email, phone, department, designation, status, qualification, experience, avatar, joiningDate, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Failed to update faculty:', err);
    res.status(500).json({ error: 'Failed to update faculty' });
  }
});

// DELETE faculty by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await query('DELETE FROM faculties WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete faculty:', err);
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
});

module.exports = router;

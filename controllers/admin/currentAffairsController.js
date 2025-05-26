const { query } = require('../../config/database');

// Get all current affairs
const getAllCurrentAffairs = async (req, res) => {
  try {
    const result = await query('SELECT * FROM current_affairs ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current affairs' });
  }
};

// Create a new current affair
const createCurrentAffair = async (req, res) => {
  try {
    const { title, content, category, date, isActive } = req.body;
    const result = await query(
      `INSERT INTO current_affairs (title, content, category, date, is_active) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, category, date, isActive]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create current affair' });
  }
};

// Update a current affair
const updateCurrentAffair = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, date, isActive } = req.body;
    const result = await query(
      `UPDATE current_affairs SET title=$1, content=$2, category=$3, date=$4, is_active=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [title, content, category, date, isActive, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update current affair' });
  }
};

// Delete a current affair
const deleteCurrentAffair = async (req, res) => {
  try {
    await query('DELETE FROM current_affairs WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete current affair' });
  }
};

module.exports = {
  getAllCurrentAffairs,
  createCurrentAffair,
  updateCurrentAffair,
  deleteCurrentAffair,
};

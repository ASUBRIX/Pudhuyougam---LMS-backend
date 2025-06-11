const { query } = require('../../config/database');

// Get all announcements
const getAllAnnouncements = async (req, res) => {
  try {
    const result = await query('SELECT * FROM announcements ORDER BY created_at DESC');
    console.log('result:',result);
    console.log('result rows:',result.rows);
    
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  const { title, content, isActive } = req.body;
  console.log(req.body);
  
  try {
    const result = await query(
      `INSERT INTO announcements (title, content, is_active) VALUES ($1, $2, $3) RETURNING *`,
      [title, content, isActive]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

// Update announcement
const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content, isActive } = req.body;
  try {
    const result = await query(
      `UPDATE announcements SET title=$1, content=$2, is_active=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
      [title, content, isActive, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    await query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};

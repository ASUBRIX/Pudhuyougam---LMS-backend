const { query } = require('../../config/database');

// Get all chat messages for a user (student)
exports.getChatHistory = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await query(
      'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY timestamp ASC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

// Save a new chat message
exports.sendMessage = async (req, res) => {
  const { userId, sender, text, type, file_type, file_size, timestamp } = req.body;
  try {
    const result = await query(
      `INSERT INTO chat_messages (user_id, sender, text, type, file_type, file_size, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [userId, sender, text, type || 'text', file_type || null, file_size || null, timestamp || new Date()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
};

// Get all students with at least one chat message (for admin chat list)
exports.getChattedStudents = async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) AS name, u.email
      FROM users u
      WHERE u.role = 'student'
        AND EXISTS (SELECT 1 FROM chat_messages c WHERE c.user_id = u.id)
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

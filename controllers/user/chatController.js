const { query } = require('../../config/database');

/**
 * Get all chat messages for a specific user (student)
 * 
 * @description Retrieves complete chat history for a student ordered by timestamp (oldest first)
 * @route GET /api/chat/history/:userId
 * @access Public (should probably be protected in production)
 * @param {string} req.params.userId - Student user ID from URL parameter
 * @returns {Array} Array of chat message objects ordered chronologically
 * @returns {Object} Error object on database failure
 */
exports.getChatHistory = async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get all messages for this user ordered by timestamp (oldest first for chat display)
    const result = await query(
      'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY timestamp ASC',
      [userId]
    );
    
    // Return messages array directly
    res.json(result.rows);
    
  } catch (err) {
    console.error('Error fetching chat history for user:', userId, err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Save a new chat message to database
 * 
 * @description Inserts new chat message and returns the saved message with ID
 * @route POST /api/chat/send
 * @access Public (should probably be protected in production)
 * @param {number} req.body.userId - Student user ID (required)
 * @param {string} req.body.sender - Who sent the message: 'admin' or 'student' (required)
 * @param {string} req.body.text - Message text content (optional for file messages)
 * @param {string} req.body.type - Message type, defaults to 'text'
 * @param {string} req.body.file_type - File type if message contains file (optional)
 * @param {string} req.body.file_size - File size if message contains file (optional)
 * @param {Date} req.body.timestamp - Message timestamp, auto-generated if not provided
 * @returns {Object} Saved message object with generated ID
 * @returns {Object} Error object on save failure
 */
exports.sendMessage = async (req, res) => {
  const { userId, sender, text, type, file_type, file_size, timestamp } = req.body;
  
  try {
    // Insert new message and return the saved record
    const result = await query(
      `INSERT INTO chat_messages (user_id, sender, text, type, file_type, file_size, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        userId, 
        sender, 
        text, 
        type || 'text',           // Default to 'text' type
        file_type || null,        // Optional file type
        file_size || null,        // Optional file size
        timestamp || new Date()   // Auto-generate timestamp if not provided
      ]
    );
    
    // Return the saved message with generated ID
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('Error saving chat message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
};

/**
 * Get all students who have sent at least one chat message
 * 
 * @description Retrieves list of students with chat history for admin sidebar/list
 * @route GET /api/chat/students
 * @access Public (should probably be protected to admin only in production)
 * @returns {Array} Array of student objects with id, name (concatenated), and email
 * @returns {Object} Error object on database failure
 */
exports.getChattedStudents = async (req, res) => {
  try {
    // Get students who have at least one chat message, with concatenated full name
    const result = await query(`
      SELECT 
        u.id, 
        CONCAT(u.first_name, ' ', u.last_name) AS name, 
        u.email
      FROM users u
      WHERE u.role = 'student'
        AND EXISTS (SELECT 1 FROM chat_messages c WHERE c.user_id = u.id)
      ORDER BY name
    `);
    
    // Return students array
    res.json(result.rows);
    
  } catch (err) {
    console.error('Error fetching students with chat history:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};



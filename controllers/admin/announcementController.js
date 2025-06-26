const { query } = require('../../config/database');

/**
 * @fileoverview Admin Announcement Controller - Handles CRUD operations for announcements
 * @description This controller manages all administrative functions for announcements,
 * including creating, reading, updating, and deleting announcements. All endpoints
 * require admin authentication.
 */

/**
 * Get all announcements
 * @async
 * @function getAllAnnouncements
 * @description Retrieves all announcements from the database, ordered by creation date (newest first).
 * This endpoint is restricted to admin users only.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with all announcements or error
 */
const getAllAnnouncements = async (req, res) => {
  try {
    const result = await query('SELECT * FROM announcements ORDER BY created_at DESC');
    console.log('result:', result);
    console.log('result rows:', result.rows);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching all announcements:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

/**
 * Create new announcement
 * @async
 * @function createAnnouncement
 * @description Creates a new announcement with the provided title, content, and active status.
 * The announcement is automatically assigned a creation timestamp.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.title - The title of the announcement
 * @param {string} req.body.content - The content/body text of the announcement
 * @param {boolean} req.body.isActive - Whether the announcement should be active/visible
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with created announcement or error
 */
const createAnnouncement = async (req, res) => {
  const { title, content, isActive } = req.body;
  console.log('Create announcement request body:', req.body);
  
  // Validate required fields
  if (!title || !content) {
    return res.status(400).json({ 
      error: 'Title and content are required fields' 
    });
  }
  
  try {
    const result = await query(
      `INSERT INTO announcements (title, content, is_active) 
       VALUES ($1, $2, $3) RETURNING *`,
      [title, content, isActive !== undefined ? isActive : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

/**
 * Update existing announcement
 * @async
 * @function updateAnnouncement
 * @description Updates an existing announcement identified by ID with new title, content, and/or active status.
 * The updated_at timestamp is automatically updated to the current time.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The ID of the announcement to update
 * @param {string} [req.body.title] - The new title of the announcement
 * @param {string} [req.body.content] - The new content/body text of the announcement
 * @param {boolean} [req.body.isActive] - The new active status of the announcement
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with updated announcement or error
 */
const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content, isActive } = req.body;
  
  // Validate ID is a number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      error: 'Valid announcement ID is required' 
    });
  }
  
  try {
    const result = await query(
      `UPDATE announcements 
       SET title=$1, content=$2, is_active=$3, updated_at=NOW() 
       WHERE id=$4 RETURNING *`,
      [title, content, isActive, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Announcement not found' 
      });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating announcement:', err);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

/**
 * Delete announcement
 * @async
 * @function deleteAnnouncement
 * @description Permanently deletes an announcement from the database by ID.
 * This action cannot be undone.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The ID of the announcement to delete
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns 204 status on success or error response
 */
const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  
  // Validate ID is a number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      error: 'Valid announcement ID is required' 
    });
  }
  
  try {
    const result = await query(
      'DELETE FROM announcements WHERE id = $1 RETURNING id', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Announcement not found' 
      });
    }
    
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
const { query } = require('../../config/database');

/**
 * @fileoverview Notice Board Controller - Handles public announcement retrieval
 * @description This controller manages the public-facing notice board functionality,
 * providing endpoints for retrieving active announcements for display to all users.
 */

/**
 * Get latest active announcements for notice board
 * @async
 * @function getLatestAnnouncements
 * @description Retrieves the 10 most recent active announcements for public display.
 * Only returns basic announcement information (id, title, content, created_at).
 * Excludes sensitive fields like is_active and updated_at from public response.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with announcement data or error
 */
const getLatestAnnouncements = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, content, created_at 
       FROM announcements 
       WHERE is_active = true 
       ORDER BY created_at DESC 
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching latest announcements:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

module.exports = { 
  getLatestAnnouncements 
};
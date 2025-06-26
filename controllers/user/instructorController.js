const { query } = require('../../config/database');

/**
 * @fileoverview User Instructor Controller - Handles public instructor data retrieval
 * @description This controller manages the public-facing instructor functionality,
 * providing endpoints for retrieving active instructor/faculty information for display to users.
 */

/**
 * Get public instructor list (active instructors only)
 * @async
 * @function getPublicInstructors
 * @description Retrieves all active instructors/faculty members for public display.
 * Results are ordered with board members first, then by ID (newest first).
 * Only includes essential public information, excluding sensitive data like email and phone.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with active instructors or error
 */
const getPublicInstructors = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id, 
        faculty_id, 
        name, 
        department, 
        designation, 
        avatar, 
        experience, 
        bio,                  
        board_member
       FROM faculties
       WHERE status = 'active'
       ORDER BY board_member DESC, id DESC`
    );
    
    console.log(`Fetched ${result.rows.length} active instructors`);
    
    // Debug logging for bio field inclusion
    if (result.rows.length > 0) {
      const sampleWithBio = result.rows.find(r => r.bio);
      if (sampleWithBio) {
        console.log('Sample instructor with bio:', {
          name: sampleWithBio.name,
          bio_length: sampleWithBio.bio ? sampleWithBio.bio.length : 0,
          board_member: sampleWithBio.board_member
        });
      }
    }
    
    return res.json(result.rows);
  } catch (err) {
    console.error('Error fetching instructors:', err);
    
    // Prevent duplicate headers if response already sent
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to fetch instructors' });
    }
  }
};

module.exports = { 
  getPublicInstructors 
};
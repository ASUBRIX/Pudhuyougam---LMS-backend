const { query } = require('../../config/database');

/**
 * @fileoverview Admin Enquiry Controller - Handles enquiry management for administrators
 * @description This controller provides administrative functions for managing enquiries,
 * allowing admins to view and manage all enquiry submissions in the system.
 */

/**
 * Get all enquiries (Admin only)
 * @async
 * @function getAllEnquiries
 * @description Retrieves all enquiries from the database, ordered by creation date (newest first).
 * This endpoint is restricted to admin users only and provides full access to all enquiry data
 * including sensitive information for administrative purposes.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware (must have admin role)
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with all enquiries or error
 */
const getAllEnquiries = async (req, res) => {
  try {
    // Query to get all enquiries with full details
    const result = await query(`
      SELECT 
        id,
        name,
        email,
        phone,
        subject,
        message,
        created_at,
        updated_at
      FROM enquiries 
      ORDER BY created_at DESC
    `);

    // Log for admin monitoring (optional)
    console.log(`Admin ${req.user?.id} retrieved ${result.rows.length} enquiries`);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all enquiries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { 
  getAllEnquiries 
};
const { query } = require('../../config/database');

/**
 * @fileoverview User Enquiry Controller - Handles enquiry submissions and prefill data
 * @description This controller manages enquiry-related functionality for users,
 * including submitting new enquiries and retrieving user data for form prefilling.
 */

/**
 * Submit new enquiry (Public endpoint)
 * @async
 * @function createEnquiry
 * @description Creates a new enquiry submission in the database. This is a public endpoint
 * that allows anyone to submit an enquiry without authentication. All fields are required.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.name - Full name of the person making the enquiry
 * @param {string} req.body.email - Email address of the enquirer (must be valid email format)
 * @param {string} req.body.phone - Phone number of the enquirer
 * @param {string} req.body.subject - Subject/topic of the enquiry
 * @param {string} req.body.message - Detailed message or enquiry content
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with created enquiry data or error
 */
const createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Validate all required fields
    if (!name || !email || !phone || !message || !subject) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    // Trim and validate field lengths
    const trimmedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim()
    };

    if (trimmedData.name.length > 255 || trimmedData.subject.length > 255) {
      return res.status(400).json({ error: 'Name and subject must be less than 255 characters' });
    }

    if (trimmedData.message.length > 2000) {
      return res.status(400).json({ error: 'Message must be less than 2000 characters' });
    }

    const result = await query(
      `INSERT INTO enquiries (name, email, phone, subject, message) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [trimmedData.name, trimmedData.email, trimmedData.phone, trimmedData.subject, trimmedData.message]
    );

    res.status(201).json({
      message: 'Enquiry submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user prefill details for enquiry form (Authenticated endpoint)
 * @async
 * @function getEnquiryPrefillDetails
 * @description Retrieves authenticated user's profile data to prefill the enquiry form.
 * This helps improve user experience by auto-populating known user information.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware
 * @param {number} req.user.id - User ID from JWT token
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with user prefill data or error
 */
const getEnquiryPrefillDetails = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const result = await query(
      `SELECT 
         CASE 
           WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
           THEN first_name || ' ' || last_name
           WHEN first_name IS NOT NULL 
           THEN first_name
           ELSE 'User'
         END AS name,
         email,
         phone_number AS phone
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clean up the response data
    const userData = result.rows[0];
    const prefillData = {
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || ''
    };

    res.status(200).json(prefillData);
  } catch (error) {
    console.error('Error fetching prefill data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createEnquiry,
  getEnquiryPrefillDetails
};
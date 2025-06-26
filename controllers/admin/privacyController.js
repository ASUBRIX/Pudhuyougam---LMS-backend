const TermsConditions = require('../../models/termsConditions');
const { validationResult } = require('express-validator');

/**
 * @fileoverview Admin Privacy Controller - Handles Privacy Policy management for administrators
 * @description This controller provides administrative functions for managing Privacy Policy documents,
 * including viewing current policies, accessing version history, and updating policies.
 * All endpoints require admin authentication.
 */

/**
 * Get current Privacy Policy (Admin endpoint)
 * @async
 * @function getPrivacyPolicy
 * @description Retrieves the currently active Privacy Policy document for administrative purposes.
 * This endpoint provides the same data as the public endpoint but is intended for admin use
 * and may include additional metadata in the future.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware (must have admin role)
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with active privacy policy or error
 */
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await TermsConditions.getPrivacyPolicy();
    
    if (!policy) {
      return res.status(404).json({ 
        error: 'Privacy policy not found' 
      });
    }

    console.log(`Admin ${req.user?.id} retrieved current privacy policy:`, {
      id: policy.id,
      version: policy.version,
      is_active: policy.is_active
    });

    res.json(policy);
  } catch (err) {
    console.error('Error fetching privacy policy for admin:', err);
    res.status(500).json({ error: 'Failed to fetch privacy policy' });
  }
};

/**
 * Get all Privacy Policy versions (Admin endpoint)
 * @async
 * @function getAllPrivacyPolicies
 * @description Retrieves all versions of Privacy Policy documents including inactive/historical versions.
 * This endpoint allows administrators to view the complete version history and track changes
 * over time for compliance and auditing purposes.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware (must have admin role)
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with all privacy policy versions or error
 */
exports.getAllPrivacyPolicies = async (req, res) => {
  try {
    const versions = await TermsConditions.getAllPrivacyPolicies();
    
    console.log(`Admin ${req.user?.id} retrieved ${versions.length} privacy policy versions`);

    res.json(versions);
  } catch (err) {
    console.error('Error fetching all privacy policy versions:', err);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
};

/**
 * Update Privacy Policy (Admin endpoint)
 * @async
 * @function updatePrivacyPolicy
 * @description Updates the Privacy Policy document by creating a new version and marking it as active.
 * The previous version is kept for historical purposes. Input validation ensures content is provided.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware (must have admin role)
 * @param {string} req.body.content - The new content for the privacy policy (HTML or text)
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with updated privacy policy or error
 */
exports.updatePrivacyPolicy = async (req, res) => {
  // Check for validation errors from express-validator middleware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content } = req.body;
    
    // Additional validation for content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Privacy policy content cannot be empty' 
      });
    }

    // Trim and validate content length (optional - adjust based on your requirements)
    const trimmedContent = content.trim();
    if (trimmedContent.length > 100000) { // 100KB limit example
      return res.status(400).json({ 
        error: 'Privacy policy content is too long (maximum 100,000 characters)' 
      });
    }

    const updated = await TermsConditions.updatePrivacyPolicy(trimmedContent);
    
    console.log(`Admin ${req.user?.id} updated privacy policy:`, {
      new_id: updated.id,
      new_version: updated.version,
      content_length: updated.content ? updated.content.length : 0
    });

    res.json({ 
      message: 'Privacy policy updated successfully', 
      policy: updated 
    });
  } catch (err) {
    console.error('Error updating privacy policy:', err);
    
    // Handle specific database errors if needed
    if (err.code === '23505') { // Unique constraint violation (if applicable)
      return res.status(400).json({ 
        error: 'Version conflict. Please try again.' 
      });
    }

    res.status(500).json({ error: 'Failed to update privacy policy' });
  }
};
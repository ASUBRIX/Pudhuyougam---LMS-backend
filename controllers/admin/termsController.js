const TermsConditions = require('../../models/termsConditions');
const { validationResult } = require('express-validator');

/**
 * @fileoverview Admin Terms Controller - Handles Terms & Conditions management for administrators
 * @description This controller provides administrative functions for managing Terms & Conditions documents,
 * including viewing current terms, accessing version history, and updating terms.
 * All endpoints require admin authentication.
 */

/**
 * Get current Terms and Conditions (Admin endpoint)
 * @async
 * @function getTerms
 * @description Retrieves the currently active Terms and Conditions document for administrative purposes.
 * This endpoint provides the same data as the public endpoint but is intended for admin use
 * and may include additional metadata in the future.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware (must have admin role)
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with active terms document or error
 */
exports.getTerms = async (req, res) => {
  try {
    const terms = await TermsConditions.getTerms();
    
    if (!terms) {
      return res.status(404).json({ 
        error: 'Terms and conditions not found' 
      });
    }

    console.log(`Admin ${req.user?.id} retrieved current terms:`, {
      id: terms.id,
      version: terms.version,
      is_active: terms.is_active
    });

    res.json(terms);
  } catch (err) {
    console.error('Error fetching terms for admin:', err);
    res.status(500).json({ error: 'Failed to fetch terms and conditions' });
  }
};

/**
 * Get all Terms and Conditions versions (Admin endpoint)
 * @async
 * @function getAllTerms
 * @description Retrieves all versions of Terms and Conditions documents including inactive/historical versions.
 * This endpoint allows administrators to view the complete version history and track changes
 * over time for compliance and auditing purposes.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware (must have admin role)
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with all terms versions or error
 */
exports.getAllTerms = async (req, res) => {
  try {
    const versions = await TermsConditions.getAllTerms();
    
    console.log(`Admin ${req.user?.id} retrieved ${versions.length} terms versions`);

    res.json(versions);
  } catch (err) {
    console.error('Error fetching all terms versions:', err);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
};

/**
 * Update Terms and Conditions (Admin endpoint)
 * @async
 * @function updateTerms
 * @description Updates the Terms and Conditions document by creating a new version and marking it as active.
 * The previous version is kept for historical purposes. Input validation ensures content is provided.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware (must have admin role)
 * @param {string} req.body.content - The new content for the terms and conditions (HTML or text)
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with updated terms document or error
 */
exports.updateTerms = async (req, res) => {
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
        error: 'Terms and conditions content cannot be empty' 
      });
    }

    // Trim and validate content length (optional - adjust based on your requirements)
    const trimmedContent = content.trim();
    if (trimmedContent.length > 100000) { // 100KB limit example
      return res.status(400).json({ 
        error: 'Terms and conditions content is too long (maximum 100,000 characters)' 
      });
    }

    const updated = await TermsConditions.updateTerms(trimmedContent);
    
    console.log(`Admin ${req.user?.id} updated terms and conditions:`, {
      new_id: updated.id,
      new_version: updated.version,
      content_length: updated.content ? updated.content.length : 0
    });

    res.json({ 
      message: 'Terms and conditions updated successfully', 
      terms: updated 
    });
  } catch (err) {
    console.error('Error updating terms and conditions:', err);
    
    // Handle specific database errors if needed
    if (err.code === '23505') { // Unique constraint violation (if applicable)
      return res.status(400).json({ 
        error: 'Version conflict. Please try again.' 
      });
    }

    res.status(500).json({ error: 'Failed to update terms and conditions' });
  }
};
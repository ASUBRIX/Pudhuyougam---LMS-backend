const TermsConditions = require('../../models/termsConditions');

/**
 * @fileoverview User Legal Controller - Handles public legal document retrieval
 * @description This controller manages the public-facing legal document functionality,
 * providing endpoints for retrieving active Terms & Conditions and Privacy Policy
 * documents for display to all users without authentication.
 */

/**
 * Get active Terms and Conditions (Public endpoint)
 * @async
 * @function getTerms
 * @description Retrieves the currently active Terms and Conditions document for public display.
 * This endpoint is accessible to all users without authentication and returns only the
 * currently active version of the terms.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with active terms document or error
 */
exports.getTerms = async (req, res) => {
  try {
    const terms = await TermsConditions.getTerms();
    
    if (!terms) {
      return res.status(404).json({ 
        message: 'Terms and conditions not found. Please contact support.' 
      });
    }

    console.log('Public terms retrieved:', {
      id: terms.id,
      version: terms.version,
      content_length: terms.content ? terms.content.length : 0
    });

    res.json(terms);
  } catch (err) {
    console.error('Error fetching public terms:', err);
    res.status(500).json({ message: 'Failed to fetch terms and conditions' });
  }
};

/**
 * Get active Privacy Policy (Public endpoint)
 * @async
 * @function getPrivacyPolicy
 * @description Retrieves the currently active Privacy Policy document for public display.
 * This endpoint is accessible to all users without authentication and returns only the
 * currently active version of the privacy policy.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with active privacy policy document or error
 */
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await TermsConditions.getPrivacyPolicy();
    
    if (!policy) {
      return res.status(404).json({ 
        message: 'Privacy policy not found. Please contact support.' 
      });
    }

    console.log('Public privacy policy retrieved:', {
      id: policy.id,
      version: policy.version,
      content_length: policy.content ? policy.content.length : 0
    });

    res.json(policy);
  } catch (err) {
    console.error('Error fetching public privacy policy:', err);
    res.status(500).json({ message: 'Failed to fetch privacy policy' });
  }
};
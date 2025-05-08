const express = require('express');
const router = express.Router();
const TermsConditions = require('../models/termsConditions');
const { auth, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');


// Get current terms and conditions
router.get('/terms', async (req, res) => {
    try {
        const terms = await TermsConditions.getTerms();
        res.json(terms);
    } catch (error) {
        console.error('Error fetching terms and conditions:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get all terms and conditions versions (admin only)
router.get('/terms/versions', auth, requireAdmin, async (req, res) => {
    try {
        const terms = await TermsConditions.getAllTerms();
        res.json(terms);
    } catch (error) {
        console.error('Error fetching all terms and conditions:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Update terms and conditions (admin only)
router.put('/terms', [
    auth, 
    requireAdmin,
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content } = req.body;
        const terms = await TermsConditions.updateTerms(content);
        
        res.json({
            message: 'Terms and conditions updated successfully',
            terms
        });
    } catch (error) {
        console.error('Error updating terms and conditions:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get privacy policy
router.get('/privacy', async (req, res) => {
    try {
        const policy = await TermsConditions.getPrivacyPolicy();
        res.json(policy);
    } catch (error) {
        console.error('Error fetching privacy policy:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get all privacy policy versions (admin only)
router.get('/privacy/versions', auth, requireAdmin, async (req, res) => {
    try {
        const policies = await TermsConditions.getAllPrivacyPolicies();
        res.json(policies);
    } catch (error) {
        console.error('Error fetching all privacy policies:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Update privacy policy (admin only)
router.put('/privacy', [
    auth, 
    requireAdmin,
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content } = req.body;
        const policy = await TermsConditions.updatePrivacyPolicy(content);
        
        res.json({
            message: 'Privacy policy updated successfully',
            policy
        });
    } catch (error) {
        console.error('Error updating privacy policy:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

module.exports = router; 
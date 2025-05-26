const TermsConditions = require('../../models/termsConditions');
const { validationResult } = require('express-validator');

// Get current terms and conditions
const getTerms = async (req, res) => {
    try {
        const terms = await TermsConditions.getTerms();
        res.json(terms);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};

// Get all terms and conditions versions (admin only)
const getAllTerms = async (req, res) => {
    try {
        const terms = await TermsConditions.getAllTerms();
        res.json(terms);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};

// Update terms and conditions (admin only)
const updateTerms = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { content } = req.body;
        const terms = await TermsConditions.updateTerms(content);
        res.json({
            message: 'Terms and conditions updated successfully',
            terms
        });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};

// Get privacy policy
const getPrivacyPolicy = async (req, res) => {
    try {
        const policy = await TermsConditions.getPrivacyPolicy();
        res.json(policy);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};

// Get all privacy policy versions (admin only)
const getAllPrivacyPolicies = async (req, res) => {
    try {
        const policies = await TermsConditions.getAllPrivacyPolicies();
        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};

// Update privacy policy (admin only)
const updatePrivacyPolicy = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { content } = req.body;
        const policy = await TermsConditions.updatePrivacyPolicy(content);
        res.json({
            message: 'Privacy policy updated successfully',
            policy
        });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};

module.exports = {
    getTerms,
    getAllTerms,
    updateTerms,
    getPrivacyPolicy,
    getAllPrivacyPolicies,
    updatePrivacyPolicy
};

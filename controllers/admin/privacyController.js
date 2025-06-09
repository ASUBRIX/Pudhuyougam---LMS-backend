const TermsConditions = require('../../models/termsConditions');
const { validationResult } = require('express-validator');

exports.getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await TermsConditions.getPrivacyPolicy();
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch privacy policy' });
  }
};

exports.getAllPrivacyPolicies = async (req, res) => {
  try {
    const versions = await TermsConditions.getAllPrivacyPolicies();
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
};

exports.updatePrivacyPolicy = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { content } = req.body;
    const updated = await TermsConditions.updatePrivacyPolicy(content);
    res.json({ message: 'Privacy policy updated successfully', policy: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update privacy policy' });
  }
};

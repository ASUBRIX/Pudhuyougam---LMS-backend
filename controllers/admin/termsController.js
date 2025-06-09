const TermsConditions = require('../../models/termsConditions');
const { validationResult } = require('express-validator');

exports.getTerms = async (req, res) => {
  try {
    const terms = await TermsConditions.getTerms();
    res.json(terms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch terms and conditions' });
  }
};

exports.getAllTerms = async (req, res) => {
  try {
    const versions = await TermsConditions.getAllTerms();
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
};

exports.updateTerms = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { content } = req.body;
    const updated = await TermsConditions.updateTerms(content);
    res.json({ message: 'Terms and conditions updated successfully', terms: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update terms and conditions' });
  }
};

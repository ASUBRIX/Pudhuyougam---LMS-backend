const TermsConditions = require('../../models/termsConditions');

// Public: Get active Terms
exports.getTerms = async (req, res) => {
  try {
    const terms = await TermsConditions.getTerms();
    res.json(terms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch terms and conditions' });
  }
};

// Public: Get active Privacy Policy
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await TermsConditions.getPrivacyPolicy();
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch privacy policy' });
  }
};

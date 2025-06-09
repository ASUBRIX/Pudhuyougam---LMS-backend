const express = require('express');
const router = express.Router();
const controller = require('../../controllers/user/legalController');

// Public-facing routes
router.get('/terms', controller.getTerms);
router.get('/privacy', controller.getPrivacyPolicy);

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const { body } = require('express-validator');
const termsController = require('../../controllers/admin/termsController');






// Public: Get current terms and privacy policy
router.get('/', termsController.getTerms);
router.get('/privacy', termsController.getPrivacyPolicy);
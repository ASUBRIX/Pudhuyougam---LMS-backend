const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const { body } = require('express-validator');
const termsController = require('../../controllers/admin/termsController');

// Public: Get current terms and privacy policy
router.get('/', termsController.getTerms);
router.get('/privacy', termsController.getPrivacyPolicy);

// Admin: Get all versions, update
router.get('/terms/versions', auth, requireAdmin, termsController.getAllTerms);
router.put('/terms',auth,requireAdmin,body('content').notEmpty().withMessage('Content is required'),termsController.updateTerms);

router.get('/privacy/versions', auth, requireAdmin, termsController.getAllPrivacyPolicies);
router.put('/privacy',auth,requireAdmin,body('content').notEmpty().withMessage('Content is required'),termsController.updatePrivacyPolicy);

module.exports = router;

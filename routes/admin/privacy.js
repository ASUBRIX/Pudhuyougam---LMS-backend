const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const { body } = require('express-validator');
const controller = require('../../controllers/admin/privacyController');

router.get('/', controller.getPrivacyPolicy);
router.get('/versions', auth, requireAdmin, controller.getAllPrivacyPolicies);
router.put(
  '/',
  auth,
  requireAdmin,
  body('content').notEmpty().withMessage('Content is required'),
  controller.updatePrivacyPolicy
);

module.exports = router;

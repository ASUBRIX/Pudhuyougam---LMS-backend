const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const enquiryController = require('../../controllers/admin/enquiryController');

// Admin: Get all enquiries
router.use(auth, requireAdmin);
router.get('/', enquiryController.getAllEnquiries);

module.exports = router;

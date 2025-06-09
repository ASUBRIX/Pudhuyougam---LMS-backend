const express = require('express');
const router = express.Router();
const { createEnquiry, getEnquiryPrefillDetails } = require('../../controllers/user/enquiryController');
const { auth } = require('../../middleware/auth');

// Submit enquiry
router.post('/', createEnquiry);

// Fetch enquiry form prefill data
router.get('/prefill', auth, getEnquiryPrefillDetails);

module.exports = router;

const express = require('express');
const router = express.Router();
const enquiryController = require('../../controllers/user/enquiryController');

// Public: Submit new enquiry
router.post('/', enquiryController.createEnquiry);

module.exports = router;

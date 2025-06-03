const express = require('express');
const router = express.Router();
const enquiryController = require('../../controllers/user/enquiryController');
const {auth} = require("../../middleware/auth");

router.use(auth);

// Submit new enquiry
router.post('/', enquiryController.createEnquiry);

module.exports = router;

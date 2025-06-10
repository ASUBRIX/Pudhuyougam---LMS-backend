const express = require('express');
const router = express.Router();
const instructorController = require('../../controllers/user/instructorController');

// Public: Get all active instructors
router.get('/', instructorController.getPublicInstructors);

module.exports = router;



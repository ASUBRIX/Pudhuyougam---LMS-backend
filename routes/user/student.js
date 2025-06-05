const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const studentController = require('../../controllers/user/studentController');

// Get student profile
router.get('/', auth,studentController.getProfile);

// Update student profile
router.put('/', auth, studentController.updateProfile);

module.exports = router;



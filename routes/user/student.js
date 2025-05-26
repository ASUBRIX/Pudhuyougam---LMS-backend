const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const studentController = require('../../controllers/user/studentController');

// Get student profile
router.get('/profile', auth, studentController.getProfile);

// Update student profile
router.put('/profile', auth, studentController.updateProfile);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../../middleware/auth');
const studentController = require('../../controllers/user/studentController');

const upload = multer();

// Get student profile
router.get('/', auth,studentController.getProfile);

// Update student profile
router.put('/', auth,upload.single('profile_picture'), studentController.updateProfile);

module.exports = router;



const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user/userController");
const { auth } = require("../../middleware/auth");


// Get current user's profile
router.get('/',auth,userController.getProfile);

// Update profile (first name, last name, phone, etc.)
router.put('/', userController.updateProfile);

// Change email
router.put('/', userController.changeEmail);

// Change password
router.put('/', userController.changePassword);



module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');
const { auth, requireAdmin } = require('../../middleware/auth');

// Public routes

router.post("/check-user", userController.checkUser);
router.post('/register', userController.register);

// Protected Routes for users
router.use(auth);
router.get('/', requireAdmin, userController.getAllUsers);
router.get('/me', userController.getProfile);

module.exports = router;

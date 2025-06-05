const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');
const { auth, requireAdmin } = require('../../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login/email', userController.loginWithEmail);
router.post('/login/otp/request', userController.requestOTP);
router.post('/login/otp/verify', userController.verifyOTP);
router.post("/check-user", userController.checkUser);

// Protected routes after login
router.use(auth);


router.get('/', requireAdmin, userController.getAllUsers);
router.get('/me', userController.getProfile);

module.exports = router;

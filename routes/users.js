//routes/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Student = require('../models/student');
const { auth, requireAdmin } = require('../middleware/auth');

// ✅ Register user
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password_hash, phone_number, role } = req.body;

    if (!first_name || !last_name || !email || !password_hash) {
      return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) return res.status(400).json({ error: 'Email already exists.' });

    const existingPhone = await User.findByPhone(phone_number);
    if (existingPhone) return res.status(400).json({ error: 'Phone number already exists.' });

    // Create user in users table
    const user = await User.create({ first_name, last_name, email, password_hash, phone_number, role });
    
    // If role is student, also create record in students table
    if (role === 'student') {
      // Create student record
      try {
        await Student.create({
          userId: user.id,
          firstName: first_name,
          lastName: last_name,
          email: email,
          phone: phone_number,
          enrollmentDate: new Date(),
          status: 'active'
        });
      } catch (studentErr) {
        console.error('Error creating student record:', studentErr);
        // If student creation fails, we should handle this situation
        // You may want to delete the user or take other appropriate action
        return res.status(500).json({ error: 'Failed to create student record. User was created but student profile failed.' });
      }
    }
    
    res.status(201).json(user);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'User registration failed.' });
  }
});

// ✅ Email/Password login
router.post('/login/email', async (req, res) => {
  try {
    const { email, password_hash } = req.body;

    if (!email || !password_hash) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await User.verifyEmailPassword(email, password_hash);

    if (!result) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.status(200).json(result); // { auth_key, user }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// ✅ OTP generation
router.post('/login/otp/request', async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const user = await User.findByPhone(phone_number);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const otp = await User.generateOTP(phone_number);
    res.status(200).json({ message: 'OTP sent', otp }); // Don't return OTP in production
  } catch (err) {
    console.error('OTP error:', err);
    res.status(500).json({ error: 'OTP generation failed.' });
  }
});

// ✅ OTP verification
router.post('/login/otp/verify', async (req, res) => {
  try {
    const { phone_number, otp } = req.body;

    if (!phone_number || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required.' });
    }

    const result = await User.verifyOTP(phone_number, otp);

    if (!result) {
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    res.status(200).json(result); // { auth_key, user }
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'OTP verification failed.' });
  }
});

// ✅ Middleware for protected routes (after login)
router.use(auth);

// ✅ Get all users (admin only example)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ✅ Get profile
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // req.user set by auth middleware
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

module.exports = router;

const User = require("../../models/user");
const Student = require("../../models/student");
const { sendOTP } = require("../../config/sms");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { query } = require('../../config/database');

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_fallback";

// Send OTP for Mobile Login/Register
const requestOTP = async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number)
      return res.status(400).json({ error: "Phone number is required." });
    const otp = await User.generateOTP(phone_number);
    await sendOTP(phone_number, otp);
    res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    console.error("OTP request error:", err);
    res.status(500).json({ error: "OTP generation failed." });
  }
};

// Verify OTP for mobile login/register
const verifyOTP = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;
    if (!phone_number || !otp)
      return res.status(400).json({ error: "Phone number and OTP are required." });

    const result = await User.verifyOTP(phone_number, otp);
    if (!result) return res.status(401).json({ error: "Invalid or expired OTP." });

    if (result.user && result.user.first_name) {
      // User exists, create JWTs
      const accessToken = User.generateAccessToken(result.user);
      const refreshToken = User.generateRefreshToken(result.user);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ user: result.user, accessToken });
    } else {
      res.status(200).json({ exists: false, phone_number });
    }
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ error: "OTP verification failed." });
  }
};

// Register user (after OTP for new users)
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password_hash, phone_number, role } = req.body;
    if (!first_name || !last_name || !email || !password_hash) {
      return res.status(400).json({
        error: "First name, last name, email, and password are required.",
      });
    }
    const existingEmail = await User.findByEmail(email);
    if (existingEmail)
      return res.status(400).json({ error: "Email already exists." });

    const existingPhone = await User.findByPhone(phone_number);
    if (existingPhone && existingPhone.first_name)
      return res.status(400).json({ error: "Phone number already exists." });

    // Create new user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone_number,
      role: role || "student",
    });

    // Create new student if role is student
    if (user.role === "student") {
      await Student.create({
        userId: user.id,
        firstName: first_name,
        lastName: last_name,
        email,
        phone: phone_number,
        enrollmentDate: new Date(),
        status: "active",
        program: "",
        semester: "",
        year: "",
        courses: null,
      });
    }

    const accessToken = User.generateAccessToken(user);
    
    const refreshToken = User.generateRefreshToken(user);
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ user, accessToken });
  } catch (err) {
    console.error("User registration error:", err);
    res.status(500).json({ error: "User registration failed." });
  }
};

// Login with email
const loginWithEmail = async (req, res) => {
  try {
    const { email, password_hash } = req.body;
    if (!email || !password_hash) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const result = await User.verifyEmailPassword(email, password_hash);
    if (!result) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const accessToken = User.generateAccessToken(result.user);
    console.log("access token:",accessToken);
    
    const refreshToken = User.generateRefreshToken(result.user);
    console.log("refresh token:",refreshToken);
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    console.log("user log in",result.user);
    console.log("access token",accessToken);
    
    
    res.status(200).json({ user: result.user, accessToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
};

// Refresh token endpoint
const refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });
  try {
    const userData = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const newAccessToken = User.generateAccessToken(userData);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

// Get all users (for admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  console.log("Get profile function executed");
  
  try {
    const userId = req.user?.id || req.userId;
    console.log('user id:',userId);
    
    const result = await query(
      `SELECT 
        u.id AS user_id,
        u.first_name AS user_first_name,
        u.last_name AS user_last_name,
        u.email AS user_email,
        u.phone_number AS user_phone_number,
        u.role,
        s.id AS student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.enrollment_date,
        s.program,
        s.semester,
        s.year,
        s.status,
        s.courses,
        s.created_at,
        s.updated_at
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.id = $1`,
      [userId]
    );

    console.log("result",result);
    
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    // Get all possible fields from the request body
    const {
      first_name, last_name, email, phone_number,       // user table
      student_first_name, student_last_name, student_email, student_phone,
      enrollment_date, program, semester, year, status, courses // student table
    } = req.body;

    // 1. Update users table
    const userUpdate = await query(
      `UPDATE users SET 
        first_name = $1, 
        last_name = $2, 
        email = $3, 
        phone_number = $4, 
        updated_at = NOW()
       WHERE id = $5 
       RETURNING id, first_name, last_name, email, phone_number, role`,
      [first_name, last_name, email, phone_number, userId]
    );
    if (!userUpdate.rows.length) return res.status(404).json({ error: 'User not found' });

    // 2. Update students table (only if a student record exists)
    const studentResult = await query(
      `UPDATE students SET 
        first_name = $1,
        last_name = $2,
        email = $3,
        phone = $4,
        enrollment_date = $5,
        program = $6,
        semester = $7,
        year = $8,
        status = $9,
        courses = $10,
        updated_at = NOW()
      WHERE user_id = $11
      RETURNING *`,
      [
        student_first_name,
        student_last_name,
        student_email,
        student_phone,
        enrollment_date,
        program,
        semester,
        year,
        status,
        courses,
        userId
      ]
    );

    // Respond with the updated user and student data
    res.status(200).json({
      user: userUpdate.rows[0],
      student: studentResult.rows[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Change email
const changeEmail = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { email } = req.body;
    const check = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (check.rows.length) return res.status(409).json({ error: 'Email already in use' });

    const result = await query(
      'UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING id, first_name, last_name, email, phone_number, role',
      [email, userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { currentPassword, newPassword } = req.body;

    const userRes = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (!userRes.rows.length) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!match) return res.status(400).json({ error: 'Incorrect current password' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  requestOTP,
  verifyOTP,
  register,
  loginWithEmail,
  refreshAccessToken,
  getAllUsers,
  getProfile,
  updateProfile,
  changeEmail,
  changePassword
};

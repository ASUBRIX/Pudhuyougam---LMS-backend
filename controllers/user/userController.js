const User = require("../../models/user");
const Student = require("../../models/student");
const jwt = require("jsonwebtoken");
const { query } = require("../../config/database");
const admin = require("../../config/firebaseAdmin");
const generateEnrollmentId = require("../../utils/generateEnrollmentId");

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_fallback";

/**
 * Check if user exists using Firebase idToken and phone number
 * 
 * @description Verifies Firebase ID token, checks phone number match, and returns user + access token if exists
 * @route POST /api/users/check-user
 * @access Public
 * @param {string} req.body.phone_number - User's phone number
 * @param {string} req.body.idToken - Firebase ID token for verification
 * @returns {Object} User object and access token if user exists and has profile data
 * @returns {Object} Empty object if user doesn't exist or incomplete profile
 * @returns {Object} Error object on verification failure
 */
const checkUser = async (req, res) => {
  const { phone_number, idToken } = req.body;
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebasePhone = decodedToken.phone_number;
    
    if (!firebasePhone || firebasePhone !== phone_number) {
      return res.status(400).json({ 
        error: "Phone number mismatch or not verified." 
      });
    }
    
    const user = await User.findByPhone(firebasePhone);
    
    if (user && user.first_name) {
      const accessToken = User.generateAccessToken(user);
      return res.json({ user, accessToken });
    } else {
      return res.json({});
    }
    
  } catch (err) {
    console.error("checkUser error:", err);
    res.status(401).json({ 
      error: "Invalid token or user check failed." 
    });
  }
};

/**
 * Register user (after OTP verification for new users)
 * 
 * @description Creates new user account and student profile if role is student. Sets refresh token cookie.
 * @route POST /api/users/register
 * @access Public
 * @param {string} req.body.first_name - User's first name (required)
 * @param {string} req.body.last_name - User's last name (required)
 * @param {string} req.body.email - User's email address (required)
 * @param {string} req.body.password_hash - Hashed password (required)
 * @param {string} req.body.phone_number - User's phone number
 * @param {string} req.body.role - User's role (defaults to "student")
 * @returns {Object} User object and access token on success
 * @returns {Object} Error object on validation failure or duplicate data
 */
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password_hash, phone_number, role } = req.body;
    
    if (!first_name || !last_name || !email || !password_hash) {
      return res.status(400).json({
        error: "First name, last name, email, and password are required.",
      });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const existingPhone = await User.findByPhone(phone_number);
    if (existingPhone && existingPhone.first_name) {
      return res.status(400).json({ error: "Phone number already exists." });
    }

    const user = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone_number,
      role: role || "student",
    });

    if (user.role === "student") {
     
      let existingStudent = await Student.findByUserId(user.id);
      if (!existingStudent) {
        existingStudent = await Student.findByPhone(phone_number);
      }
      
      if (!existingStudent) {
        const enrollmentId = await generateEnrollmentId();

       const newStudent =  await Student.create({
          userId: user.id,
          firstName: first_name,
          lastName: last_name,
          email,
          phone: phone_number,
          enrollmentDate: new Date(),
          status: "active",
          program: "",
          semester: null,
          year: null,
          courses: null,
          enrollmentId,
          
        });
    console.log("New student created:", newStudent);
      } else {
        await Student.update(existingStudent.id, {
          ...existingStudent,
          userId: user.id,
          firstName: first_name,
          lastName: last_name,
          email
        });
      }
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

/**
 * Refresh access token using refresh token from cookie
 * 
 * @description Validates refresh token from HTTP-only cookie and generates new access token
 * @route POST /api/users/refresh-token (not shown in routes but available)
 * @access Public (but requires valid refresh token cookie)
 * @returns {Object} New access token on success
 * @returns {Object} Error object on invalid/expired refresh token
 */
const refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }
  
  try {
    const userData = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const newAccessToken = User.generateAccessToken(userData);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

/**
 * Get all users (for admin only)
 * 
 * @description Retrieves all users in the system. Protected by admin middleware.
 * @route GET /api/users
 * @access Protected (Admin only)
 * @returns {Array} Array of all user objects
 * @returns {Object} Error object on failure
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

/**
 * Get current user profile with student details
 * 
 * @description Retrieves authenticated user's profile with LEFT JOIN to student data
 * @route GET /api/users/me
 * @access Protected (Authenticated users)
 * @returns {Object} Combined user and student profile data
 * @returns {Object} Error object if user not found
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

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
        s.enrollment_id,
        s.created_at,
        s.updated_at
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.id = $1`,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(result.rows[0]);
    
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update user and student profile
 * 
 * @description Updates both users and students table data for authenticated user
 * @route PUT /api/users/me (not shown in routes but available)
 * @access Protected (Authenticated users)
 * @param {Object} req.body - User and student data to update
 * @returns {Object} Updated user and student objects
 * @returns {Object} Error object on failure
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const {
      first_name,
      last_name,
      email,
      phone_number,
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
    } = req.body;

    const userUpdate = await query(
      `UPDATE users SET 
        first_name = $1, last_name = $2, email = $3, phone_number = $4, updated_at = NOW()
       WHERE id = $5 RETURNING id, first_name, last_name, email, phone_number, role`,
      [first_name, last_name, email, phone_number, userId]
    );

    if (!userUpdate.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const studentResult = await query(
      `UPDATE students SET 
        first_name = $1, last_name = $2, email = $3, phone = $4, enrollment_date = $5,
        program = $6, semester = $7, year = $8, status = $9, courses = $10, updated_at = NOW()
       WHERE user_id = $11 RETURNING *`,
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
        userId,
      ]
    );

    res.status(200).json({
      user: userUpdate.rows[0],
      student: studentResult.rows[0] || null,
    });
    
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get contact form prefill details
 * 
 * @description Retrieves user's basic info for prefilling contact forms
 * @route GET /api/users/contact-prefill (not shown in routes but available)
 * @access Protected (Authenticated users)
 * @returns {Object} User's name, email, and phone for form prefill
 * @returns {Object} Error object on failure
 */
const getContactPrefillDetails = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const result = await query(
      `SELECT first_name AS name, email, phone_number AS phone FROM users WHERE id = $1`,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(result.rows[0]);
    
  } catch (err) {
    console.error("Contact prefill error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  register,
  refreshAccessToken,
  getAllUsers,
  getProfile,
  updateProfile,
  checkUser,
  getContactPrefillDetails,
};
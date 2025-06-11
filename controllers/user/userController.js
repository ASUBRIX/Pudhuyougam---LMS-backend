const User = require("../../models/user");
const Student = require("../../models/student");
const { sendOTP } = require("../../config/sms");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { query } = require("../../config/database");
const admin = require("../../config/firebaseAdmin");

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_fallback";

// ✅ Check if user exists using Firebase idToken and phone number
const checkUser = async (req, res) => {
  const { phone_number, idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebasePhone = decodedToken.phone_number;
    if (!firebasePhone || firebasePhone !== phone_number) {
      return res.status(400).json({ error: "Phone number mismatch or not verified." });
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
    res.status(401).json({ error: "Invalid token or user check failed." });
  }
};

// ✅ Register user (after OTP for new users)
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password_hash, phone_number, role } = req.body;
    if (!first_name || !last_name || !email || !password_hash) {
      return res.status(400).json({
        error: "First name, last name, email, and password are required.",
      });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) return res.status(400).json({ error: "Email already exists." });

    const existingPhone = await User.findByPhone(phone_number);
    if (existingPhone && existingPhone.first_name) return res.status(400).json({ error: "Phone number already exists." });

    const user = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone_number,
      role: role || "student",
    });

    if (user.role === "student") {
      const student = await Student.create({
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

      // Add STUxxx enrollment ID
      await query("UPDATE students SET enrollment_id = $1 WHERE id = $2", [
        `STU${String(student.id).padStart(3, "0")}`,
        student.id,
      ]);
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

// ✅ Refresh token endpoint
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

// ✅ Get all users (for admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

// ✅ Get current user profile
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
        s.created_at,
        s.updated_at
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.id = $1`,
      [userId]
    );

    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update user + student profile
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

    if (!userUpdate.rows.length) return res.status(404).json({ error: "User not found" });

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
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Prefill Contact Form
const getContactPrefillDetails = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const result = await query(
      `SELECT first_name AS name, email, phone_number AS phone FROM users WHERE id = $1`,
      [userId]
    );

    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
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

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');
const { auth, requireAdmin } = require('../../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckUserRequest:
 *       type: object
 *       required:
 *         - phone_number
 *         - idToken
 *       properties:
 *         phone_number:
 *           type: string
 *           description: User's phone number (must match Firebase token)
 *           example: "+919876543210"
 *         idToken:
 *           type: string
 *           description: Firebase ID token for phone verification
 *           example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjA..."
 * 
 *     CheckUserResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         accessToken:
 *           type: string
 *           description: JWT access token for authenticated requests
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 *     UserRegistrationRequest:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - password_hash
 *       properties:
 *         first_name:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         last_name:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password_hash:
 *           type: string
 *           description: Hashed password
 *           example: "$2a$10$..."
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *           example: "+919876543210"
 *         role:
 *           type: string
 *           enum: [student, instructor]
 *           default: "student"
 *           description: User's role in the system
 *           example: "student"
 * 
 *     RegistrationResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         accessToken:
 *           type: string
 *           description: JWT access token for authenticated requests
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 *     UserProfile:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID from users table
 *           example: 5
 *         user_first_name:
 *           type: string
 *           description: First name from users table
 *           example: "John"
 *         user_last_name:
 *           type: string
 *           description: Last name from users table
 *           example: "Doe"
 *         user_email:
 *           type: string
 *           format: email
 *           description: Email from users table
 *           example: "john.doe@example.com"
 *         user_phone_number:
 *           type: string
 *           description: Phone number from users table
 *           example: "+919876543210"
 *         role:
 *           type: string
 *           description: User role
 *           example: "student"
 *         student_id:
 *           type: integer
 *           nullable: true
 *           description: Student ID from students table (if user is a student)
 *           example: 3
 *         first_name:
 *           type: string
 *           nullable: true
 *           description: First name from students table
 *           example: "John"
 *         last_name:
 *           type: string
 *           nullable: true
 *           description: Last name from students table
 *           example: "Doe"
 *         email:
 *           type: string
 *           nullable: true
 *           format: email
 *           description: Email from students table
 *           example: "john.doe@example.com"
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Phone from students table
 *           example: "+919876543210"
 *         enrollment_date:
 *           type: string
 *           nullable: true
 *           format: date
 *           description: Student enrollment date
 *           example: "2023-01-15"
 *         program:
 *           type: string
 *           nullable: true
 *           description: Student's program/course
 *           example: "Computer Science"
 *         semester:
 *           type: string
 *           nullable: true
 *           description: Current semester
 *           example: "Fall 2023"
 *         year:
 *           type: string
 *           nullable: true
 *           description: Academic year
 *           example: "2023"
 *         status:
 *           type: string
 *           nullable: true
 *           description: Student status
 *           example: "active"
 *         courses:
 *           type: array
 *           nullable: true
 *           items:
 *             type: string
 *           description: Array of course identifiers
 *           example: ["MATH101", "CS101"]
 *         created_at:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           description: Student record creation timestamp
 *           example: "2023-01-15T10:30:00.000Z"
 *         updated_at:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           description: Student record last update timestamp
 *           example: "2023-01-15T10:30:00.000Z"
 */

// Public routes

/**
 * @swagger
 * /api/users/check-user:
 *   post:
 *     summary: Check if user exists with Firebase verification
 *     description: Verify user's phone number using Firebase ID token and check if user exists in the system
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckUserRequest'
 *     responses:
 *       200:
 *         description: User check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CheckUserResponse'
 *                 - type: object
 *                   description: Empty object when user doesn't exist
 *                   example: {}
 *             examples:
 *               existing_user:
 *                 summary: User exists and has profile data
 *                 value:
 *                   user:
 *                     id: 1
 *                     first_name: "John"
 *                     last_name: "Doe"
 *                     email: "john.doe@example.com"
 *                     phone_number: "+919876543210"
 *                     role: "student"
 *                   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               new_user:
 *                 summary: User doesn't exist or incomplete profile
 *                 value: {}
 *       400:
 *         description: Phone number mismatch or verification failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Phone number mismatch or not verified."
 *       401:
 *         description: Invalid Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid token or user check failed."
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/check-user", userController.checkUser);

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account and student profile (if role is student). Sets refresh token as HTTP-only cookie.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistrationRequest'
 *     responses:
 *       200:
 *         description: User registered successfully
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie
 *             schema:
 *               type: string
 *               example: "refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=1296000"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationResponse'
 *             examples:
 *               student_registration:
 *                 summary: Successful student registration
 *                 value:
 *                   user:
 *                     id: 1
 *                     first_name: "John"
 *                     last_name: "Doe"
 *                     email: "john.doe@example.com"
 *                     phone_number: "+919876543210"
 *                     role: "student"
 *                     created_at: "2023-12-15T10:30:00.000Z"
 *                   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               missing_fields:
 *                 summary: Required fields missing
 *                 value:
 *                   error: "First name, last name, email, and password are required."
 *               email_exists:
 *                 summary: Email already registered
 *                 value:
 *                   error: "Email already exists."
 *               phone_exists:
 *                 summary: Phone number already registered
 *                 value:
 *                   error: "Phone number already exists."
 *       500:
 *         description: Registration failed due to server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User registration failed."
 */
router.post('/register', userController.register);

// Protected Routes for users
router.use(auth);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve a list of all users in the system. This endpoint is restricted to admin users only.
 *     tags: [Users]
 *     security:
 *       - authKey: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             examples:
 *               success:
 *                 summary: List of all users
 *                 value:
 *                   - id: 1
 *                     first_name: "John"
 *                     last_name: "Doe"
 *                     email: "john.doe@example.com"
 *                     phone_number: "+919876543210"
 *                     role: "student"
 *                     created_at: "2023-01-15T10:30:00.000Z"
 *                   - id: 2
 *                     first_name: "Jane"
 *                     last_name: "Smith"
 *                     email: "jane.smith@example.com"
 *                     phone_number: "+919876543211"
 *                     role: "instructor"
 *                     created_at: "2023-01-10T08:15:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access denied. Admin privileges required."
 *       500:
 *         description: Failed to fetch users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch users."
 */
router.get('/', requireAdmin, userController.getAllUsers);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's complete profile information including student details if applicable
 *     tags: [Users]
 *     security:
 *       - authKey: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *             examples:
 *               student_profile:
 *                 summary: Student user profile
 *                 value:
 *                   user_id: 5
 *                   user_first_name: "John"
 *                   user_last_name: "Doe"
 *                   user_email: "john.doe@example.com"
 *                   user_phone_number: "+919876543210"
 *                   role: "student"
 *                   student_id: 3
 *                   first_name: "John"
 *                   last_name: "Doe"
 *                   email: "john.doe@example.com"
 *                   phone: "+919876543210"
 *                   enrollment_date: "2023-01-15"
 *                   program: "Computer Science"
 *                   semester: "Fall 2023"
 *                   year: "2023"
 *                   status: "active"
 *                   courses: ["MATH101", "CS101"]
 *                   created_at: "2023-01-15T10:30:00.000Z"
 *                   updated_at: "2023-01-15T10:30:00.000Z"
 *               instructor_profile:
 *                 summary: Instructor user profile (no student data)
 *                 value:
 *                   user_id: 8
 *                   user_first_name: "Jane"
 *                   user_last_name: "Smith"
 *                   user_email: "jane.smith@example.com"
 *                   user_phone_number: "+919876543211"
 *                   role: "instructor"
 *                   student_id: null
 *                   first_name: null
 *                   last_name: null
 *                   email: null
 *                   phone: null
 *                   enrollment_date: null
 *                   program: null
 *                   semester: null
 *                   year: null
 *                   status: null
 *                   courses: null
 *                   created_at: null
 *                   updated_at: null
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error while fetching profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
router.get('/me', userController.getProfile);

module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../../middleware/auth');
const studentController = require('../../controllers/user/studentController');

const upload = multer();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Student ID
 *         userId:
 *           type: integer
 *           description: Associated user ID
 *         firstName:
 *           type: string
 *           description: Student's first name
 *         lastName:
 *           type: string
 *           description: Student's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Student's email address
 *         phone:
 *           type: string
 *           description: Student's phone number
 *         enrollmentDate:
 *           type: string
 *           format: date
 *           description: Student's enrollment date
 *         status:
 *           type: string
 *           enum: [active, inactive, graduated, suspended]
 *           description: Student's current status
 *         program:
 *           type: string
 *           description: Student's academic program
 *         semester:
 *           type: string
 *           description: Current semester
 *         year:
 *           type: integer
 *           description: Current academic year
 *         courses:
 *           type: array
 *           items:
 *             type: string
 *           description: List of enrolled courses
 *       example:
 *         id: 1
 *         userId: 123
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "john.doe@university.edu"
 *         phone: "+1234567890"
 *         enrollmentDate: "2024-01-15"
 *         status: "active"
 *         program: "Computer Science"
 *         semester: "Fall"
 *         year: 2024
 *         courses: ["CS101", "MATH201", "PHYS101"]
 *     
 *     StudentUpdateRequest:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           description: Student's first name
 *         last_name:
 *           type: string
 *           description: Student's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Student's email address
 *         phone:
 *           type: string
 *           description: Student's phone number
 *         enrollment_date:
 *           type: string
 *           format: date
 *           description: Student's enrollment date
 *         status:
 *           type: string
 *           enum: [active, inactive, graduated, suspended]
 *           description: Student's current status
 *         program:
 *           type: string
 *           description: Student's academic program
 *         semester:
 *           type: string
 *           description: Current semester
 *         year:
 *           type: integer
 *           description: Current academic year
 *         courses:
 *           oneOf:
 *             - type: array
 *               items:
 *                 type: string
 *             - type: string
 *           description: List of enrolled courses (array or comma-separated string)
 *       example:
 *         first_name: "John"
 *         last_name: "Doe"
 *         email: "john.doe@university.edu"
 *         phone: "+1234567890"
 *         enrollment_date: "2024-01-15"
 *         status: "active"
 *         program: "Computer Science"
 *         semester: "Fall"
 *         year: 2024
 *         courses: ["CS101", "MATH201", "PHYS101"]
 *     
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *       example:
 *         error: "Student not found."
 */

/**
 * @swagger
 * /api/student:
 *   get:
 *     summary: Get student profile
 *     description: Retrieve the profile information for the authenticated student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', auth, studentController.getProfile);

/**
 * @swagger
 * /api/student:
 *   put:
 *     summary: Update student profile
 *     description: Update the profile information for the authenticated student with optional profile picture upload
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/StudentUpdateRequest'
 *               - type: object
 *                 properties:
 *                   profile_picture:
 *                     type: string
 *                     format: binary
 *                     description: Profile picture file upload (optional)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentUpdateRequest'
 *     responses:
 *       200:
 *         description: Student profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/', auth, upload.single('profile_picture'), studentController.updateProfile);

module.exports = router;
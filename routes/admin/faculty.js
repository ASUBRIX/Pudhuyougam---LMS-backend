const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const facultyController = require('../../controllers/admin/facultyController');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   
 *   schemas:
 *     Faculty:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the faculty member
 *         faculty_id:
 *           type: string
 *           description: Generated faculty ID (e.g., FAC001)
 *         name:
 *           type: string
 *           description: Full name of the faculty member
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the faculty member
 *         phone:
 *           type: string
 *           description: Phone number of the faculty member
 *         department:
 *           type: string
 *           description: Department the faculty member belongs to
 *         designation:
 *           type: string
 *           description: Job title or designation
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Current status of the faculty member
 *         qualification:
 *           type: string
 *           description: Educational qualifications
 *           nullable: true
 *         experience:
 *           type: string
 *           description: Years of experience or experience description
 *           nullable: true
 *         avatar:
 *           type: string
 *           description: URL or path to faculty member's profile image
 *           nullable: true
 *         joining_date:
 *           type: string
 *           format: date
 *           description: Date when the faculty member joined
 *           nullable: true
 *         bio:
 *           type: string
 *           description: Biography or description of the faculty member
 *           nullable: true
 *         board_member:
 *           type: boolean
 *           description: Whether the faculty member is a board member
 *           default: false
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the record was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the record was last updated
 *       example:
 *         id: 1
 *         faculty_id: "FAC001"
 *         name: "Dr. John Smith"
 *         email: "john.smith@university.edu"
 *         phone: "+1234567890"
 *         department: "Computer Science"
 *         designation: "Professor"
 *         status: "active"
 *         qualification: "Ph.D. in Computer Science"
 *         experience: "15 years"
 *         avatar: "/images/faculty/john-smith.jpg"
 *         joining_date: "2020-01-15"
 *         bio: "Dr. Smith is an expert in machine learning and artificial intelligence."
 *         board_member: true
 *         created_at: "2025-06-26T10:00:00Z"
 *         updated_at: "2025-06-26T10:00:00Z"
 *
 *     CreateFacultyRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - department
 *         - designation
 *         - status
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the faculty member
 *           minLength: 1
 *           maxLength: 255
 *           example: "Dr. John Smith"
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the faculty member
 *           example: "john.smith@university.edu"
 *         phone:
 *           type: string
 *           description: Phone number of the faculty member
 *           example: "+1234567890"
 *         department:
 *           type: string
 *           description: Department the faculty member belongs to
 *           example: "Computer Science"
 *         designation:
 *           type: string
 *           description: Job title or designation
 *           example: "Professor"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Current status of the faculty member
 *           example: "active"
 *         qualification:
 *           type: string
 *           description: Educational qualifications
 *           example: "Ph.D. in Computer Science"
 *         experience:
 *           type: string
 *           description: Years of experience or experience description
 *           example: "15 years"
 *         avatar:
 *           type: string
 *           description: URL or path to faculty member's profile image
 *           example: "/images/faculty/john-smith.jpg"
 *         joiningDate:
 *           type: string
 *           format: date
 *           description: Date when the faculty member joined
 *           example: "2020-01-15"
 *         bio:
 *           type: string
 *           description: Biography or description of the faculty member
 *           example: "Dr. Smith is an expert in machine learning and artificial intelligence."
 *         board_member:
 *           type: boolean
 *           description: Whether the faculty member is a board member
 *           default: false
 *           example: true
 *
 *     UpdateFacultyRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the faculty member
 *           example: "Dr. John Smith"
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the faculty member
 *           example: "john.smith@university.edu"
 *         phone:
 *           type: string
 *           description: Phone number of the faculty member
 *           example: "+1234567890"
 *         department:
 *           type: string
 *           description: Department the faculty member belongs to
 *           example: "Computer Science"
 *         designation:
 *           type: string
 *           description: Job title or designation
 *           example: "Professor"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Current status of the faculty member
 *           example: "active"
 *         qualification:
 *           type: string
 *           description: Educational qualifications
 *           example: "Ph.D. in Computer Science"
 *         experience:
 *           type: string
 *           description: Years of experience or experience description
 *           example: "15 years"
 *         avatar:
 *           type: string
 *           description: URL or path to faculty member's profile image
 *           example: "/images/faculty/john-smith.jpg"
 *         joiningDate:
 *           type: string
 *           format: date
 *           description: Date when the faculty member joined
 *           example: "2020-01-15"
 *         bio:
 *           type: string
 *           description: Biography or description of the faculty member
 *           example: "Dr. Smith is an expert in machine learning and artificial intelligence."
 *         board_member:
 *           type: boolean
 *           description: Whether the faculty member is a board member
 *           example: true
 */

router.use(auth, requireAdmin);

/**
 * @swagger
 * /api/admin/faculties:
 *   get:
 *     summary: Get all faculty members
 *     description: Retrieves all faculty members from the database, ordered by ID (newest first). Admin access required.
 *     tags: [Admin - Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all faculty members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Faculty'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   post:
 *     summary: Create a new faculty member
 *     description: Creates a new faculty member with auto-generated faculty ID. Admin access required.
 *     tags: [Admin - Faculty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFacultyRequest'
 *     responses:
 *       201:
 *         description: Faculty member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Faculty'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', facultyController.getAllFaculties);
router.post('/', facultyController.createFaculty);

/**
 * @swagger
 * /api/admin/faculties/{id}:
 *   put:
 *     summary: Update a faculty member
 *     description: Updates an existing faculty member by ID. Admin access required.
 *     tags: [Admin - Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Faculty member ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFacultyRequest'
 *     responses:
 *       200:
 *         description: Faculty member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Faculty'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Faculty member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: Delete a faculty member
 *     description: Permanently deletes a faculty member by ID. Admin access required.
 *     tags: [Admin - Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Faculty member ID
 *         example: 1
 *     responses:
 *       204:
 *         description: Faculty member deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Faculty member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

module.exports = router;
const express = require('express');
const router = express.Router();
const instructorController = require('../../controllers/user/instructorController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Instructor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the instructor
 *         faculty_id:
 *           type: string
 *           description: Generated faculty ID (e.g., FAC001)
 *         name:
 *           type: string
 *           description: Full name of the instructor
 *         department:
 *           type: string
 *           description: Department the instructor belongs to
 *         designation:
 *           type: string
 *           description: Job title or designation of the instructor
 *         avatar:
 *           type: string
 *           description: URL or path to instructor's profile image
 *           nullable: true
 *         experience:
 *           type: string
 *           description: Years of experience or experience description
 *           nullable: true
 *         bio:
 *           type: string
 *           description: Biography or description of the instructor
 *           nullable: true
 *         board_member:
 *           type: boolean
 *           description: Whether the instructor is a board member
 *           default: false
 *       example:
 *         id: 1
 *         faculty_id: "FAC001"
 *         name: "Dr. John Smith"
 *         department: "Computer Science"
 *         designation: "Professor"
 *         avatar: "/images/faculty/john-smith.jpg"
 *         experience: "15 years"
 *         bio: "Dr. Smith is an expert in machine learning and artificial intelligence with over 15 years of experience in research and teaching."
 *         board_member: true
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *       example:
 *         error: "Failed to fetch instructors"
 */

/**
 * @swagger
 * /api/instructors:
 *   get:
 *     summary: Get all active instructors
 *     description: Retrieves a list of all active instructors/faculty members for public display. Board members are prioritized and displayed first.
 *     tags: [Instructors]
 *     responses:
 *       200:
 *         description: List of active instructors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Instructor'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               server_error:
 *                 summary: Server error
 *                 value:
 *                   error: "Failed to fetch instructors"
 */
router.get('/', instructorController.getPublicInstructors);

module.exports = router;
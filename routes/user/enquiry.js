const express = require('express');
const router = express.Router();
const { createEnquiry, getEnquiryPrefillDetails } = require('../../controllers/user/enquiryController');
const { auth } = require('../../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Enquiry:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the enquiry
 *         name:
 *           type: string
 *           description: Full name of the person making the enquiry
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the enquirer
 *         phone:
 *           type: string
 *           description: Phone number of the enquirer
 *         subject:
 *           type: string
 *           description: Subject/topic of the enquiry
 *         message:
 *           type: string
 *           description: Detailed message or enquiry content
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the enquiry was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the enquiry was last updated
 *       example:
 *         id: 1
 *         name: "John Doe"
 *         email: "john.doe@example.com"
 *         phone: "+1234567890"
 *         subject: "Product Information"
 *         message: "I would like to know more about your services"
 *         created_at: "2025-06-26T10:00:00Z"
 *         updated_at: "2025-06-26T10:00:00Z"
 *
 *     CreateEnquiryRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *         - subject
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the person making the enquiry
 *           minLength: 1
 *           maxLength: 255
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the enquirer
 *           example: "john.doe@example.com"
 *         phone:
 *           type: string
 *           description: Phone number of the enquirer
 *           minLength: 1
 *           maxLength: 20
 *           example: "+1234567890"
 *         subject:
 *           type: string
 *           description: Subject/topic of the enquiry
 *           minLength: 1
 *           maxLength: 255
 *           example: "Product Information"
 *         message:
 *           type: string
 *           description: Detailed message or enquiry content
 *           minLength: 1
 *           maxLength: 2000
 *           example: "I would like to know more about your services and pricing"
 *
 *     CreateEnquiryResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Enquiry submitted successfully"
 *         data:
 *           $ref: '#/components/schemas/Enquiry'
 *
 *     PrefillData:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Full name from user profile
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Email from user profile
 *           example: "john.doe@example.com"
 *         phone:
 *           type: string
 *           description: Phone number from user profile
 *           example: "+1234567890"
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *       example:
 *         error: "All fields are required"
 */

/**
 * @swagger
 * /api/enquiries:
 *   post:
 *     summary: Submit a new enquiry
 *     description: Creates a new enquiry submission. This is a public endpoint that doesn't require authentication.
 *     tags: [Enquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEnquiryRequest'
 *     responses:
 *       201:
 *         description: Enquiry submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateEnquiryResponse'
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: "All fields are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               server_error:
 *                 summary: Server error
 *                 value:
 *                   error: "Internal server error"
 */
router.post('/', createEnquiry);

/**
 * @swagger
 * /api/enquiries/prefill:
 *   get:
 *     summary: Get user data for enquiry form prefill
 *     description: Retrieves authenticated user's profile data to prefill the enquiry form (name, email, phone).
 *     tags: [Enquiries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User prefill data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrefillData'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               unauthorized:
 *                 summary: Unauthorized access
 *                 value:
 *                   error: "Access token required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               user_not_found:
 *                 summary: User not found
 *                 value:
 *                   error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               server_error:
 *                 summary: Server error
 *                 value:
 *                   error: "Internal server error"
 */
router.get('/prefill', auth, getEnquiryPrefillDetails);

module.exports = router;
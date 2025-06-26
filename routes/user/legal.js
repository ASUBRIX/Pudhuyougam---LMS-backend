const express = require('express');
const router = express.Router();
const controller = require('../../controllers/user/legalController');

/**
 * @swagger
 * components:
 *   schemas:
 *     LegalDocument:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the document
 *         type:
 *           type: string
 *           enum: [terms, privacy]
 *           description: Type of legal document
 *         content:
 *           type: string
 *           description: HTML or text content of the document
 *         version:
 *           type: string
 *           description: Version number of the document
 *         is_active:
 *           type: boolean
 *           description: Whether this version is currently active
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the document was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the document was last updated
 *       example:
 *         id: 1
 *         type: "terms"
 *         content: "<h1>Terms and Conditions</h1><p>These terms and conditions...</p>"
 *         version: "1.0"
 *         is_active: true
 *         created_at: "2025-06-26T10:00:00Z"
 *         updated_at: "2025-06-26T10:00:00Z"
 *
 *     TermsAndConditions:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the terms document
 *         content:
 *           type: string
 *           description: HTML or text content of the terms and conditions
 *         version:
 *           type: string
 *           description: Version number of the terms
 *         is_active:
 *           type: boolean
 *           description: Whether this version is currently active
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the terms were created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the terms were last updated
 *       example:
 *         id: 1
 *         content: "<h1>Terms and Conditions</h1><p>By using our service, you agree to these terms...</p>"
 *         version: "1.2"
 *         is_active: true
 *         created_at: "2025-06-26T10:00:00Z"
 *         updated_at: "2025-06-26T10:00:00Z"
 *
 *     PrivacyPolicy:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the privacy policy document
 *         content:
 *           type: string
 *           description: HTML or text content of the privacy policy
 *         version:
 *           type: string
 *           description: Version number of the privacy policy
 *         is_active:
 *           type: boolean
 *           description: Whether this version is currently active
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the privacy policy was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the privacy policy was last updated
 *       example:
 *         id: 1
 *         content: "<h1>Privacy Policy</h1><p>We value your privacy and are committed to protecting your personal information...</p>"
 *         version: "2.0"
 *         is_active: true
 *         created_at: "2025-06-26T10:00:00Z"
 *         updated_at: "2025-06-26T10:00:00Z"
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *       example:
 *         message: "Failed to fetch terms and conditions"
 */

/**
 * @swagger
 * /api/legal/terms:
 *   get:
 *     summary: Get current Terms and Conditions
 *     description: Retrieves the currently active Terms and Conditions document for public display. No authentication required.
 *     tags: [Legal Documents]
 *     responses:
 *       200:
 *         description: Terms and Conditions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TermsAndConditions'
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
 *                   message: "Failed to fetch terms and conditions"
 */
router.get('/terms', controller.getTerms);

/**
 * @swagger
 * /api/legal/privacy:
 *   get:
 *     summary: Get current Privacy Policy
 *     description: Retrieves the currently active Privacy Policy document for public display. No authentication required.
 *     tags: [Legal Documents]
 *     responses:
 *       200:
 *         description: Privacy Policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrivacyPolicy'
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
 *                   message: "Failed to fetch privacy policy"
 */
router.get('/privacy', controller.getPrivacyPolicy);

module.exports = router;
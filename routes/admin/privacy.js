const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const { body } = require('express-validator');
const controller = require('../../controllers/admin/privacyController');

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatePrivacyRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: HTML or text content of the privacy policy
 *           minLength: 1
 *           example: "<h1>Privacy Policy</h1><p>We value your privacy and are committed to protecting your personal information...</p>"
 *
 *     UpdatePrivacyResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Privacy policy updated successfully"
 *         policy:
 *           $ref: '#/components/schemas/PrivacyPolicy'
 */

/**
 * @swagger
 * /api/admin/privacy:
 *   get:
 *     summary: Get current Privacy Policy (Admin)
 *     description: Retrieves the currently active Privacy Policy document for administrative purposes. Admin authentication required.
 *     tags: [Admin - Privacy Policy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Privacy Policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrivacyPolicy'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminError'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminError'
 *
 *   put:
 *     summary: Update Privacy Policy
 *     description: Updates the Privacy Policy document. Creates a new version while keeping the old version for history. Admin authentication required.
 *     tags: [Admin - Privacy Policy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePrivacyRequest'
 *     responses:
 *       200:
 *         description: Privacy Policy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdatePrivacyResponse'
 *       400:
 *         description: Bad request - Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminError'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminError'
 */
router.get('/', controller.getPrivacyPolicy);
router.put(
  '/',
  auth,
  requireAdmin,
  body('content').notEmpty().withMessage('Content is required'),
  controller.updatePrivacyPolicy
);

/**
 * @swagger
 * /api/admin/privacy/versions:
 *   get:
 *     summary: Get all Privacy Policy versions
 *     description: Retrieves all versions of Privacy Policy documents including inactive/historical versions. Admin authentication required.
 *     tags: [Admin - Privacy Policy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All Privacy Policy versions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PrivacyPolicy'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminError'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminError'
 */
router.get('/versions', auth, requireAdmin, controller.getAllPrivacyPolicies);

module.exports = router;
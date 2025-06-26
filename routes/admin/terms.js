const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const { body } = require('express-validator');
const controller = require('../../controllers/admin/termsController');

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
 *     UpdateTermsRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: HTML or text content of the terms and conditions
 *           minLength: 1
 *           example: "<h1>Terms and Conditions</h1><p>By using our service, you agree to these updated terms...</p>"
 *
 *     UpdateTermsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Terms and conditions updated successfully"
 *         terms:
 *           $ref: '#/components/schemas/TermsAndConditions'
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "field"
 *               value:
 *                 type: string
 *                 example: ""
 *               msg:
 *                 type: string
 *                 example: "Content is required"
 *               path:
 *                 type: string
 *                 example: "content"
 *               location:
 *                 type: string
 *                 example: "body"
 *       example:
 *         errors:
 *           - type: "field"
 *             value: ""
 *             msg: "Content is required"
 *             path: "content"
 *             location: "body"
 *
 *     AdminError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *       example:
 *         error: "Failed to update terms and conditions"
 */

/**
 * @swagger
 * /api/admin/terms:
 *   get:
 *     summary: Get current Terms and Conditions (Admin)
 *     description: Retrieves the currently active Terms and Conditions document for administrative purposes. Admin authentication required.
 *     tags: [Admin - Terms & Conditions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Terms and Conditions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TermsAndConditions'
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
 *     summary: Update Terms and Conditions
 *     description: Updates the Terms and Conditions document. Creates a new version while keeping the old version for history. Admin authentication required.
 *     tags: [Admin - Terms & Conditions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTermsRequest'
 *     responses:
 *       200:
 *         description: Terms and Conditions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateTermsResponse'
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
router.get('/', controller.getTerms);
router.put(
  '/',
  auth,
  requireAdmin,
  body('content').notEmpty().withMessage('Content is required'),
  controller.updateTerms
);

/**
 * @swagger
 * /api/admin/terms/versions:
 *   get:
 *     summary: Get all Terms and Conditions versions
 *     description: Retrieves all versions of Terms and Conditions documents including inactive/historical versions. Admin authentication required.
 *     tags: [Admin - Terms & Conditions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All Terms and Conditions versions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TermsAndConditions'
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
router.get('/versions', auth, requireAdmin, controller.getAllTerms);

module.exports = router;
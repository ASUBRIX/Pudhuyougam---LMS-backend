const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const enquiryController = require('../../controllers/admin/enquiryController');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/admin/enquiries:
 *   get:
 *     summary: Get all enquiries (Admin only)
 *     description: Retrieves all enquiries from the database, ordered by creation date (newest first). This endpoint requires admin authentication.
 *     tags: [Admin - Enquiries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all enquiries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enquiry'
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
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               forbidden:
 *                 summary: Admin access required
 *                 value:
 *                   error: "Admin access required"
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
 *                   error: "Internal Server Error"
 */

// Admin: Get all enquiries
router.use(auth, requireAdmin);
router.get('/', enquiryController.getAllEnquiries);

module.exports = router;
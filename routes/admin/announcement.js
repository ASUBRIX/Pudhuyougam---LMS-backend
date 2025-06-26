const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const announcementController = require('../../controllers/admin/announcementController');

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
 *     CreateAnnouncementRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the announcement
 *           example: "System Maintenance Notice"
 *         content:
 *           type: string
 *           description: Content/body of the announcement
 *           example: "Our system will be under maintenance from 2 AM to 4 AM EST"
 *         isActive:
 *           type: boolean
 *           description: Whether the announcement should be active
 *           default: true
 *           example: true
 *     
 *     UpdateAnnouncementRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the announcement
 *           example: "Updated System Maintenance Notice"
 *         content:
 *           type: string
 *           description: Content/body of the announcement
 *           example: "Maintenance has been rescheduled to 3 AM to 5 AM EST"
 *         isActive:
 *           type: boolean
 *           description: Whether the announcement should be active
 *           example: false
 */

/**
 * @swagger
 * /api/admin/announcements:
 *   get:
 *     summary: Get all announcements
 *     description: Retrieves all announcements (admin only)
 *     tags: [Admin - Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Announcement'
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
 *     summary: Create a new announcement
 *     description: Creates a new announcement (admin only)
 *     tags: [Admin - Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncementRequest'
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
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
router.get('/', auth, requireAdmin, announcementController.getAllAnnouncements);
router.post('/', auth, requireAdmin, announcementController.createAnnouncement);

/**
 * @swagger
 * /api/admin/announcements/{id}:
 *   put:
 *     summary: Update an announcement
 *     description: Updates an existing announcement by ID (admin only)
 *     tags: [Admin - Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAnnouncementRequest'
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
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
 *         description: Announcement not found
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
 *     summary: Delete an announcement
 *     description: Deletes an existing announcement by ID (admin only)
 *     tags: [Admin - Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement ID
 *         example: 1
 *     responses:
 *       204:
 *         description: Announcement deleted successfully
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
 *         description: Announcement not found
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
router.put('/:id', auth, requireAdmin, announcementController.updateAnnouncement);
router.delete('/:id', auth, requireAdmin, announcementController.deleteAnnouncement);

module.exports = router;
const express = require('express');
const router = express.Router();
const noticeBoardController = require('../../controllers/user/noticeBoardController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the announcement
 *         title:
 *           type: string
 *           description: Title of the announcement
 *         content:
 *           type: string
 *           description: Content/body of the announcement
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the announcement was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the announcement was last updated
 *         is_active:
 *           type: boolean
 *           description: Whether the announcement is active/visible
 *       example:
 *         id: 1
 *         title: "System Maintenance Notice"
 *         content: "Our system will be under maintenance from 2 AM to 4 AM EST"
 *         created_at: "2025-06-26T10:00:00Z"
 *         updated_at: "2025-06-26T10:00:00Z"
 *         is_active: true
 *     
 *     AnnouncementPublic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the announcement
 *         title:
 *           type: string
 *           description: Title of the announcement
 *         content:
 *           type: string
 *           description: Content/body of the announcement
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the announcement was created
 *       example:
 *         id: 1
 *         title: "System Maintenance Notice"
 *         content: "Our system will be under maintenance from 2 AM to 4 AM EST"
 *         created_at: "2025-06-26T10:00:00Z"
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *       example:
 *         error: "Failed to fetch announcements"
 */

/**
 * @swagger
 * /api/notice-board:
 *   get:
 *     summary: Get latest active announcements for notice board
 *     description: Retrieves the 10 most recent active announcements for public display on the notice board
 *     tags: [Notice Board]
 *     responses:
 *       200:
 *         description: List of latest active announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnnouncementPublic'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', noticeBoardController.getLatestAnnouncements);

module.exports = router;
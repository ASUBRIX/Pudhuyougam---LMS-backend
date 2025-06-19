const express = require('express');
const router = express.Router();
const currentAffairsController = require('../../controllers/user/currentAffairsController');

/**
 * @swagger
 * /api/current-affairs:
 *   get:
 *     summary: Get all active current affairs
 *     description: Retrieve all active current affairs articles ordered by date (newest first)
 *     tags: [Current Affairs]
 *     responses:
 *       200:
 *         description: Current affairs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Current affair ID
 *                     example: 1
 *                   title:
 *                     type: string
 *                     description: Current affair title
 *                     example: "New Education Policy Updates 2024"
 *                   content:
 *                     type: string
 *                     description: Current affair content/description
 *                     example: "The Ministry of Education has announced significant updates to the National Education Policy..."
 *                   category:
 *                     type: string
 *                     nullable: true
 *                     description: Current affair category
 *                     example: "Education"
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: Current affair date
 *                     example: "2023-12-15"
 *                   is_active:
 *                     type: boolean
 *                     description: Whether the current affair is active (always true for this endpoint)
 *                     example: true
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Record creation timestamp
 *                     example: "2023-12-15T10:30:00.000Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     description: Record last update timestamp
 *                     example: "2023-12-15T10:30:00.000Z"
 *             examples:
 *               success:
 *                 summary: Successful response with current affairs
 *                 value:
 *                   - id: 1
 *                     title: "New Education Policy Updates 2024"
 *                     content: "The Ministry of Education has announced significant updates to the National Education Policy affecting higher education institutions across the country..."
 *                     category: "Education"
 *                     date: "2023-12-15"
 *                     is_active: true
 *                     created_at: "2023-12-15T10:30:00.000Z"
 *                     updated_at: "2023-12-15T10:30:00.000Z"
 *                   - id: 2
 *                     title: "Technology Advancements in Online Learning"
 *                     content: "Recent developments in artificial intelligence and machine learning are revolutionizing the way students learn online..."
 *                     category: "Technology"
 *                     date: "2023-12-14"
 *                     is_active: true
 *                     created_at: "2023-12-14T15:20:00.000Z"
 *                     updated_at: "2023-12-14T15:20:00.000Z"
 *                   - id: 3
 *                     title: "Employment Opportunities in IT Sector"
 *                     content: "The IT industry continues to show robust growth with new job opportunities emerging in various sectors..."
 *                     category: "Employment"
 *                     date: "2023-12-13"
 *                     is_active: true
 *                     created_at: "2023-12-13T09:45:00.000Z"
 *                     updated_at: "2023-12-13T09:45:00.000Z"
 *               empty:
 *                 summary: No active current affairs available
 *                 value: []
 *       500:
 *         description: Server error while fetching current affairs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch current affairs"
 */
// Get all active current affairs
router.get('/', currentAffairsController.getAllCurrentAffairs);

/**
 * @swagger
 * /api/current-affairs/{id}:
 *   get:
 *     summary: Get single current affair by ID
 *     description: Retrieve a specific active current affair article by its ID for details page
 *     tags: [Current Affairs]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Current affair ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Current affair retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Current affair ID
 *                   example: 1
 *                 title:
 *                   type: string
 *                   description: Current affair title
 *                   example: "New Education Policy Updates 2024"
 *                 content:
 *                   type: string
 *                   description: Full current affair content
 *                   example: "The Ministry of Education has announced significant updates to the National Education Policy affecting higher education institutions across the country. These changes are expected to modernize the curriculum and improve accessibility to quality education for students from all backgrounds..."
 *                 category:
 *                   type: string
 *                   nullable: true
 *                   description: Current affair category
 *                   example: "Education"
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: Current affair date
 *                   example: "2023-12-15"
 *                 is_active:
 *                   type: boolean
 *                   description: Whether the current affair is active (always true for this endpoint)
 *                   example: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Record creation timestamp
 *                   example: "2023-12-15T10:30:00.000Z"
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   description: Record last update timestamp
 *                   example: "2023-12-15T10:30:00.000Z"
 *             examples:
 *               success:
 *                 summary: Successful current affair retrieval
 *                 value:
 *                   id: 1
 *                   title: "New Education Policy Updates 2024"
 *                   content: "The Ministry of Education has announced significant updates to the National Education Policy affecting higher education institutions across the country. These changes are expected to modernize the curriculum and improve accessibility to quality education for students from all backgrounds. Key highlights include: 1) Introduction of flexible course structures allowing students to choose interdisciplinary subjects, 2) Enhanced focus on practical skills and industry-relevant training, 3) Improved scholarship programs for economically disadvantaged students, 4) Integration of technology in traditional classroom settings. The policy changes will be implemented in phases starting from the academic year 2024-25, with full implementation expected by 2026."
 *                   category: "Education"
 *                   date: "2023-12-15"
 *                   is_active: true
 *                   created_at: "2023-12-15T10:30:00.000Z"
 *                   updated_at: "2023-12-15T10:30:00.000Z"
 *       404:
 *         description: Current affair not found or not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Current affair not found"
 *             examples:
 *               not_found:
 *                 summary: Current affair doesn't exist or not active
 *                 value:
 *                   error: "Current affair not found"
 *       500:
 *         description: Server error while fetching current affair
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch current affair"
 *             examples:
 *               server_error:
 *                 summary: Database or server error
 *                 value:
 *                   error: "Failed to fetch current affair"
 */
// Get single current affair by ID for details page
router.get('/:id', currentAffairsController.getCurrentAffairById);

module.exports = router;
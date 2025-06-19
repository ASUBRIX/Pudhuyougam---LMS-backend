const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/user/blogController');

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all published blogs
 *     description: Retrieve all published blog posts ordered by creation date (newest first)
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Published blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Blog ID
 *                     example: 1
 *                   title:
 *                     type: string
 *                     description: Blog title
 *                     example: "The Future of Online Learning"
 *                   date:
 *                     type: string
 *                     description: Blog publication date
 *                     example: "2023-12-15"
 *                   author:
 *                     type: string
 *                     description: Blog author name
 *                     example: "Dr. Sarah Johnson"
 *                   excerpt:
 *                     type: string
 *                     nullable: true
 *                     description: Blog excerpt/summary
 *                     example: "Exploring how technology is reshaping education..."
 *                   content:
 *                     type: string
 *                     description: Full blog content
 *                     example: "In today's digital age, online learning has become..."
 *                   image_url:
 *                     type: string
 *                     nullable: true
 *                     description: Blog featured image URL
 *                     example: "https://example.com/blog/future-learning.jpg"
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Blog tags
 *                     example: ["education", "technology", "online-learning"]
 *                   is_published:
 *                     type: boolean
 *                     description: Publication status (always true for this endpoint)
 *                     example: true
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Blog creation timestamp
 *                     example: "2023-12-15T10:30:00.000Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     description: Blog last update timestamp
 *                     example: "2023-12-15T10:30:00.000Z"
 *             examples:
 *               success:
 *                 summary: Successful response with blogs
 *                 value:
 *                   - id: 1
 *                     title: "The Future of Online Learning"
 *                     date: "2023-12-15"
 *                     author: "Dr. Sarah Johnson"
 *                     excerpt: "Exploring how technology is reshaping education"
 *                     content: "In today's digital age, online learning has become more important than ever..."
 *                     image_url: "https://server.pudhuyugamacademy.com/uploads/blogs/future-learning.jpg"
 *                     tags: ["education", "technology"]
 *                     is_published: true
 *                     created_at: "2023-12-15T10:30:00.000Z"
 *                     updated_at: "2023-12-15T10:30:00.000Z"
 *                   - id: 2
 *                     title: "Benefits of Self-Paced Learning"
 *                     date: "2023-12-10"
 *                     author: "Prof. Raj Kumar"
 *                     excerpt: "Why self-paced learning is effective for students"
 *                     content: "Self-paced learning allows students to learn at their own speed..."
 *                     image_url: "https://server.pudhuyugamacademy.com/uploads/blogs/self-paced.jpg"
 *                     tags: ["learning", "education"]
 *                     is_published: true
 *                     created_at: "2023-12-10T08:15:00.000Z"
 *                     updated_at: "2023-12-10T08:15:00.000Z"
 *               empty:
 *                 summary: No published blogs available
 *                 value: []
 *       500:
 *         description: Server error while fetching blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch blogs"
 */
// Get all published blogs
router.get('/', blogController.getAllPublishedBlogs);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a single published blog by ID
 *     description: Retrieve a specific published blog post by its ID
 *     tags: [Blogs]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Blog ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Blog ID
 *                   example: 1
 *                 title:
 *                   type: string
 *                   description: Blog title
 *                   example: "The Future of Online Learning"
 *                 date:
 *                   type: string
 *                   description: Blog publication date
 *                   example: "2023-12-15"
 *                 author:
 *                   type: string
 *                   description: Blog author name
 *                   example: "Dr. Sarah Johnson"
 *                 excerpt:
 *                   type: string
 *                   nullable: true
 *                   description: Blog excerpt/summary
 *                   example: "Exploring how technology is reshaping education..."
 *                 content:
 *                   type: string
 *                   description: Full blog content
 *                   example: "In today's digital age, online learning has become more important than ever. With the rapid advancement of technology..."
 *                 image_url:
 *                   type: string
 *                   nullable: true
 *                   description: Blog featured image URL
 *                   example: "https://server.pudhuyugamacademy.com/uploads/blogs/future-learning.jpg"
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Blog tags
 *                   example: ["education", "technology", "online-learning"]
 *                 is_published:
 *                   type: boolean
 *                   description: Publication status (always true for this endpoint)
 *                   example: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Blog creation timestamp
 *                   example: "2023-12-15T10:30:00.000Z"
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   description: Blog last update timestamp
 *                   example: "2023-12-15T10:30:00.000Z"
 *             examples:
 *               success:
 *                 summary: Successful blog retrieval
 *                 value:
 *                   id: 1
 *                   title: "The Future of Online Learning"
 *                   date: "2023-12-15"
 *                   author: "Dr. Sarah Johnson"
 *                   excerpt: "Exploring how technology is reshaping education"
 *                   content: "In today's digital age, online learning has become more important than ever. With the rapid advancement of technology, educational institutions are embracing digital platforms to deliver quality education to students worldwide..."
 *                   image_url: "https://server.pudhuyugamacademy.com/uploads/blogs/future-learning.jpg"
 *                   tags: ["education", "technology", "online-learning"]
 *                   is_published: true
 *                   created_at: "2023-12-15T10:30:00.000Z"
 *                   updated_at: "2023-12-15T10:30:00.000Z"
 *       404:
 *         description: Blog not found or not published
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Blog not found"
 *             examples:
 *               not_found:
 *                 summary: Blog doesn't exist or not published
 *                 value:
 *                   error: "Blog not found"
 *       500:
 *         description: Server error while fetching blog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch blog"
 *             examples:
 *               server_error:
 *                 summary: Database or server error
 *                 value:
 *                   error: "Failed to fetch blog"
 */
// Get a single published blog by id
router.get('/:id', blogController.getPublishedBlogById);

module.exports = router;
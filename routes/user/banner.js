const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/user/bannerController');

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Get active banners for homepage
 *     description: Retrieve all active banners sorted by display order for the homepage/main sections
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Active banners retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Banner ID
 *                     example: 1
 *                   title:
 *                     type: string
 *                     description: Banner title
 *                     example: "Special Offer - 50% Off All Courses"
 *                   description:
 *                     type: string
 *                     nullable: true
 *                     description: Banner description
 *                     example: "Limited time offer for new students"
 *                   image_url:
 *                     type: string
 *                     nullable: true
 *                     description: Banner image URL
 *                     example: "https://example.com/banners/special-offer.jpg"
 *                   link:
 *                     type: string
 *                     nullable: true
 *                     description: Banner click-through URL
 *                     example: "https://example.com/courses"
 *             examples:
 *               success:
 *                 summary: Successful response with banners
 *                 value:
 *                   - id: 1
 *                     title: "New Year Special - 50% Off"
 *                     description: "Get 50% discount on all courses this New Year"
 *                     image_url: "https://server.pudhuyugamacademy.com/uploads/banners/newyear-banner.jpg"
 *                     link: "/courses"
 *                   - id: 2
 *                     title: "Free Demo Classes Available"
 *                     description: "Book your free demo class today"
 *                     image_url: "https://server.pudhuyugamacademy.com/uploads/banners/demo-banner.jpg"
 *                     link: "/contact"
 *               empty:
 *                 summary: No active banners
 *                 value: []
 *       500:
 *         description: Server error while fetching banners
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch banners."
 *             examples:
 *               server_error:
 *                 summary: Database or server error
 *                 value:
 *                   error: "Failed to fetch banners."
 */
// Get active banners for homepage
router.get('/', bannerController.getActiveBanners);

module.exports = router;
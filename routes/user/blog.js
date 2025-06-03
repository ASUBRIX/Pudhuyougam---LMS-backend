const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/user/blogController');

// Get all published blogs
router.get('/', blogController.getAllPublishedBlogs);

// Get a single published blog by id
router.get('/:id', blogController.getPublishedBlogById);

module.exports = router;

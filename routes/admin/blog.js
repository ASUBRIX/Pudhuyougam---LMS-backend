const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const blogController = require('../../controllers/admin/blogController');

// All routes require admin authentication
router.use(auth, requireAdmin);

router.get('/', blogController.getAllBlogs);
router.post('/', blogController.createBlog);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;

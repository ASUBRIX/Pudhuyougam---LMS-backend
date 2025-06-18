const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const blogController = require('../../controllers/admin/blogController');

// Input validation middleware
const validateBlogInput = (req, res, next) => {
  const { title, author, excerpt, content, tags } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a valid string');
  }

  if (!author || typeof author !== 'string' || author.trim().length === 0) {
    errors.push('Author is required and must be a valid string');
  }

  if (!excerpt || typeof excerpt !== 'string' || excerpt.trim().length === 0) {
    errors.push('Excerpt is required and must be a valid string');
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    errors.push('Content is required and must be a valid string');
  }

  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    errors.push('At least one tag is required');
  }

  if (title && title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  if (excerpt && excerpt.length > 500) {
    errors.push('Excerpt must be less than 500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Rate limiting middleware for blog creation
const createRateLimit = (req, res, next) => {
  // This is a simple in-memory rate limiter
  // In production, use Redis or a proper rate limiting solution
  const userKey = req.user?.id || req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5; // Max 5 blog creations per minute

  if (!req.app.locals.rateLimitStore) {
    req.app.locals.rateLimitStore = new Map();
  }

  const userRequests = req.app.locals.rateLimitStore.get(userKey) || [];
  const validRequests = userRequests.filter(time => now - time < windowMs);

  if (validRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
    });
  }

  validRequests.push(now);
  req.app.locals.rateLimitStore.set(userKey, validRequests);
  next();
};

// All routes require admin authentication
router.use(auth, requireAdmin);

// GET /api/admin/blogs - Get all blogs with filtering and pagination
router.get('/', blogController.getAllBlogs);

// GET /api/admin/blogs/stats - Get blog statistics
router.get('/stats', blogController.getBlogStats);

// GET /api/admin/blogs/:id - Get single blog by ID
router.get('/:id', blogController.getBlogById);

// POST /api/admin/blogs - Create new blog
router.post('/', createRateLimit, validateBlogInput, blogController.createBlog);

// PUT /api/admin/blogs/:id - Update blog
router.put('/:id', validateBlogInput, blogController.updateBlog);

// DELETE /api/admin/blogs/:id - Delete blog
router.delete('/:id', blogController.deleteBlog);

// POST /api/admin/blogs/bulk - Bulk operations
router.post('/bulk', blogController.bulkUpdateBlogs);

// Error handling middleware for this router
router.use((err, req, res, next) => {
  console.error('Blog route error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = router;
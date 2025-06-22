// routes/admin/courseRoutes.js

const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const courseController = require('../../controllers/admin/courseController');

// Apply authentication middleware to all routes
router.use(auth, requireAdmin);

// Categories routes
router.get('/categories', courseController.getAllCategories);
router.post('/categories', courseController.createCategoryWithSubs);
router.post('/categories/:categoryId/subcategories', courseController.addSubcategoriesToCategory);
router.delete('/categories/:categoryId', courseController.deleteCategory);

// Course stats
router.get('/stats', courseController.getCourseStats);

// Courses CRUD
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Course settings (for advanced settings step)
router.put('/:id/settings', courseController.updateCourseSettings);

// Course content modules
router.get('/modules/:courseId', courseController.getModulesForCourse);
router.post('/modules', courseController.createModule);

// Course reviews
router.get('/:id/reviews', courseController.getCourseReviews);

module.exports = router;
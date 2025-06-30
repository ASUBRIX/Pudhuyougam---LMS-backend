// routes/user/course.js
const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const userCourseController = require('../../controllers/user/courseController');

// Public routes (no authentication required)
router.get('/', userCourseController.getAllPublicCourses);
router.get('/categories', userCourseController.getAllCategories);
router.get('/featured', userCourseController.getFeaturedCourses);
router.get('/popular', userCourseController.getPopularCourses);
router.get('/offer-courses', userCourseController.getOfferCourses);
router.get('/:id', userCourseController.getCourseById);
router.get('/:id/pricing', userCourseController.getCoursePricing);
router.get('/:id/content-preview', userCourseController.getCourseContentPreview);

// Protected routes (authentication required) - Temporarily disabled
// Uncomment these after we implement the enrollment functions
/*
router.use(auth); // Apply auth middleware to routes below

router.get('/my/enrolled', userCourseController.getEnrolledCourses);
router.get('/my/progress/:courseId', userCourseController.getCourseProgress);
router.post('/:id/enroll', userCourseController.enrollInCourse);
router.put('/my/progress/:courseId', userCourseController.updateCourseProgress);
router.get('/:id/full-content', userCourseController.getFullCourseContent);
*/

module.exports = router;
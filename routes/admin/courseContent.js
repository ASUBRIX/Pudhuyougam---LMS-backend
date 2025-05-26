const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const courseContentController = require('../../controllers/admin/courseContentController');

router.use(auth, requireAdmin);

// Get course content by course ID
router.get('/:courseId', courseContentController.getCourseContentByCourseId);

// Upsert (create/update) course content for course
router.post('/:courseId', courseContentController.upsertCourseContent);

module.exports = router;

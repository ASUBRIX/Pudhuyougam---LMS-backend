const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const courseContentController = require('../../controllers/admin/courseContentController');

router.use(auth, requireAdmin);


router.get('/:courseId', courseContentController.getCourseContentByCourseId);


router.post('/:courseId', courseContentController.upsertCourseContent);

module.exports = router;

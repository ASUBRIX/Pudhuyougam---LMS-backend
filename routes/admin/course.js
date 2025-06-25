// routes/admin/courseRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requireAdmin } = require('../../middleware/auth');
const courseController = require('../../controllers/admin/courseController');

// Apply authentication middleware to all routes
router.use(auth, requireAdmin);

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/course-thumbnails';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure multer for thumbnail uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Parse courseId from form data or use timestamp
    const courseId = req.body.courseId || 'temp';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `course-${courseId}-${uniqueSuffix}${fileExtension}`;
    console.log('🔍 Generating filename:', { courseId, fileName, originalname: file.originalname });
    cb(null, fileName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('🔍 File filter - File type:', file.mimetype);
    console.log('🔍 File filter - Course ID from body:', req.body.courseId);
    
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Categories routes
router.get('/categories', courseController.getAllCategories);
router.post('/categories', courseController.createCategoryWithSubs);
router.post('/categories/:categoryId/subcategories', courseController.addSubcategoriesToCategory);
router.delete('/categories/:categoryId', courseController.deleteCategory);

// Course stats
router.get('/stats', courseController.getCourseStats);

// 🔥 THUMBNAIL UPLOAD ROUTE (BEFORE the /:id routes to avoid conflicts)
router.post('/upload-thumbnail', upload.single('thumbnail'), courseController.uploadThumbnail);

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
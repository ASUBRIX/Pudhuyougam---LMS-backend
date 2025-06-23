// routes/student/courseContentRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { 
  getCourseContentByCourseId, 
  downloadDocument,
  validateVideoAccessToken 
} = require('../../controllers/admin/courseContentController');

router.use(auth);

// Student routes
router.get('/:courseId', getCourseContentByCourseId);
router.get('/:courseId/download/:filename', downloadDocument);

// Protected video access endpoint
router.get('/video-access/:courseId/:videoId', async (req, res) => {
  const { courseId, videoId } = req.params;
  const { token } = req.query;
  const userId = req.user.id;

  try {
    // Validate access token
    if (!validateVideoAccessToken(token, courseId, videoId, userId)) {
      return res.status(403).json({ error: 'Invalid or expired video access token' });
    }

    // Get actual video URL from database
    const { query } = require('../../config/database');
    const result = await query(
      'SELECT video_modules FROM course_content_modules WHERE course_id = $1',
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const videoModules = JSON.parse(result.rows[0].video_modules);
    const videoModule = videoModules.find(module => module.id === parseInt(videoId));

    if (!videoModule || !videoModule.videoUrl) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Return video URL (this could be further enhanced with iframe embedding)
    res.json({
      videoUrl: videoModule.videoUrl,
      title: videoModule.title,
      description: videoModule.description,
      duration: videoModule.duration
    });

  } catch (error) {
    console.error('Video access error:', error);
    res.status(500).json({ error: 'Failed to access video' });
  }
});

module.exports = router;
// controllers/admin/courseContentController.js
const { query } = require('../../config/database');

// Get course content by course ID
const getCourseContentByCourseId = async (req, res) => {
  const courseId = req.params.courseId;
  
  try {
    // Validate courseId
    if (!courseId || courseId.trim() === '') {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Log the request for debugging
    console.log(`Fetching course content for courseId: ${courseId}`);

    const result = await query(
      'SELECT contents, video_modules FROM course_content_modules WHERE course_id = $1',
      [courseId]
    );

    if (result.rows.length === 0) {
      console.log(`No course content found for courseId: ${courseId}`);
      return res.json({ contents: [], videoModules: [] });
    }

    const { contents, video_modules } = result.rows[0];
    
    // Parse JSON if stored as strings, handle potential JSON parse errors
    let parsedContents = [];
    let parsedVideoModules = [];

    try {
      parsedContents = typeof contents === 'string' ? JSON.parse(contents) : (contents || []);
      parsedVideoModules = typeof video_modules === 'string' ? JSON.parse(video_modules) : (video_modules || []);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Return empty arrays if JSON is malformed
      parsedContents = [];
      parsedVideoModules = [];
    }

    res.json({
      contents: parsedContents,
      videoModules: parsedVideoModules,
    });

  } catch (err) {
    console.error('Database error in getCourseContentByCourseId:', err);
    console.error('CourseId received:', courseId);
    console.error('Error stack:', err.stack);
    
    res.status(500).json({ 
      error: 'Failed to fetch course content',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Upsert (POST or PUT) course content
const upsertCourseContent = async (req, res) => {
  const courseId = req.params.courseId;
  const { contents = [], videoModules = [] } = req.body;

  try {
    // Validate courseId
    if (!courseId || courseId.trim() === '') {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Validate request body
    if (!Array.isArray(contents)) {
      return res.status(400).json({ error: 'Contents must be an array' });
    }

    if (!Array.isArray(videoModules)) {
      return res.status(400).json({ error: 'Video modules must be an array' });
    }

    console.log(`Upserting course content for courseId: ${courseId}`);
    console.log(`Contents count: ${contents.length}, Video modules count: ${videoModules.length}`);

    // Check if record exists
    const check = await query(
      'SELECT id FROM course_content_modules WHERE course_id = $1',
      [courseId]
    );

    const contentsJson = JSON.stringify(contents);
    const videoModulesJson = JSON.stringify(videoModules);

    if (check.rows.length > 0) {
      // Update existing record
      await query(
        `UPDATE course_content_modules
         SET contents = $1, video_modules = $2, updated_at = CURRENT_TIMESTAMP
         WHERE course_id = $3`,
        [contentsJson, videoModulesJson, courseId]
      );
      console.log(`Updated course content for courseId: ${courseId}`);
    } else {
      // Insert new record
      await query(
        `INSERT INTO course_content_modules (course_id, contents, video_modules, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [courseId, contentsJson, videoModulesJson]
      );
      console.log(`Created new course content for courseId: ${courseId}`);
    }

    res.json({ 
      message: 'Course content saved successfully',
      courseId: courseId,
      contentsCount: contents.length,
      videoModulesCount: videoModules.length
    });

  } catch (err) {
    console.error('Database error in upsertCourseContent:', err);
    console.error('CourseId received:', courseId);
    console.error('Request body:', { contents, videoModules });
    console.error('Error stack:', err.stack);
    
    res.status(500).json({ 
      error: 'Failed to save course content',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  getCourseContentByCourseId,
  upsertCourseContent,
};
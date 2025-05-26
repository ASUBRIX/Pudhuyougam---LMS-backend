const { query } = require('../../config/database');

// Get course content by course ID
const getCourseContentByCourseId = async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const result = await query(
      'SELECT contents, video_modules FROM course_content_modules WHERE course_id = $1',
      [courseId]
    );
    if (result.rows.length === 0) {
      return res.json({ contents: [], videoModules: [] });
    }
    const { contents, video_modules } = result.rows[0];
    res.json({
      contents: contents ?? [],
      videoModules: video_modules ?? [],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course content' });
  }
};

// Upsert (POST or PUT) course content
const upsertCourseContent = async (req, res) => {
  const courseId = req.params.courseId;
  const { contents = [], videoModules = [] } = req.body;

  try {
    const check = await query(
      'SELECT id FROM course_content_modules WHERE course_id = $1',
      [courseId]
    );

    if (check.rows.length > 0) {
      await query(
        `UPDATE course_content_modules
         SET contents = $1, video_modules = $2, updated_at = CURRENT_TIMESTAMP
         WHERE course_id = $3`,
        [JSON.stringify(contents), JSON.stringify(videoModules), courseId]
      );
    } else {
      await query(
        `INSERT INTO course_content_modules (course_id, contents, video_modules, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [courseId, JSON.stringify(contents), JSON.stringify(videoModules)]
      );
    }

    res.json({ message: 'Course content saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save course content' });
  }
};

module.exports = {
  getCourseContentByCourseId,
  upsertCourseContent,
};

const { query } = require('../../config/database');

// --- CATEGORY LOGIC --- (Keep existing)
const getAllCategories = async (req, res) => {
  try {
    const categories = await query('SELECT * FROM course_categories ORDER BY id');
    const subcategories = await query('SELECT * FROM course_subcategories ORDER BY id');
    const merged = categories.rows.map(cat => ({
      ...cat,
      subcategories: subcategories.rows.filter(sub => sub.category_id === cat.id)
    }));
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const createCategoryWithSubs = async (req, res) => {
  const { title, subcategories } = req.body;
  try {
    const result = await query(
      'INSERT INTO course_categories (title) VALUES ($1) RETURNING id',
      [title]
    );
    const categoryId = result.rows[0].id;
    for (const sub of subcategories) {
      await query(
        'INSERT INTO course_subcategories (category_id, title) VALUES ($1, $2)',
        [categoryId, sub]
      );
    }
    res.status(201).json({ message: 'Category and subcategories created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// --- ENHANCED COURSE LOGIC ---
const getAllCourses = async (req, res) => {
  try {
    // First, let's check what columns exist in your courses table
    const result = await query(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM course_content_modules ccm WHERE ccm.course_id = c.id) as content_count
      FROM courses c
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

const getCourseStats = async (req, res) => {
  try {
    const total = await query('SELECT COUNT(*) FROM courses');
    const active = await query("SELECT COUNT(*) FROM courses WHERE visibility_status = 'published'");
    const pending = await query("SELECT COUNT(*) FROM courses WHERE review_status = 'pending'");
    res.json({
      total: parseInt(total.rows[0].count),
      active: parseInt(active.rows[0].count),
      pending: parseInt(pending.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course stats' });
  }
};

// ENHANCED: Create course with frontend data structure
const createCourse = async (req, res) => {
  try {
    console.log('Creating course with data:', req.body);
    
    // Handle both frontend wizard data and existing API data
    const {
      // From frontend wizard
      title,
      description,
      category,
      level = 'beginner',
      
      // Existing fields (with defaults)
      short_description = description || '',
      full_description = description || '',
      thumbnail = '',
      promo_video_url = '',
      price = 0,
      discount = 0,
      is_discount_enabled = false,
      validity_type = 'lifetime',
      expiry_date = null,
      language = 'English',
      is_featured = false,
      total_lectures = 0,
      total_duration = '',
      instructor_id = req.user?.id || 1, // Use logged-in admin or default
      message_to_reviewer = '',
      review_status = 'pending',
      visibility_status = 'draft'
    } = req.body;

    // Handle tags array - PostgreSQL expects array format
    const tagsArray = category ? [category] : [];

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Course title is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Course description is required' });
    }

    const result = await query(
      `INSERT INTO courses (
        title, short_description, full_description, thumbnail, promo_video_url,
        price, discount, is_discount_enabled, validity_type, expiry_date,
        language, level, is_featured, total_lectures, total_duration, instructor_id,
        tags, message_to_reviewer, review_status, visibility_status,
        created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW()
      ) RETURNING *`,
      [
        title, short_description, full_description, thumbnail, promo_video_url,
        price, discount, is_discount_enabled, validity_type, expiry_date,
        language, level, is_featured, total_lectures, total_duration, instructor_id,
        tagsArray, message_to_reviewer, review_status, visibility_status
      ]
    );

    console.log('Course created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ 
      error: 'Failed to create course',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ENHANCED: Update course with frontend data structure
const updateCourse = async (req, res) => {
  try {
    console.log('Updating course with data:', req.body);
    
    const {
      // From frontend wizard
      title,
      description,
      category,
      level,
      
      // Existing fields
      short_description,
      full_description,
      thumbnail = '',
      promo_video_url = '',
      price = 0,
      discount = 0,
      is_discount_enabled = false,
      validity_type = 'lifetime',
      expiry_date = null,
      language = 'English',
      is_featured = false,
      total_lectures = 0,
      total_duration = '',
      instructor_id,
      tags,
      message_to_reviewer = '',
      review_status = 'pending',
      visibility_status = 'draft'
    } = req.body;

    // Use description for both short and full if not provided separately
    const finalShortDescription = short_description || description || '';
    const finalFullDescription = full_description || description || '';
    
    // Handle tags array - if tags is provided use it, otherwise use category
    let finalTags;
    if (tags && Array.isArray(tags)) {
      finalTags = tags;
    } else if (category) {
      finalTags = [category];
    } else {
      finalTags = [];
    }

    const result = await query(
      `UPDATE courses SET
        title=$1, short_description=$2, full_description=$3, thumbnail=$4, promo_video_url=$5,
        price=$6, discount=$7, is_discount_enabled=$8, validity_type=$9, expiry_date=$10,
        language=$11, level=$12, is_featured=$13, total_lectures=$14, total_duration=$15, instructor_id=$16,
        tags=$17, message_to_reviewer=$18, review_status=$19, visibility_status=$20,
        updated_at=NOW()
      WHERE id=$21 RETURNING *`,
      [
        title, finalShortDescription, finalFullDescription, thumbnail, promo_video_url,
        price, discount, is_discount_enabled, validity_type, expiry_date,
        language, level, is_featured, total_lectures, total_duration, instructor_id,
        finalTags, message_to_reviewer, review_status, visibility_status, req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log('Course updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ 
      error: 'Failed to update course',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    // Also delete related content
    await query('DELETE FROM course_content_modules WHERE course_id = $1', [req.params.id]);
    await query('DELETE FROM course_pricing_plans WHERE course_id = $1', [req.params.id]);
    await query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

// NEW: Update course settings (for advanced settings step)
const updateCourseSettings = async (req, res) => {
  try {
    const {
      status,
      visibility,
      maxStudents,
      requireApproval,
      certificateEnabled,
      allowDiscussions,
      allowDownloads
    } = req.body;

    // For now, we'll update the existing fields that exist in your table
    const result = await query(
      `UPDATE courses SET
        visibility_status = $1,
        review_status = $2,
        is_featured = $3,
        updated_at = NOW()
      WHERE id = $4 RETURNING *`,
      [
        visibility === 'public' ? 'published' : 'private',
        status === 'published' ? 'approved' : 'pending',
        certificateEnabled || false,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating course settings:', err);
    res.status(500).json({ error: 'Failed to update course settings' });
  }
};

// Keep existing module functions
const getModulesForCourse = async (req, res) => {
  try {
    const result = await query('SELECT * FROM course_content_modules WHERE course_id = $1 ORDER BY sort_order', [req.params.courseId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
};

const createModule = async (req, res) => {
  const { course_id, title, sort_order } = req.body;
  try {
    const result = await query(
      'INSERT INTO course_content_modules (course_id, title, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [course_id, title, sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create module' });
  }
};

// Keep existing mock reviews
const getCourseReviews = async (req, res) => {
  try {
    res.json([
      { name: 'Tony K', date: new Date(), rating: 4.5, avatar: '/avatar.jpg' },
      { name: 'Ashwin R', date: new Date(), rating: 5, avatar: '/avatar.jpg' }
    ]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course reviews' });
  }
};

module.exports = {
  getAllCategories,
  createCategoryWithSubs,
  getAllCourses,
  getCourseById,
  getCourseStats,
  createCourse,
  updateCourse,
  updateCourseSettings, 
  deleteCourse,
  getModulesForCourse,
  createModule,
  getCourseReviews
};
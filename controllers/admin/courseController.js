const { query } = require('../../config/database');
const fs = require('fs');
const path = require('path');

// Category Management Functions
const getAllCategories = async (req, res) => {
  try {
    const categories = await query(`
      SELECT 
        cc.*,
        COALESCE(COUNT(csc.id), 0) as subcategory_count
      FROM course_categories cc
      LEFT JOIN course_subcategories csc ON cc.id = csc.category_id
      GROUP BY cc.id, cc.title, cc.created_at
      ORDER BY cc.created_at DESC
    `);
    const subcategories = await query(`
      SELECT csc.*, cc.title as category_title
      FROM course_subcategories csc
      JOIN course_categories cc ON csc.category_id = cc.id
      ORDER BY cc.title, csc.title
    `);
    
    const merged = categories.rows.map(cat => ({
      ...cat,
      subcategory_count: parseInt(cat.subcategory_count) || 0,
      subcategories: subcategories.rows.filter(sub => sub.category_id === cat.id)
    }));
    res.json({
      success: true,
      data: merged,
      total: categories.rows.length
    });
    
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const createCategoryWithSubs = async (req, res) => {
  const { title, subcategories = [] } = req.body;
  
  try {
    if (!title || title.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Category title must be at least 2 characters long'
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Category title must be less than 100 characters'
      });
    }

    const existingCategory = await query(
      'SELECT id FROM course_categories WHERE LOWER(title) = LOWER($1)',
      [title.trim()]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    const validSubcategories = subcategories
      .filter(sub => sub && typeof sub === 'string' && sub.trim().length >= 2 && sub.trim().length <= 100)
      .map(sub => sub.trim());

    await query('BEGIN');

    try {
      const categoryResult = await query(
        'INSERT INTO course_categories (title) VALUES ($1) RETURNING *',
        [title.trim()]
      );
      
      const categoryId = categoryResult.rows[0].id;
      const createdSubcategories = [];

      for (const subTitle of validSubcategories) {
        const existingSub = await query(
          'SELECT id FROM course_subcategories WHERE LOWER(title) = LOWER($1) AND category_id = $2',
          [subTitle, categoryId]
        );

        if (existingSub.rows.length === 0) {
          const subResult = await query(
            'INSERT INTO course_subcategories (category_id, title) VALUES ($1, $2) RETURNING *',
            [categoryId, subTitle]
          );
          createdSubcategories.push(subResult.rows[0]);
        }
      }

      await query('COMMIT');

      const newCategory = {
        ...categoryResult.rows[0],
        subcategories: createdSubcategories,
        subcategory_count: createdSubcategories.length
      };

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: newCategory
      });

    } catch (innerErr) {
      await query('ROLLBACK');
      console.error('Transaction error:', innerErr);
      throw innerErr;
    }

  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const addSubcategoriesToCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { subcategories = [] } = req.body;

  try {
    const categoryExists = await query(
      'SELECT id, title FROM course_categories WHERE id = $1',
      [categoryId]
    );

    if (categoryExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const validSubcategories = subcategories
      .filter(sub => sub && typeof sub === 'string' && sub.trim().length >= 2 && sub.trim().length <= 100)
      .map(sub => sub.trim());

    if (validSubcategories.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one valid subcategory is required'
      });
    }

    const createdSubcategories = [];

    for (const subTitle of validSubcategories) {
      const existingSub = await query(
        'SELECT id FROM course_subcategories WHERE LOWER(title) = LOWER($1) AND category_id = $2',
        [subTitle, categoryId]
      );

      if (existingSub.rows.length === 0) {
        const subResult = await query(
          'INSERT INTO course_subcategories (category_id, title) VALUES ($1, $2) RETURNING *',
          [categoryId, subTitle]
        );
        createdSubcategories.push(subResult.rows[0]);
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdSubcategories.length} subcategories added successfully`,
      data: createdSubcategories
    });

  } catch (err) {
    console.error('Error adding subcategories:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to add subcategories'
    });
  }
};

const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const categoryCheck = await query(`
      SELECT 
        cc.id, 
        cc.title,
        COUNT(c.id) as course_count
      FROM course_categories cc
      LEFT JOIN courses c ON c.tags @> ARRAY[cc.title]
      WHERE cc.id = $1
      GROUP BY cc.id, cc.title
    `, [categoryId]);

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const courseCount = parseInt(categoryCheck.rows[0].course_count);
    if (courseCount > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete category. ${courseCount} courses are using this category.`
      });
    }

    await query('DELETE FROM course_categories WHERE id = $1', [categoryId]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    });
  }
};

// Course Management Functions
const getAllCourses = async (req, res) => {
  try {
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

const createCourse = async (req, res) => {
  try {
    console.log('Creating course with data:', req.body);
    
    const {
      title,
      description,
      category,
      level = 'beginner',
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
      instructor_id = req.user?.id || 1,
      message_to_reviewer = '',
      review_status = 'pending',
      visibility_status = 'draft'
    } = req.body;

    const tagsArray = category ? [category] : [];

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

const updateCourse = async (req, res) => {
  try {
    console.log('Updating course with data:', req.body);
    
    const {
      title,
      description,
      category,
      level,
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

    const finalShortDescription = short_description || description || '';
    const finalFullDescription = full_description || description || '';
    
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
    await query('DELETE FROM course_content_modules WHERE course_id = $1', [req.params.id]);
    await query('DELETE FROM course_pricing_plans WHERE course_id = $1', [req.params.id]);
    await query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

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

// Module Management Functions
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

// 🔥 THUMBNAIL UPLOAD FUNCTION
const uploadThumbnail = async (req, res) => {
  try {
    console.log('Thumbnail upload request received');
    console.log('Request body:', req.body);
    console.log('File info:', req.file);

    const { courseId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No thumbnail file provided',
        success: false 
      });
    }

    if (!courseId) {
      // Clean up uploaded file if no courseId
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        error: 'Course ID is required',
        success: false 
      });
    }

    // Verify course exists
    const courseCheck = await query('SELECT id FROM courses WHERE id = $1', [courseId]);
    if (courseCheck.rows.length === 0) {
      // Clean up uploaded file if course doesn't exist
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ 
        error: 'Course not found',
        success: false 
      });
    }

    // Construct the file path (relative URL for frontend)
    const thumbnailUrl = `/uploads/course-thumbnails/${req.file.filename}`;
    
    console.log('Updating course thumbnail:', { courseId, thumbnailUrl, filePath: req.file.path });

    // Update the course with the thumbnail path
    const result = await query(
      'UPDATE courses SET thumbnail = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [thumbnailUrl, courseId]
    );

    if (result.rows.length === 0) {
      // Clean up uploaded file if update failed
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ 
        error: 'Failed to update course with thumbnail',
        success: false 
      });
    }

    console.log('Thumbnail updated successfully for course:', courseId);

    res.json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      thumbnailUrl: thumbnailUrl,
      fileName: req.file.filename,
      fileSize: req.file.size,
      course: result.rows[0]
    });

  } catch (error) {
    console.error('Thumbnail upload error:', error);
    
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file after error');
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload thumbnail',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export all functions
module.exports = {
  // Category functions
  getAllCategories,
  createCategoryWithSubs,
  addSubcategoriesToCategory,
  deleteCategory,
  
  // Course functions
  getAllCourses,
  getCourseById,
  getCourseStats,
  createCourse,
  updateCourse,
  updateCourseSettings, 
  deleteCourse,
  
  // Module functions
  getModulesForCourse,
  createModule,
  getCourseReviews,
  
  // 🔥 NEW: Thumbnail upload
  uploadThumbnail
};
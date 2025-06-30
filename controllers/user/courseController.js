// controllers/user/courseController.js
// Updated to work with your existing tables (NO RATING functionality)

const { query } = require('../../config/database');

// Get all public courses with filtering and search
const getAllPublicCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      level, 
      search, 
      minPrice, 
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ["visibility_status = 'published'", "review_status = 'approved'"];
    let queryParams = [];

    // Build dynamic WHERE clause
    if (category) {
      queryParams.push(category);
      whereConditions.push(`$${queryParams.length} = ANY(tags)`);
    }

    if (level) {
      queryParams.push(level);
      whereConditions.push(`level = $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      whereConditions.push(`(title ILIKE $${queryParams.length} OR short_description ILIKE $${queryParams.length})`);
    }

    if (minPrice) {
      queryParams.push(parseFloat(minPrice));
      whereConditions.push(`price >= $${queryParams.length}`);
    }

    if (maxPrice) {
      queryParams.push(parseFloat(maxPrice));
      whereConditions.push(`price <= $${queryParams.length}`);
    }

    // Add pagination params
    queryParams.push(limit, offset);

    // Simplified query - only enrollment count, no rating
    const coursesQuery = `
      SELECT 
        c.*,
        COALESCE(e.enrollment_count, 0) as enrolled_count
      FROM courses c
      LEFT JOIN (
        SELECT course_id, COUNT(*) as enrollment_count
        FROM enrollments
        GROUP BY course_id
      ) e ON c.id = e.course_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses c  
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [coursesResult, countResult] = await Promise.all([
      query(coursesQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const courses = coursesResult.rows.map(course => ({
      ...course,
      enrolled_count: parseInt(course.enrolled_count) || 0,
      avg_rating: 0, // No rating functionality
      review_count: 0, // No rating functionality
      effective_price: course.is_discount_enabled 
        ? course.price - (course.price * course.discount / 100)
        : course.price
    }));

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

  } catch (err) {
    console.error('Error fetching public courses:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch courses' 
    });
  }
};

// Get all categories with subcategories
const getAllCategories = async (req, res) => {
  try {
    const categories = await query(`
      SELECT 
        cc.*,
        COALESCE(course_count.count, 0) as course_count
      FROM course_categories cc
      LEFT JOIN (
        SELECT 
          unnest(tags) as category_name,
          COUNT(*) as count
        FROM courses c
        WHERE c.visibility_status = 'published' 
          AND c.review_status = 'approved'
        GROUP BY unnest(tags)
      ) course_count ON cc.title = course_count.category_name
      ORDER BY cc.title
    `);

    const subcategories = await query(`
      SELECT csc.*, cc.title as category_title
      FROM course_subcategories csc
      JOIN course_categories cc ON csc.category_id = cc.id
      ORDER BY cc.title, csc.title
    `);
    
    const categoriesWithSubs = categories.rows.map(cat => ({
      ...cat,
      course_count: parseInt(cat.course_count) || 0,
      subcategories: subcategories.rows.filter(sub => sub.category_id === cat.id)
    }));

    res.json({
      success: true,
      data: categoriesWithSubs
    });
    
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch categories' 
    });
  }
};

// Get featured courses
const getFeaturedCourses = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const result = await query(`
      SELECT 
        c.*,
        COALESCE(e.enrollment_count, 0) as enrolled_count
      FROM courses c
      LEFT JOIN (
        SELECT course_id, COUNT(*) as enrollment_count
        FROM enrollments
        GROUP BY course_id
      ) e ON c.id = e.course_id
      WHERE visibility_status = 'published' 
        AND review_status = 'approved'
        AND is_featured = true
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    const courses = result.rows.map(course => ({
      ...course,
      enrolled_count: parseInt(course.enrolled_count) || 0,
      avg_rating: 0, // No rating functionality
      review_count: 0, // No rating functionality
      effective_price: course.is_discount_enabled 
        ? course.price - (course.price * course.discount / 100)
        : course.price
    }));

    res.json({
      success: true,
      data: courses
    });

  } catch (err) {
    console.error('Error fetching featured courses:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch featured courses' 
    });
  }
};

// Get popular courses (based on enrollment count)
const getPopularCourses = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const result = await query(`
      SELECT 
        c.*,
        COALESCE(e.enrollment_count, 0) as enrolled_count
      FROM courses c
      LEFT JOIN (
        SELECT course_id, COUNT(*) as enrollment_count
        FROM enrollments
        GROUP BY course_id
      ) e ON c.id = e.course_id
      WHERE visibility_status = 'published' 
        AND review_status = 'approved'
      ORDER BY COALESCE(e.enrollment_count, 0) DESC
      LIMIT $1
    `, [limit]);

    const courses = result.rows.map(course => ({
      ...course,
      enrolled_count: parseInt(course.enrolled_count) || 0,
      avg_rating: 0, // No rating functionality
      review_count: 0, // No rating functionality
      effective_price: course.is_discount_enabled 
        ? course.price - (course.price * course.discount / 100)
        : course.price
    }));

    res.json({
      success: true,
      data: courses
    });

  } catch (err) {
    console.error('Error fetching popular courses:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch popular courses' 
    });
  }
};

// Get offer courses (courses with discounts)
const getOfferCourses = async (req, res) => {
  try {
    const { limit = 4 } = req.query;

    const result = await query(`
      SELECT 
        c.*,
        COALESCE(e.enrollment_count, 0) as enrolled_count
      FROM courses c
      LEFT JOIN (
        SELECT course_id, COUNT(*) as enrollment_count
        FROM enrollments
        GROUP BY course_id
      ) e ON c.id = e.course_id
      WHERE visibility_status = 'published' 
        AND review_status = 'approved'
        AND is_discount_enabled = true
        AND discount > 0
      ORDER BY discount DESC, created_at DESC
      LIMIT $1
    `, [limit]);

    const courses = result.rows.map(course => ({
      ...course,
      enrolled_count: parseInt(course.enrolled_count) || 0,
      avg_rating: 0, // No rating functionality
      effective_price: course.price - (course.price * course.discount / 100),
      savings: course.price * course.discount / 100
    }));

    res.json({
      success: true,
      data: courses
    });

  } catch (err) {
    console.error('Error fetching offer courses:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch offer courses' 
    });
  }
};

// Get course by ID with detailed information
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const courseResult = await query(`
      SELECT 
        c.*,
        COALESCE(e.enrollment_count, 0) as enrolled_count
      FROM courses c
      LEFT JOIN (
        SELECT course_id, COUNT(*) as enrollment_count
        FROM enrollments
        GROUP BY course_id
      ) e ON c.id = e.course_id
      WHERE c.id = $1 
        AND c.visibility_status = 'published' 
        AND c.review_status = 'approved'
    `, [id]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Course not found' 
      });
    }

    const course = {
      ...courseResult.rows[0],
      enrolled_count: parseInt(courseResult.rows[0].enrolled_count) || 0,
      avg_rating: 0, // No rating functionality
      review_count: 0, // No rating functionality
      effective_price: courseResult.rows[0].is_discount_enabled 
        ? courseResult.rows[0].price - (courseResult.rows[0].price * courseResult.rows[0].discount / 100)
        : courseResult.rows[0].price
    };

    res.json({
      success: true,
      data: course
    });

  } catch (err) {
    console.error('Error fetching course by ID:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch course' 
    });
  }
};

// Get course pricing plans
const getCoursePricing = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT * FROM course_pricing_plans 
      WHERE course_id = $1 
      ORDER BY effective_price ASC
    `, [id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error('Error fetching course pricing:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch course pricing' 
    });
  }
};

// Get course content preview
const getCourseContentPreview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT contents, video_modules 
      FROM course_content_modules 
      WHERE course_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: { contents: [], videoModules: [] }
      });
    }

    const { contents, video_modules } = result.rows[0];
    
    let parsedContents = [];
    let parsedVideoModules = [];

    try {
      parsedContents = typeof contents === 'string' ? JSON.parse(contents) : (contents || []);
      parsedVideoModules = typeof video_modules === 'string' ? JSON.parse(video_modules) : (video_modules || []);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
    }

    // Limit preview content
    const previewContents = parsedContents.slice(0, 2).map(module => ({
      ...module,
      lessons: module.lessons ? module.lessons.slice(0, 1) : []
    }));

    const previewVideoModules = parsedVideoModules.slice(0, 2).map(module => ({
      ...module,
      videos: module.videos ? module.videos.slice(0, 1) : []
    }));

    res.json({
      success: true,
      data: {
        contents: previewContents,
        videoModules: previewVideoModules,
        isPreview: true
      }
    });

  } catch (err) {
    console.error('Error fetching course content preview:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch course content preview' 
    });
  }
};

// Placeholder functions for enrollment features
const getEnrolledCourses = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Enrollment functionality not yet implemented for your table structure.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getCourseProgress = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Progress tracking not yet implemented for your table structure.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Enrollment functionality not yet implemented for your table structure.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const updateCourseProgress = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Progress update not yet implemented for your table structure.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getFullCourseContent = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Full content access not yet implemented for your table structure.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getAllPublicCourses,
  getAllCategories,
  getFeaturedCourses,
  getPopularCourses,
  getOfferCourses,
  getCourseById,
  getCoursePricing,
  getCourseContentPreview,
  getEnrolledCourses,
  getCourseProgress,
  enrollInCourse,
  updateCourseProgress,
  getFullCourseContent
};
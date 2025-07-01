// controllers/user/courseController.js
// Updated to work with your existing tables (NO RATING functionality)

const { query } = require('../../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     CourseQueryParams:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           description: Page number for pagination
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 12
 *           description: Number of items per page
 *         category:
 *           type: string
 *           description: Filter by category name
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Filter by difficulty level
 *         search:
 *           type: string
 *           description: Search term for title and description
 *         minPrice:
 *           type: number
 *           minimum: 0
 *           description: Minimum price filter
 *         maxPrice:
 *           type: number
 *           minimum: 0
 *           description: Maximum price filter
 *         sortBy:
 *           type: string
 *           enum: [created_at, price, title, enrolled_count]
 *           default: created_at
 *           description: Field to sort by
 *         sortOrder:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *           description: Sort order
 */

/**
 * Get all public courses with filtering and search
 * 
 * Retrieves a paginated list of published and approved courses with optional filtering
 * by category, level, price range, and search terms. Supports sorting and pagination.
 * 
 * @async
 * @function getAllPublicCourses
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters for filtering and pagination
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=12] - Number of courses per page (max 50)
 * @param {string} [req.query.category] - Filter by category name (must exist in tags array)
 * @param {string} [req.query.level] - Filter by difficulty level (beginner/intermediate/advanced)
 * @param {string} [req.query.search] - Search term for course title and description (case-insensitive)
 * @param {number} [req.query.minPrice] - Minimum price filter (inclusive)
 * @param {number} [req.query.maxPrice] - Maximum price filter (inclusive)
 * @param {string} [req.query.sortBy=created_at] - Field to sort by (created_at/price/title/enrolled_count)
 * @param {string} [req.query.sortOrder=DESC] - Sort order (ASC/DESC)
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Sends JSON response with course data and pagination info
 * 
 * @example
 * // Request: GET /api/courses?page=1&limit=10&category=Programming&level=beginner&search=javascript
 * // Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "JavaScript Basics",
 *       "price": 99.99,
 *       "effective_price": 79.99,
 *       "enrolled_count": 150,
 *       "is_discount_enabled": true,
 *       "discount": 20,
 *       ...
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 45,
 *     "totalPages": 5
 *   }
 * }
 * 
 * @throws {500} Internal server error if database query fails
 */
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

/**
 * Get all categories with subcategories and course counts
 * 
 * Retrieves all course categories along with their subcategories and the count
 * of published courses in each category.
 * 
 * @async
 * @function getAllCategories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Sends JSON response with categories data
 * 
 * @example
 * // Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "Programming",
 *       "course_count": 15,
 *       "subcategories": [
 *         {
 *           "id": 1,
 *           "title": "Web Development",
 *           "category_id": 1
 *         }
 *       ]
 *     }
 *   ]
 * }
 * 
 * @throws {500} Internal server error if database query fails
 */
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

/**
 * Get featured courses
 * 
 * Retrieves courses that have been marked as featured by administrators.
 * Only returns published and approved courses.
 * 
 * @async
 * @function getFeaturedCourses
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit=6] - Maximum number of featured courses to return
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Sends JSON response with featured courses data
 * 
 * @example
 * // Request: GET /api/courses/featured?limit=3
 * // Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "Advanced React Course",
 *       "is_featured": true,
 *       "enrolled_count": 250,
 *       "effective_price": 79.99,
 *       ...
 *     }
 *   ]
 * }
 * 
 * @throws {500} Internal server error if database query fails
 */
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

/**
 * Get popular courses based on enrollment count
 * 
 * Retrieves courses ordered by the number of enrolled students (most popular first).
 * Only returns published and approved courses.
 * 
 * @async
 * @function getPopularCourses
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit=6] - Maximum number of popular courses to return
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Sends JSON response with popular courses data
 * 
 * @example
 * // Request: GET /api/courses/popular?limit=5
 * // Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "JavaScript Fundamentals",
 *       "enrolled_count": 500,
 *       "effective_price": 99.99,
 *       ...
 *     }
 *   ]
 * }
 * 
 * @throws {500} Internal server error if database query fails
 */
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

/**
 * Get courses with active discounts and special offers
 * 
 * Retrieves courses that have discounts enabled and discount percentage greater than 0.
 * Results are ordered by discount percentage (highest first) and creation date.
 * 
 * @async
 * @function getOfferCourses
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit=4] - Maximum number of offer courses to return
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Sends JSON response with offer courses data
 * 
 * @example
 * // Request: GET /api/courses/offer-courses?limit=2
 * // Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "Python for Beginners",
 *       "price": 100.00,
 *       "discount": 25,
 *       "effective_price": 75.00,
 *       "savings": 25.00,
 *       "is_discount_enabled": true,
 *       ...
 *     }
 *   ]
 * }
 * 
 * @throws {500} Internal server error if database query fails
 */
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

/**
 * Get detailed information about a specific course
 * 
 * Retrieves complete course information including enrollment count and pricing details.
 * Only returns courses that are published and approved.
 * 
 * @async
 * @function getCourseById
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Course ID
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Sends JSON response with course data
 * 
 * @example
 * // Request: GET /api/courses/123
 * // Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "title": "Full Stack Development",
 *     "short_description": "Learn full stack development...",
 *     "price": 199.99,
 *     "effective_price": 159.99,
 *     "enrolled_count": 45,
 *     ...
 *   }
 * }
 * 
 * @throws {404} Course not found or not accessible
 * @throws {500} Internal server error if database query fails
 */
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

/**
 * Get pricing plans for a specific course
 * 
 * Retrieves all available pricing plans for a course, ordered by effective price.
 * 
 * @async
 * @function getCoursePricing
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Course ID
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Sends JSON response with pricing plans data
 * 
 * @example
 * // Request: GET /api/courses/123/pricing
 * // Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "course_id": 123,
 *       "duration": 6,
 *       "unit": "months",
 *       "price": 199.99,
 *       "effective_price": 179.99,
 *       "is_promoted": true
 *     }
 *   ]
 * }
 * 
 * @throws {500} Internal server error if database query fails
 */
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

/**
 * Get limited preview of course content
 * 
 * Retrieves a preview of course content including the first 2 modules with 1 lesson each.
 * This is used to show potential students what the course contains without full access.
 * 
 * @async
 * @function getCourseContentPreview
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Course ID
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Sends JSON response with preview content data
 * 
 * @example
 * // Request: GET /api/courses/123/content-preview
 * // Response:
 * {
 *   "success": true,
 *   "data": {
 *     "contents": [
 *       {
 *         "id": 1,
 *         "title": "Introduction",
 *         "lessons": [
 *           {
 *             "id": 1,
 *             "title": "Course Overview",
 *             "duration": "5 min"
 *           }
 *         ]
 *       }
 *     ],
 *     "videoModules": [...],
 *     "isPreview": true
 *   }
 * }
 * 
 * @throws {500} Internal server error if database query fails
 */
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

// ============= PLACEHOLDER FUNCTIONS FOR ENROLLMENT FEATURES =============
// These functions are not yet implemented due to table structure requirements

/**
 * Get user's enrolled courses (Not Yet Implemented)
 * 
 * @async
 * @function getEnrolledCourses
 * @param {Object} req - Express request object (authenticated)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns 501 status indicating feature not implemented
 */
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

/**
 * Get course progress for authenticated user (Not Yet Implemented)
 * 
 * @async
 * @function getCourseProgress
 * @param {Object} req - Express request object (authenticated)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns 501 status indicating feature not implemented
 */
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

/**
 * Enroll user in a course (Not Yet Implemented)
 * 
 * @async
 * @function enrollInCourse
 * @param {Object} req - Express request object (authenticated)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns 501 status indicating feature not implemented
 */
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

/**
 * Update course progress for authenticated user (Not Yet Implemented)
 * 
 * @async
 * @function updateCourseProgress
 * @param {Object} req - Express request object (authenticated)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns 501 status indicating feature not implemented
 */
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

/**
 * Get full course content for enrolled users (Not Yet Implemented)
 * 
 * @async
 * @function getFullCourseContent
 * @param {Object} req - Express request object (authenticated)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns 501 status indicating feature not implemented
 */
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
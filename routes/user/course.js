// routes/user/course.js
const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const userCourseController = require('../../controllers/user/courseController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique course identifier
 *         title:
 *           type: string
 *           description: Course title
 *         short_description:
 *           type: string
 *           description: Brief course description
 *         full_description:
 *           type: string
 *           description: Detailed course description
 *         thumbnail:
 *           type: string
 *           description: Course thumbnail image URL
 *         price:
 *           type: number
 *           description: Original course price
 *         effective_price:
 *           type: number
 *           description: Price after discount (if applicable)
 *         discount:
 *           type: number
 *           description: Discount percentage (0-100)
 *         is_discount_enabled:
 *           type: boolean
 *           description: Whether discount is active
 *         is_featured:
 *           type: boolean
 *           description: Whether course is featured
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Course difficulty level
 *         language:
 *           type: string
 *           description: Course language
 *         total_duration:
 *           type: string
 *           description: Total course duration
 *         total_lectures:
 *           type: integer
 *           description: Number of lectures
 *         enrolled_count:
 *           type: integer
 *           description: Number of enrolled students
 *         visibility_status:
 *           type: string
 *           enum: [draft, published, private]
 *           description: Course visibility status
 *         review_status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Course review status
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Course creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Category ID
 *         title:
 *           type: string
 *           description: Category name
 *         course_count:
 *           type: integer
 *           description: Number of courses in this category
 *         subcategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subcategory'
 *     
 *     Subcategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Subcategory ID
 *         title:
 *           type: string
 *           description: Subcategory name
 *         category_id:
 *           type: integer
 *           description: Parent category ID
 *     
 *     PricingPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Pricing plan ID
 *         course_id:
 *           type: integer
 *           description: Associated course ID
 *         duration:
 *           type: integer
 *           description: Plan duration
 *         unit:
 *           type: string
 *           enum: [days, months, years]
 *           description: Duration unit
 *         price:
 *           type: number
 *           description: Plan price
 *         discount:
 *           type: number
 *           description: Plan discount percentage
 *         effective_price:
 *           type: number
 *           description: Final price after discount
 *         is_promoted:
 *           type: boolean
 *           description: Whether plan is promoted
 *     
 *     APIResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Request success status
 *         data:
 *           type: object
 *           description: Response data
 *         error:
 *           type: string
 *           description: Error message (if any)
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             totalPages:
 *               type: integer
 *   
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Courses
 *     description: Course management endpoints
 *   - name: Categories
 *     description: Course category endpoints
 *   - name: Enrollment
 *     description: Course enrollment and progress endpoints
 */

// ============= PUBLIC ROUTES =============

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all public courses
 *     description: Retrieve a paginated list of published and approved courses with filtering options
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *           maximum: 50
 *         description: Number of courses per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in course title and description
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, price, title, enrolled_count]
 *           default: created_at
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server error
 */
router.get('/', userCourseController.getAllPublicCourses);

/**
 * @swagger
 * /api/courses/categories:
 *   get:
 *     summary: Get all course categories
 *     description: Retrieve all course categories with subcategories and course counts
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *       500:
 *         description: Server error
 */
router.get('/categories', userCourseController.getAllCategories);

/**
 * @swagger
 * /api/courses/featured:
 *   get:
 *     summary: Get featured courses
 *     description: Retrieve courses marked as featured by administrators
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *           maximum: 20
 *         description: Maximum number of featured courses to return
 *     responses:
 *       200:
 *         description: Featured courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server error
 */
router.get('/featured', userCourseController.getFeaturedCourses);

/**
 * @swagger
 * /api/courses/popular:
 *   get:
 *     summary: Get popular courses
 *     description: Retrieve courses ordered by enrollment count (most popular first)
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *           maximum: 20
 *         description: Maximum number of popular courses to return
 *     responses:
 *       200:
 *         description: Popular courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server error
 */
router.get('/popular', userCourseController.getPopularCourses);

/**
 * @swagger
 * /api/courses/offer-courses:
 *   get:
 *     summary: Get courses with special offers
 *     description: Retrieve courses that have active discounts and special offers
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *           maximum: 20
 *         description: Maximum number of offer courses to return
 *     responses:
 *       200:
 *         description: Offer courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Course'
 *                           - type: object
 *                             properties:
 *                               savings:
 *                                 type: number
 *                                 description: Amount saved due to discount
 *       500:
 *         description: Server error
 */
router.get('/offer-courses', userCourseController.getOfferCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     description: Retrieve detailed information about a specific course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIResponse'
 *       500:
 *         description: Server error
 */
router.get('/:id', userCourseController.getCourseById);

/**
 * @swagger
 * /api/courses/{id}/pricing:
 *   get:
 *     summary: Get course pricing plans
 *     description: Retrieve all pricing plans available for a specific course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Pricing plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PricingPlan'
 *       500:
 *         description: Server error
 */
router.get('/:id/pricing', userCourseController.getCoursePricing);

/**
 * @swagger
 * /api/courses/{id}/content-preview:
 *   get:
 *     summary: Get course content preview
 *     description: Retrieve a limited preview of course content (first 2 modules, 1 lesson each)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course preview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         contents:
 *                           type: array
 *                           description: Preview of course modules
 *                         videoModules:
 *                           type: array
 *                           description: Preview of video modules
 *                         isPreview:
 *                           type: boolean
 *                           description: Indicates this is preview content
 *       500:
 *         description: Server error
 */
router.get('/:id/content-preview', userCourseController.getCourseContentPreview);

// ============= PROTECTED ROUTES =============
// Apply authentication middleware to all routes below
router.use(auth);

/**
 * @swagger
 * /api/courses/my/enrolled:
 *   get:
 *     summary: Get user's enrolled courses
 *     description: Retrieve courses that the authenticated user has enrolled in
 *     tags: [Enrollment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of courses per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *         description: Filter by enrollment status
 *     responses:
 *       200:
 *         description: Enrolled courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Course'
 *                           - type: object
 *                             properties:
 *                               progress:
 *                                 type: number
 *                                 description: Completion percentage (0-100)
 *                               enrollment_date:
 *                                 type: string
 *                                 format: date-time
 *                               last_accessed:
 *                                 type: string
 *                                 format: date-time
 *       401:
 *         description: Authentication required
 *       501:
 *         description: Feature not yet implemented
 */
router.get('/my/enrolled', userCourseController.getEnrolledCourses);

/**
 * @swagger
 * /api/courses/my/progress/{courseId}:
 *   get:
 *     summary: Get course progress
 *     description: Retrieve the authenticated user's progress for a specific course
 *     tags: [Enrollment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         progress:
 *                           type: number
 *                           description: Completion percentage (0-100)
 *                         completed_lessons:
 *                           type: array
 *                           items:
 *                             type: integer
 *                           description: IDs of completed lessons
 *                         last_accessed:
 *                           type: string
 *                           format: date-time
 *                         time_spent:
 *                           type: integer
 *                           description: Total time spent in seconds
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Course or enrollment not found
 *       501:
 *         description: Feature not yet implemented
 */
router.get('/my/progress/:courseId', userCourseController.getCourseProgress);

/**
 * @swagger
 * /api/courses/{id}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     description: Enroll the authenticated user in a specific course
 *     tags: [Enrollment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pricing_plan_id:
 *                 type: integer
 *                 description: ID of the selected pricing plan (optional)
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         enrollment_id:
 *                           type: integer
 *                         course_id:
 *                           type: integer
 *                         enrollment_date:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid request or already enrolled
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Course not found
 *       501:
 *         description: Feature not yet implemented
 */
router.post('/:id/enroll', userCourseController.enrollInCourse);

/**
 * @swagger
 * /api/courses/my/progress/{courseId}:
 *   put:
 *     summary: Update course progress
 *     description: Update the authenticated user's progress for a specific course
 *     tags: [Enrollment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - progress
 *             properties:
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Completion percentage (0-100)
 *               completed_lessons:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs of completed lessons
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIResponse'
 *       400:
 *         description: Invalid progress data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Course or enrollment not found
 *       501:
 *         description: Feature not yet implemented
 */
router.put('/my/progress/:courseId', userCourseController.updateCourseProgress);

/**
 * @swagger
 * /api/courses/{id}/full-content:
 *   get:
 *     summary: Get full course content
 *     description: Retrieve complete course content for enrolled users
 *     tags: [Enrollment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Full course content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         contents:
 *                           type: array
 *                           description: Complete course modules and lessons
 *                         videoModules:
 *                           type: array
 *                           description: Complete video modules
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User not enrolled in course
 *       404:
 *         description: Course not found
 *       501:
 *         description: Feature not yet implemented
 */
router.get('/:id/full-content', userCourseController.getFullCourseContent);

module.exports = router;
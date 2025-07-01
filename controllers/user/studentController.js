const Student = require('../../models/student');

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Authenticated user ID
 *       example:
 *         id: 123
 */

/**
 * Get student profile by authenticated user ID
 * 
 * @async
 * @function getProfile
 * @description Retrieves the student profile information for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (populated by auth middleware)
 * @param {number} req.user.id - Authenticated user's ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns student profile data or error response
 * 
 * @throws {404} When student profile is not found for the authenticated user
 * @throws {500} When database operation fails or other server errors occur
 * 
 * @example
 * // Success response (200)
 * {
 *   "id": 1,
 *   "userId": 123,
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "john.doe@university.edu",
 *   "phone": "+1234567890",
 *   "enrollmentDate": "2024-01-15",
 *   "status": "active",
 *   "program": "Computer Science",
 *   "semester": "Fall",
 *   "year": 2024,
 *   "courses": ["CS101", "MATH201", "PHYS101"]
 * }
 * 
 * @example
 * // Error response (404)
 * {
 *   "error": "Student not found."
 * }
 * 
 * @example
 * // Error response (500)
 * {
 *   "error": "Failed to fetch student profile."
 * }
 */
const getProfile = async (req, res) => {
  try {
    const student = await Student.findByUserId(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    res.status(200).json(student);
  } catch (err) {
    console.error("Error in getProfile:", err); 
    res.status(500).json({ error: 'Failed to fetch student profile.' });
  }
};

/**
 * Update student profile information
 * 
 * @async
 * @function updateProfile
 * @description Updates the student profile information for the authenticated user.
 * Handles both form data and JSON requests, supports file uploads for profile pictures.
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (populated by auth middleware)
 * @param {number} req.user.id - Authenticated user's ID
 * @param {Object} req.body - Request body containing student update data
 * @param {string} [req.body.first_name] - Student's first name
 * @param {string} [req.body.last_name] - Student's last name
 * @param {string} [req.body.email] - Student's email address
 * @param {string} [req.body.phone] - Student's phone number
 * @param {string} [req.body.enrollment_date] - Student's enrollment date (YYYY-MM-DD format)
 * @param {string} [req.body.status] - Student's status (active, inactive, graduated, suspended)
 * @param {string} [req.body.program] - Student's academic program
 * @param {string} [req.body.semester] - Current semester
 * @param {number} [req.body.year] - Current academic year
 * @param {Array<string>|string} [req.body.courses] - List of courses (array or comma-separated string)
 * @param {Object} [req.file] - Uploaded profile picture file (handled by multer middleware)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns updated student profile data or error response
 * 
 * @throws {404} When student profile is not found for the authenticated user
 * @throws {500} When database operation fails or other server errors occur
 * 
 * @example
 * // Request body
 * {
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "email": "john.doe@university.edu",
 *   "phone": "+1234567890",
 *   "enrollment_date": "2024-01-15",
 *   "status": "active",
 *   "program": "Computer Science",
 *   "semester": "Fall",
 *   "year": 2024,
 *   "courses": ["CS101", "MATH201", "PHYS101"]
 * }
 * 
 * @example
 * // Success response (200)
 * {
 *   "id": 1,
 *   "userId": 123,
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "john.doe@university.edu",
 *   "phone": "+1234567890",
 *   "enrollmentDate": "2024-01-15",
 *   "status": "active",
 *   "program": "Computer Science",
 *   "semester": "Fall",
 *   "year": 2024,
 *   "courses": ["CS101", "MATH201", "PHYS101"]
 * }
 * 
 * @example
 * // Error response (404)
 * {
 *   "error": "Student not found."
 * }
 * 
 * @example
 * // Error response (500)
 * {
 *   "error": "Failed to update student profile."
 * }
 */
const updateProfile = async (req, res) => {
  console.log("Update profile function is working");

  try {
    const student = await Student.findByUserId(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const raw = req.body;
    console.log('print form data received from frontend:', raw);

    // Transform request data to match database schema
    const updateData = {
      userId: req.user.id,
      firstName: raw.first_name,
      lastName: raw.last_name,
      email: raw.email,
      phone: raw.phone,
      enrollmentDate: raw.enrollment_date,
      status: raw.status,
      program: raw.program,
      semester: raw.semester,
      year: raw.year,
      courses: Array.isArray(raw.courses)
        ? raw.courses
        : typeof raw.courses === 'string'
          ? raw.courses.split(',').map(c => c.trim())
          : [],
    };

    const updated = await Student.update(student.id, updateData);
    console.log('updated data:', updated);

    res.status(200).json(updated);
  } catch (err) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({ error: 'Failed to update student profile.' });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
const { query } = require('../../config/database');

/**
 * @fileoverview Admin Faculty Controller - Handles CRUD operations for faculty management
 * @description This controller manages all administrative functions for faculty members,
 * including creating, reading, updating, and deleting faculty records. All endpoints
 * require admin authentication.
 */

/**
 * Get all faculty members
 * @async
 * @function getAllFaculties
 * @description Retrieves all faculty members from the database, ordered by ID (newest first).
 * This endpoint is restricted to admin users only and provides access to all faculty data
 * including sensitive information for administrative purposes.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with all faculty members or error
 */
const getAllFaculties = async (req, res) => {
  try {
    const result = await query('SELECT * FROM faculties ORDER BY id DESC');
    console.log(`Admin retrieved ${result.rows.length} faculty records`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching all faculties:', err);
    res.status(500).json({ error: 'Failed to fetch faculties' });
  }
};

/**
 * Create new faculty member
 * @async
 * @function createFaculty
 * @description Creates a new faculty member with auto-generated faculty ID.
 * The faculty ID is generated in format FAC### where ### is the zero-padded ID.
 * Board member status is properly handled with boolean conversion.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.name - Full name of the faculty member (required)
 * @param {string} req.body.email - Email address of the faculty member (required)
 * @param {string} req.body.phone - Phone number of the faculty member
 * @param {string} req.body.department - Department the faculty member belongs to (required)
 * @param {string} req.body.designation - Job title or designation (required)
 * @param {string} req.body.status - Current status (active/inactive) (required)
 * @param {string} [req.body.qualification] - Educational qualifications
 * @param {string} [req.body.experience] - Years of experience or description
 * @param {string} [req.body.avatar] - URL or path to profile image
 * @param {string} [req.body.joiningDate] - Date when faculty member joined
 * @param {string} [req.body.bio] - Biography or description
 * @param {boolean} [req.body.board_member=false] - Whether faculty member is a board member
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with created faculty member or error
 */
const createFaculty = async (req, res) => {
  const {
    name, email, phone, department, designation,
    status, qualification, experience, avatar,
    joiningDate, bio, board_member
  } = req.body;

  // Validate required fields
  if (!name || !email || !department || !designation || !status) {
    return res.status(400).json({ 
      error: 'Name, email, department, designation, and status are required fields' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  // Validate status value
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Status must be either "active" or "inactive"' });
  }

  try {
    // Step 1: Insert faculty record and get the auto-generated ID
    const result = await query(
      `INSERT INTO faculties 
        (name, email, phone, department, designation, status, qualification, experience, avatar, joining_date, bio, board_member) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id`,
      [
        name.trim(), 
        email.trim().toLowerCase(), 
        phone?.trim(), 
        department.trim(), 
        designation.trim(),
        status, 
        qualification?.trim(), 
        experience?.trim(), 
        avatar?.trim(),
        joiningDate, 
        bio?.trim(),
        board_member === true || board_member === 'true'
      ]
    );

    const insertedId = result.rows[0].id;
    const generatedFacultyId = `FAC${String(insertedId).padStart(3, '0')}`;

    // Step 2: Update the record with the generated faculty_id
    const updated = await query(
      `UPDATE faculties SET faculty_id = $1 WHERE id = $2 RETURNING *`,
      [generatedFacultyId, insertedId]
    );

    console.log('[✅ Created Faculty]', {
      id: updated.rows[0].id,
      faculty_id: updated.rows[0].faculty_id,
      name: updated.rows[0].name,
      board_member: updated.rows[0].board_member
    }); 

    res.status(201).json(updated.rows[0]);
  } catch (err) {
    console.error('[❌ Error in createFaculty]', {
      message: err.message,
      detail: err.detail,
      code: err.code,
      constraint: err.constraint
    });

    // Handle specific database errors
    if (err.code === '23505') { // Unique constraint violation
      if (err.constraint?.includes('email')) {
        return res.status(400).json({ error: 'Email address already exists' });
      }
    }

    res.status(500).json({ error: 'Failed to add faculty' });
  }
};

/**
 * Update existing faculty member
 * @async
 * @function updateFaculty
 * @description Updates an existing faculty member identified by ID.
 * The updated_at timestamp is automatically updated to the current time.
 * Board member status is properly handled with boolean conversion.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The ID of the faculty member to update
 * @param {string} [req.body.name] - Full name of the faculty member
 * @param {string} [req.body.email] - Email address of the faculty member
 * @param {string} [req.body.phone] - Phone number of the faculty member
 * @param {string} [req.body.department] - Department the faculty member belongs to
 * @param {string} [req.body.designation] - Job title or designation
 * @param {string} [req.body.status] - Current status (active/inactive)
 * @param {string} [req.body.qualification] - Educational qualifications
 * @param {string} [req.body.experience] - Years of experience or description
 * @param {string} [req.body.avatar] - URL or path to profile image
 * @param {string} [req.body.joiningDate] - Date when faculty member joined
 * @param {string} [req.body.bio] - Biography or description
 * @param {boolean} [req.body.board_member] - Whether faculty member is a board member
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns JSON response with updated faculty member or error
 */
const updateFaculty = async (req, res) => {
  const { id } = req.params;
  const {
    name, email, phone, department, designation,
    status, qualification, experience, avatar,
    joiningDate, bio, board_member
  } = req.body;

  // Validate ID is a number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Valid faculty ID is required' });
  }

  // Validate email format if provided
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  // Validate status value if provided
  if (status && !['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Status must be either "active" or "inactive"' });
  }

  try {
    const result = await query(
      `UPDATE faculties SET
        name = $1,
        email = $2,
        phone = $3,
        department = $4,
        designation = $5,
        status = $6,
        qualification = $7,
        experience = $8,
        avatar = $9,
        joining_date = $10,
        bio = $11,
        board_member = $12,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        name?.trim(), 
        email?.trim().toLowerCase(), 
        phone?.trim(), 
        department?.trim(), 
        designation?.trim(),
        status, 
        qualification?.trim(), 
        experience?.trim(), 
        avatar?.trim(),
        joiningDate, 
        bio?.trim(),
        board_member === true || board_member === 'true',
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }

    console.log('[✅ Updated Faculty]', {
      id: result.rows[0].id,
      faculty_id: result.rows[0].faculty_id,
      name: result.rows[0].name
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update Faculty Error:', err);

    // Handle specific database errors
    if (err.code === '23505') { // Unique constraint violation
      if (err.constraint?.includes('email')) {
        return res.status(400).json({ error: 'Email address already exists' });
      }
    }

    res.status(500).json({ error: 'Failed to update faculty' });
  }
};

/**
 * Delete faculty member
 * @async
 * @function deleteFaculty
 * @description Permanently deletes a faculty member from the database by ID.
 * This action cannot be undone. Consider implementing soft delete (status change)
 * for better data integrity in production environments.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The ID of the faculty member to delete
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Returns 204 status on success or error response
 */
const deleteFaculty = async (req, res) => {
  const { id } = req.params;
  
  // Validate ID is a number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Valid faculty ID is required' });
  }

  try {
    // Check if faculty member exists before deletion
    const existingFaculty = await query(
      'SELECT id, faculty_id, name FROM faculties WHERE id = $1', 
      [id]
    );

    if (existingFaculty.rows.length === 0) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }

    // Perform the deletion
    await query('DELETE FROM faculties WHERE id = $1', [id]);

    console.log('[✅ Deleted Faculty]', {
      id: existingFaculty.rows[0].id,
      faculty_id: existingFaculty.rows[0].faculty_id,
      name: existingFaculty.rows[0].name
    });

    res.status(204).send();
  } catch (err) {
    console.error('Delete Faculty Error:', err);

    // Handle foreign key constraint errors
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({ 
        error: 'Cannot delete faculty member. They may be referenced in other records.' 
      });
    }

    res.status(500).json({ error: 'Failed to delete faculty' });
  }
};

module.exports = {
  getAllFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
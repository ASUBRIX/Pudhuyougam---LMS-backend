const { query } = require('../../config/database');

// Get all faculties
const getAllFaculties = async (req, res) => {
  try {
    const result = await query('SELECT * FROM faculties ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch faculties' });
  }
};

const createFaculty = async (req, res) => {
  const {
    name, email, phone, department, designation,
    status, qualification, experience, avatar,
    joiningDate, bio, board_member
  } = req.body;

  try {
    const result = await query(
      `INSERT INTO faculties 
        (name, email, phone, department, designation, status, qualification, experience, avatar, joining_date, bio, board_member) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id`,
      [
        name, email, phone, department, designation,
        status, qualification, experience, avatar,
        joiningDate, bio,
        board_member === true || board_member === 'true'
      ]
    );

    const insertedId = result.rows[0].id;
    const generatedFacultyId = `FAC${String(insertedId).padStart(3, '0')}`;

    // Step 2: Update faculty_id
    const updated = await query(
      `UPDATE faculties SET faculty_id = $1 WHERE id = $2 RETURNING *`,
      [generatedFacultyId, insertedId]
    );

    console.log('[✅ Created Faculty]', updated.rows[0]); 

    res.status(201).json(updated.rows[0]);
  } catch (err) {
    console.error('[❌ Error in createFaculty]', {
      message: err.message,
      detail: err.detail,
      code: err.code,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to add faculty' });
  }
};


// Update faculty by ID
const updateFaculty = async (req, res) => {
  const { id } = req.params;
  const {
    name, email, phone, department, designation,
    status, qualification, experience, avatar,
    joiningDate, bio, board_member
  } = req.body;

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
        name, email, phone, department, designation,
        status, qualification, experience, avatar,
        joiningDate, bio,
        board_member === true || board_member === 'true',
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update Faculty Error:', err);
    res.status(500).json({ error: 'Failed to update faculty' });
  }
};

// Delete faculty
const deleteFaculty = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM faculties WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
};

module.exports = {
  getAllFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};

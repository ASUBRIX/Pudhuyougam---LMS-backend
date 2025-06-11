// controllers/admin/studentController.js
const { query } = require('../../config/database');

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const result = await query("SELECT * FROM students ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// Add new student
const createStudent = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      enrollment_date,
      program,
      semester,
      year,
      status,
      courses,
      profile_picture
    } = req.body;

    // Generate enrollment ID using sequence
    const seq = await query("SELECT nextval('enrollment_id_seq') AS nextval");
    const enrollment_id = `STU${String(seq.rows[0].nextval).padStart(3, '0')}`;

    const result = await query(
      `INSERT INTO students (
        first_name, last_name, email, phone, enrollment_date, 
        program, semester, year, status, courses, profile_picture, enrollment_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING *`,
      [
        first_name,
        last_name,
        email,
        phone,
        enrollment_date,
        program,
        semester,
        year,
        status,
        courses,
        profile_picture || null,
        enrollment_id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("[❌ Create Student Error]", error);
    res.status(500).json({ error: "Failed to add student" });
  }
};

// Update student
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    enrollment_date,
    program,
    semester,
    year,
    status,
    courses,
    profile_picture
  } = req.body;
  try {
    const result = await query(
      `UPDATE students SET 
        first_name = $1, 
        last_name = $2, 
        email = $3, 
        phone = $4, 
        enrollment_date = $5,
        program = $6, 
        semester = $7, 
        year = $8, 
        status = $9,
        courses = $10,
        profile_picture = $11,
        updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [
        first_name,
        last_name,
        email,
        phone,
        enrollment_date,
        program,
        semester,
        year,
        status,
        courses,
        profile_picture || null,
        id
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update student" });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query("DELETE FROM students WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete student" });
  }
};

module.exports = {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};

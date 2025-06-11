const Student = require("../../models/student");
const generateEnrollmentId = require('../../utils/generateEnrollmentId');

const createStudent = async (req, res) => {
  try {
    console.log("req.body:", req.body);

    const {
      first_name,
      last_name,
      email,
      phone,
      enrollmentDate,
      status,
      courses,
      program,
      semester,
      year
    } = req.body;

    const enrollment_id = await generateEnrollmentId(); // ✅ moved inside function

    const student = await Student.create({
      userId: null,
      firstName: first_name,
      lastName: last_name,
      email,
      phone,
      enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
      status: status || 'active',
      program,
      semester,
      year,
      courses,
      profile_picture: null,
      enrollmentId: enrollment_id
    });

    res.status(200).json(student);
  } catch (err) {
    console.error("❌ Create Student Error:", err);
    res.status(500).json({ error: "Failed to add student" });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json(students);
  } catch (err) {
    console.error("❌ Fetch Students Error:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const {
      first_name,
      last_name,
      email,
      phone,
      enrollmentDate,
      status,
      program,
      semester,
      year,
      courses,
      enrollment_id
    } = req.body;

    const updatedStudent = await Student.update(studentId, {
      userId: null,
      firstName: first_name,
      lastName: last_name,
      email,
      phone,
      enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
      status,
      program,
      semester,
      year,
      courses,
      profile_picture: null,
      enrollmentId: enrollment_id
    });

    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error("❌ Update Student Error:", err);
    res.status(500).json({ error: "Failed to update student" });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const deleted = await Student.destroy(studentId);
    if (!deleted) return res.status(404).json({ error: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Student Error:", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  deleteStudent,
  updateStudent
};

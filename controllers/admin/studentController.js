const Student = require("../../models/student");
const User = require("../../models/user");
const generateEnrollmentId = require('../../utils/generateEnrollmentId');

const createStudent = async (req, res) => {
  try {
    console.log("req.body:", req.body);

    const {
      first_name,
      last_name,
      email,
      phone,
      status,
      qualification
    } = req.body;

    let user = await User.findByPhone(phone);
    
    if (!user) {
      console.log("Creating new user for student");
      user = await User.create({
        first_name,
        last_name,
        email,
        phone_number: phone,
        role: 'student'
      });
      console.log("User created:", user);
    }

    const existingStudent = await Student.findByUserId(user.id);
    if (existingStudent) {
      return res.status(400).json({ 
        error: "Student record already exists for this user" 
      });
    }

    const enrollment_id = await generateEnrollmentId(); 
    console.log("Generated enrollment ID:", enrollment_id);

    const student = await Student.create({
      userId: user.id,
      firstName: first_name,
      lastName: last_name,
      email,
      phone,
      enrollmentDate: new Date(),
      status: status || 'active',
      program: qualification,
      enrollmentId: enrollment_id
    });

    console.log("Student created:", student);

    res.status(200).json({
      ...student,
      user_id: user.id,
      user_created: !existingStudent
    });
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
    console.log("Updating student ID:", studentId);
    console.log("Update data:", req.body);

    const {
      first_name,
      last_name,
      email,
      phone,
      status,
      qualification,
      enrollment_id, 
      user_id,
      enrollment_date
    } = req.body;

    const existingStudent = await Student.findByPk(studentId);
    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    console.log("Existing student:", existingStudent);

    // Update linked user if exists
    if (existingStudent.user_id) {
      await User.update(existingStudent.user_id, {
        first_name,
        last_name,
        email,
        phone_number: phone,
        role: 'student'
      });
    }

    // Update student record while preserving enrollment ID
    const updatedStudent = await Student.update(studentId, {
      userId: existingStudent.user_id,
      firstName: first_name,
      lastName: last_name,
      email,
      phone,
      enrollmentDate: existingStudent.enrollment_date,
      status,
      program: qualification,
      enrollmentId: existingStudent.enrollment_id 
    });

    console.log("Updated student:", updatedStudent);

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
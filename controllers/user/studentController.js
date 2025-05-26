const Student = require('../../models/student');

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
};

const getStudentByUserId = async (req, res) => {
  try {
    const student = await Student.findByUserId(req.params.user_id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student.' });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student.' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Student.update(id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student.' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.destroy(id);
    res.status(200).json(deleted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student.' });
  }
};

// --- Profile endpoints ---

const getProfile = async (req, res) => {
  try {
    const student = await Student.findByUserId(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const student = await Student.findByUserId(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    const updated = await Student.update(student.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student profile.' });
  }
};

module.exports = {
  getAllStudents,
  getStudentByUserId,
  getStudentById,
  updateStudent,
  deleteStudent,
  getProfile,
  updateProfile
};

// For Student profile APIs (self-service, no admin required)
const Student = require('../../models/student');

// Get student profile
const getProfile = async (req, res) => {
  try {
    const student = await Student.findByUserId(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

// Update student profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, about, education, profilePicture } = req.body;
    const student = await Student.findByUserId(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const updatedStudent = await Student.update(student.id, {
      userId: student.user_id,
      firstName,
      lastName,
      email,
      phone,
      enrollmentDate: student.enrollment_date,
      status: student.status,
      about,
      education,
      profilePicture,
    });
    res.json({ message: 'Profile updated successfully', student: updatedStudent });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { getProfile, updateProfile };

const Student = require('../../models/student');

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

const updateProfile = async (req, res) => {
  console.log("Update profile function is working");

  try {
    const student = await Student.findByUserId(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const raw = req.body;
    console.log('print form data received from frontend:', raw);

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

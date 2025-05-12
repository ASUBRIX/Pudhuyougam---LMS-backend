const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Student = require('../models/student');
const User = require('../models/user');
const { auth, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query, pool } = require('../config/database');

// Set up multer for profile picture uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // We'll need the student ID from the authenticated user
        (async () => {
            try {
                const student = await Student.findByUserId(req.user.id);
                if (!student) {
                    return cb(new Error('Student not found'));
                }
                
                // Create a student-specific folder with the student ID
                const studentDir = path.join(__dirname, `../public/uploads/profile-pictures/${student.id}`);
                
                // Create directory if it doesn't exist
                if (!fs.existsSync(studentDir)) {
                    fs.mkdirSync(studentDir, { recursive: true });
                }
                
                cb(null, studentDir);
            } catch (error) {
                console.error('Error setting upload destination:', error);
                cb(error);
            }
        })();
    },
    filename: function(req, file, cb) {
        // Generate a unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: function(req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Client-side routes

// Get student profile
router.get('/profile', auth, async (req, res) => {
    try {
        const student = await Student.findByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Update student profile
router.put('/profile', auth, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            about,
            education,
            profilePicture
        } = req.body;

        console.log('Received update request with data:', req.body);

        const student = await Student.findByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        console.log('Found student to update:', student);

        // Using Student.update since it's a static method
        const updatedStudent = await Student.update(student.id, {
            userId: student.user_id, // Keep existing user_id
            firstName,
            lastName,
            email,
            phone,
            enrollmentDate: student.enrollment_date, // Keep existing enrollment date
            status: student.status, // Keep existing status
            about,
            education,
            profilePicture
        });

        res.json({
            message: 'Profile updated successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Upload profile picture
router.post('/profile/upload-picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const student = await Student.findByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get the file path relative to public directory - now includes student ID folder
        const profilePicturePath = `/uploads/profile-pictures/${student.id}/${req.file.filename}`;

        // Delete old profile picture if it exists
        if (student.profile_picture && student.profile_picture !== profilePicturePath) {
            const oldPicturePath = path.join(__dirname, '../public', student.profile_picture);
            if (fs.existsSync(oldPicturePath)) {
                fs.unlinkSync(oldPicturePath);
            }
        }

        // Update student profile with new picture path
        const updatedStudent = await Student.update(student.id, {
            userId: student.user_id,
            firstName: student.first_name,
            lastName: student.last_name,
            email: student.email,
            phone: student.phone,
            enrollmentDate: student.enrollment_date,
            status: student.status,
            about: student.about,
            education: student.education,
            profilePicture: profilePicturePath
        });

        res.json({
            message: 'Profile picture updated successfully',
            profilePicture: profilePicturePath,
            student: updatedStudent
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Admin routes

// Get all students with search, sort and filter
router.get('/', auth, requireAdmin, async (req, res) => {
    try {
        const { search, sortBy, fromDate, toDate } = req.query;
        
        // Build where clause for filtering
        let whereClause = {};
        if (search) {
            whereClause = {
                [Op.or]: [
                    { first_name: { [Op.like]: `%${search}%` } },
                    { last_name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { id: { [Op.like]: `%${search}%` } }
                ]
            };
        }
        
        if (fromDate && toDate) {
            whereClause.enrollmentDate = {
                [Op.between]: [fromDate, toDate]
            };
        }

        // Build order clause for sorting
        let order = [];
        switch (sortBy) {
            case 'newest':
                order = [['enrollmentDate', 'DESC']];
                break;
            case 'oldest':
                order = [['enrollmentDate', 'ASC']];
                break;
            case 'name':
                order = [['firstName', 'ASC'], ['lastName', 'ASC']];
                break;
            case 'status':
                order = [['status', 'ASC']];
                break;
            default:
                order = [['createdAt', 'DESC']];
        }

        const students = await Student.findAll({
            where: whereClause,
            order
        });

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Add new student (admin only)
router.post('/', auth, requireAdmin, async (req, res) => {
    console.log("add students recieved");
    
    try {
        const {
            userId,
            firstName,
            lastName,
            email,
            phone,
            enrollmentDate,
            status,
            about,
            education,
            profilePicture,
            password_hash  // Added for user creation
        } = req.body;

        console.log('Creating student with data:', {
            userId,
            firstName,
            lastName,
            email,
            phone,
            enrollmentDate,
            status,
            about,
            education,
            profilePicture
        });

        // Check for existing user if userId is not provided
        let userIdToUse = userId;
        
        if (!userIdToUse) {
            // First check if a user with this email already exists
            const existingUser = await User.findByEmail(email);
            
            if (existingUser) {
                userIdToUse = existingUser.id;
            } else {
                // Create a new user if no existing user was found
                if (!password_hash) {
                    // Generate a temporary password if none provided
                    password_hash = Math.random().toString(36).slice(-8);
                }
                
                const newUser = await User.create({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password_hash: password_hash,
                    phone_number: phone,
                    role: 'student'
                });
                
                userIdToUse = newUser.id;
            }
        }

        // Now create the student record
        const student = await Student.create({
            userId: userIdToUse,
            firstName,
            lastName,
            email,
            phone,
            enrollmentDate,
            status: status || 'active',
            about,
            education,
            profilePicture
        });

        res.json({
            message: 'Student added successfully',
            student
        });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Edit student (admin only)
router.put('/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            userId,
            firstName,
            lastName,
            email,
            phone,
            enrollmentDate,
            status,
            about,
            education,
            profilePicture
        } = req.body;

        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Using Student.update since it's a static method
        const updatedStudent = await Student.update(id, {
            userId,
            firstName,
            lastName,
            email,
            phone,
            enrollmentDate,
            status,
            about,
            education,
            profilePicture
        });

        res.json({
            message: 'Student edited successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Error editing student:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Toggle student status (admin only)
router.put('/:id/status', auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        await student.update({ status });

        res.json({
            message: 'Student status updated successfully',
            student: {
                id: student.id,
                status: student.status
            }
        });
    } catch (error) {
        console.error('Error toggling student status:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Delete student (admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        await student.destroy();

        res.json({
            message: 'Student deleted successfully',
            studentId: id
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get student stats (admin only)
router.get('/stats', auth, requireAdmin, async (req, res) => {
    try {
        const total_students = await Student.count();
        const active_students = await Student.count({
            where: { status: 'active' }
        });

        res.json({
            total_students,
            active_students
        });
    } catch (error) {
        console.error('Error fetching student stats:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

module.exports = router;

// routes/settings.js
// routes/settings.js

const express = require('express');
const router = express.Router();
const Setting = require('../models/setting');
const { auth, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function(req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|ico)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Middleware to handle multiple file uploads
const uploadFields = upload.fields([
    { name: 'site_logo', maxCount: 1 },
    { name: 'site_favicon', maxCount: 1 }
]);

// Get all website settings
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.getWebsiteSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching website settings:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Update website settings (admin only)
router.put('/', auth, requireAdmin, uploadFields, async (req, res) => {
    try {
        const settings = { ...req.body };
        
        // Handle file uploads if present
        if (req.files) {
            if (req.files.site_logo && req.files.site_logo.length > 0) {
                settings.site_logo = '/uploads/' + req.files.site_logo[0].filename;
            }
            
            if (req.files.site_favicon && req.files.site_favicon.length > 0) {
                settings.site_favicon = '/uploads/' + req.files.site_favicon[0].filename;
            }
        }
        
        const updatedSettings = await Setting.updateWebsiteSettings(settings);
        res.json({ 
            message: 'Website settings updated successfully',
            settings: updatedSettings
        });
    } catch (error) {
        console.error('Error updating website settings:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

module.exports = router; 
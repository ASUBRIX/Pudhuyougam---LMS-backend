const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const settingController = require('../../controllers/admin/settingController');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|ico)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});
const uploadFields = upload.fields([
    { name: 'site_logo', maxCount: 1 },
    { name: 'site_favicon', maxCount: 1 }
]);

// GET all website settings (public or admin, as you like)
router.get('/', settingController.getWebsiteSettings);

// UPDATE website settings (admin only)
router.put('/', auth, requireAdmin, uploadFields, settingController.updateWebsiteSettings);

module.exports = router;

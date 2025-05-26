const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requireAdmin } = require('../../middleware/auth');
const galleryController = require('../../controllers/admin/galleryController');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/gallery');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = 'gallery_' + Date.now() + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

router.use(auth, requireAdmin);

// GET all gallery items
router.get('/', galleryController.getGallery);

// POST upload one or more images
router.post('/upload', upload.array('images', 10), galleryController.uploadImages);

// DELETE image by ID
router.delete('/:id', galleryController.deleteImage);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requireAdmin } = require('../../middleware/auth');
const bannerController = require('../../controllers/admin/bannerController');

// Multer storage for banners
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/banners');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'banner-' + uniqueSuffix + ext);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(auth, requireAdmin);

router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);
router.post('/', upload.single('image'), bannerController.createBanner);
router.put('/:id', upload.single('image'), bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;

const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/user/bannerController');

// Get active banners for homepage
router.get('/', bannerController.getActiveBanners);

module.exports = router;

const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/user/bannerController');

// Public: Get active banners for homepage
router.get('/banners', bannerController.getActiveBanners);

module.exports = router;

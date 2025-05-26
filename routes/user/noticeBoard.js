const express = require('express');
const router = express.Router();
const noticeBoardController = require('../../controllers/user/noticeBoardController');

// Public: Get latest active announcements for notice board
router.get('/', noticeBoardController.getLatestAnnouncements);

module.exports = router;

const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/user/settingsController');

// Public GET endpoint for settings
router.get('/', settingsController.getWebsiteSettings);

module.exports = router;

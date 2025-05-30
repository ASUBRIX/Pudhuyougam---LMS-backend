
const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/user/homeController');

// GET home page (EJS layout)
router.get('/', homeController.renderHome);

module.exports = router;

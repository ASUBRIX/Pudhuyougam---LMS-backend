const express = require('express');
const router = express.Router();
const currentAffairsController = require('../../controllers/user/currentAffairsController');

// Get all active current affairs
router.get('/', currentAffairsController.getAllCurrentAffairs);

// Get single current affair by ID for details page
router.get('/:id', currentAffairsController.getCurrentAffairById);

module.exports = router;

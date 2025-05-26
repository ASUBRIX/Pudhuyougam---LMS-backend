const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const announcementController = require('../../controllers/admin/announcementController');


router.get('/', auth, requireAdmin, announcementController.getAllAnnouncements);
router.post('/', auth, requireAdmin, announcementController.createAnnouncement);
router.put('/:id', auth, requireAdmin, announcementController.updateAnnouncement);
router.delete('/:id', auth, requireAdmin, announcementController.deleteAnnouncement);

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const caController = require('../../controllers/admin/currentAffairsController');

router.use(auth, requireAdmin);

router.get('/', caController.getAllCurrentAffairs);
router.post('/', caController.createCurrentAffair);
router.put('/:id', caController.updateCurrentAffair);
router.delete('/:id', caController.deleteCurrentAffair);

module.exports = router;

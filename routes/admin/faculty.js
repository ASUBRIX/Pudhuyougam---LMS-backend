const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const facultyController = require('../../controllers/admin/facultyController');

router.use(auth, requireAdmin);

router.get('/', facultyController.getAllFaculties);
router.post('/', facultyController.createFaculty);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

module.exports = router;


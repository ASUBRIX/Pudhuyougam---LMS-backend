const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const studentController = require('../../controllers/admin/studentController');

router.use(auth, requireAdmin);

router.get('/', studentController.getAllStudents);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const testController = require('../../controllers/admin/testController');

router.use(auth, requireAdmin);

// Folders
router.post('/folders', testController.createFolder);
router.get('/folders/:folder_id/contents', testController.getFolderContents);
router.delete('/folders/:folder_id', testController.deleteFolder);

// Tests
router.post('/', testController.createTest);
router.put('/:test_id/settings', testController.updateTestSettings);
router.get('/search', testController.searchTests);

// Questions
router.post('/:test_id/questions', testController.addQuestion);
router.put('/:test_id/questions/:question_id', testController.updateQuestion);
router.delete('/:test_id/questions/:question_id', testController.deleteQuestion);
router.get('/:test_id/questions', testController.getAllQuestions);

module.exports = router;


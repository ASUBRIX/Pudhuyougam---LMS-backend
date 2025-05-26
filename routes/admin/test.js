const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middlewares/auth');
const testController = require('../../controllers/admin/testController');

router.use(auth, requireAdmin);

router.post('/folders/create', testController.createFolder);
router.get('/folders/:folder_id/contents', testController.getFolderContents);
router.delete('/folders/:folder_id', testController.deleteFolder);
router.post('/test/create', testController.createTest);
router.put('/test/:test_id/settings', testController.updateTestSettings);
router.get('/search', testController.searchTests);
router.post('/test/:test_id/questions', testController.addQuestion);
router.put('/test/:test_id/questions/:question_id', testController.updateQuestion);
router.delete('/test/:test_id/questions/:question_id', testController.deleteQuestion);
router.get('/test/:test_id/questions', testController.getAllQuestions);

module.exports = router;

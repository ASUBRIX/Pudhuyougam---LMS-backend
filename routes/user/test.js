const express = require('express');
const router = express.Router();
const { auth } = require('../../middlewares/auth');
const testController = require('../../controllers/user/testController');

// Free/public endpoints
router.get('/free', auth, testController.getFreeTests);
router.get('/free/all', auth, testController.getAllParentFolders);
router.get('/folders/:folder_id/contents/public', testController.getFolderContentsPublic);

// Test taking endpoints
router.get('/test/:test_id/take', auth, testController.getTestDetails);
router.post('/test/:test_id/submit', auth, testController.submitTest);
router.get('/test/:test_id/questions/details', auth, testController.getTestQuestions);

// Test history
router.get('/history', auth, testController.getTestHistory);

module.exports = router;

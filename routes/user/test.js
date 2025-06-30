const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const testController = require('../../controllers/user/testController');

router.get('/free', auth, testController.getFreeTests);
router.get('/free/all', auth, testController.getAllParentFolders);
router.get('/folders/:folder_id/contents/public', auth, testController.getFolderContentsPublic);


router.get('/test/:test_id/take', auth, testController.getTestDetails);
router.get('/test/:test_id/questions/details', auth, testController.getTestQuestions);
router.post('/test/:test_id/submit', auth, testController.submitTest);


router.get('/history', auth, testController.getTestHistory);

module.exports = router;
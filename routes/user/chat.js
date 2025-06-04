const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/user/chatController');

// GET chat history for a user (student)
router.get('/history/:userId', chatController.getChatHistory);

// POST send a new message
router.post('/send', chatController.sendMessage);

// GET all students who have chatted (for admin sidebar/list)
router.get('/students', chatController.getChattedStudents);

module.exports = router;

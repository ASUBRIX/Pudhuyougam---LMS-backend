const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/user/chatController');

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Message ID
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: Student user ID
 *           example: 5
 *         sender:
 *           type: string
 *           enum: [admin, student]
 *           description: Who sent the message
 *           example: "student"
 *         text:
 *           type: string
 *           nullable: true
 *           description: Message text content
 *           example: "Hello, I need help with my assignment"
 *         type:
 *           type: string
 *           default: "text"
 *           description: Message type
 *           example: "text"
 *         file_type:
 *           type: string
 *           nullable: true
 *           description: File type if message contains file
 *           example: "pdf"
 *         file_size:
 *           type: string
 *           nullable: true
 *           description: File size if message contains file
 *           example: "2.5MB"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Message timestamp
 *           example: "2023-12-15T14:30:00.000Z"
 * 
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - userId
 *         - sender
 *       properties:
 *         userId:
 *           type: integer
 *           description: Student user ID
 *           example: 5
 *         sender:
 *           type: string
 *           enum: [admin, student]
 *           description: Who is sending the message
 *           example: "student"
 *         text:
 *           type: string
 *           nullable: true
 *           description: Message text content
 *           example: "Hello, I need help with my assignment"
 *         type:
 *           type: string
 *           default: "text"
 *           description: Message type
 *           example: "text"
 *         file_type:
 *           type: string
 *           nullable: true
 *           description: File type if message contains file
 *           example: "pdf"
 *         file_size:
 *           type: string
 *           nullable: true
 *           description: File size if message contains file
 *           example: "2.5MB"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Message timestamp (auto-generated if not provided)
 *           example: "2023-12-15T14:30:00.000Z"
 * 
 *     ChattedStudent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Student user ID
 *           example: 5
 *         name:
 *           type: string
 *           description: Student's full name (concatenated first_name + last_name)
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Student's email address
 *           example: "john.doe@example.com"
 */

/**
 * @swagger
 * /api/chat/history/{userId}:
 *   get:
 *     summary: Get chat history for a user (student)
 *     description: Retrieve all chat messages for a specific student user ordered by timestamp (oldest first)
 *     tags: [Chat]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: Student user ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 5
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 *             examples:
 *               chat_history:
 *                 summary: Chat conversation between student and admin
 *                 value:
 *                   - id: 1
 *                     user_id: 5
 *                     sender: "student"
 *                     text: "Hello, I need help with my assignment"
 *                     type: "text"
 *                     file_type: null
 *                     file_size: null
 *                     timestamp: "2023-12-15T14:30:00.000Z"
 *                   - id: 2
 *                     user_id: 5
 *                     sender: "admin"
 *                     text: "Hi! I'd be happy to help. What specific issue are you facing?"
 *                     type: "text"
 *                     file_type: null
 *                     file_size: null
 *                     timestamp: "2023-12-15T14:32:00.000Z"
 *                   - id: 3
 *                     user_id: 5
 *                     sender: "student"
 *                     text: "I'm having trouble with question 3. Here's my work so far:"
 *                     type: "file"
 *                     file_type: "pdf"
 *                     file_size: "1.2MB"
 *                     timestamp: "2023-12-15T14:35:00.000Z"
 *               empty_history:
 *                 summary: No chat history found for user
 *                 value: []
 *       500:
 *         description: Database error while fetching chat history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database error"
 */
// GET chat history for a user (student)
router.get('/history/:userId', chatController.getChatHistory);

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Send a new chat message
 *     description: Save a new chat message to the database. Can be text or file message from student or admin.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *           examples:
 *             text_message:
 *               summary: Text message from student
 *               value:
 *                 userId: 5
 *                 sender: "student"
 *                 text: "Hello, I need help with my assignment"
 *                 type: "text"
 *             file_message:
 *               summary: File message from student
 *               value:
 *                 userId: 5
 *                 sender: "student"
 *                 text: "Here's my assignment file"
 *                 type: "file"
 *                 file_type: "pdf"
 *                 file_size: "2.5MB"
 *             admin_reply:
 *               summary: Admin reply message
 *               value:
 *                 userId: 5
 *                 sender: "admin"
 *                 text: "Thanks for your question! I'll review this and get back to you."
 *                 type: "text"
 *     responses:
 *       200:
 *         description: Message sent and saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 *             examples:
 *               saved_message:
 *                 summary: Successfully saved message
 *                 value:
 *                   id: 15
 *                   user_id: 5
 *                   sender: "student"
 *                   text: "Hello, I need help with my assignment"
 *                   type: "text"
 *                   file_type: null
 *                   file_size: null
 *                   timestamp: "2023-12-15T14:30:00.000Z"
 *       500:
 *         description: Failed to save message to database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to save message"
 */
// POST send a new message
router.post('/send', chatController.sendMessage);

/**
 * @swagger
 * /api/chat/students:
 *   get:
 *     summary: Get all students who have chatted (for admin)
 *     description: Retrieve list of all students who have sent at least one chat message, ordered by name. Used for admin chat sidebar/list.
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Students with chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChattedStudent'
 *             examples:
 *               students_list:
 *                 summary: List of students who have chatted
 *                 value:
 *                   - id: 3
 *                     name: "Alice Johnson"
 *                     email: "alice.johnson@example.com"
 *                   - id: 5
 *                     name: "John Doe"
 *                     email: "john.doe@example.com"
 *                   - id: 8
 *                     name: "Sarah Wilson"
 *                     email: "sarah.wilson@example.com"
 *               no_students:
 *                 summary: No students have chatted yet
 *                 value: []
 *       500:
 *         description: Failed to fetch students from database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch students"
 */
// GET all students who have chatted (for admin sidebar/list)
router.get('/students', chatController.getChattedStudents);

module.exports = router;
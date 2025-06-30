// routes/admin/testRoutes.js
const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const testController = require('../../controllers/admin/testController');

router.use(auth, requireAdmin);

/**
 * @swagger
 * components:
 *   schemas:
 *     Folder:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique folder ID
 *         name:
 *           type: string
 *           description: Folder name
 *         parent_id:
 *           type: integer
 *           nullable: true
 *           description: Parent folder ID
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     Test:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique test ID
 *         title:
 *           type: string
 *           description: Test title
 *         description:
 *           type: string
 *           description: Test description
 *         category:
 *           type: string
 *           description: Test category
 *         passing_score:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Minimum score to pass
 *         duration_minutes:
 *           type: integer
 *           minimum: 1
 *           description: Test duration in minutes
 *         folder_id:
 *           type: integer
 *           nullable: true
 *           description: Folder ID containing this test
 *         status:
 *           type: string
 *           enum: [active, inactive, draft]
 *           description: Test status
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     Question:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique question ID
 *         test_id:
 *           type: integer
 *           description: Associated test ID
 *         question_english:
 *           type: string
 *           description: Question text in English
 *         question_tamil:
 *           type: string
 *           description: Question text in Tamil
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Option'
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     Option:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique option ID
 *         option_english:
 *           type: string
 *           description: Option text in English
 *         option_tamil:
 *           type: string
 *           description: Option text in Tamil
 *         is_correct:
 *           type: boolean
 *           description: Whether this option is correct
 *     
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         status:
 *           type: string
 *           description: Error status
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/admin/tests/folders:
 *   post:
 *     summary: Create a new folder
 *     description: Creates a new folder for organizing tests
 *     tags: [Admin Test Folders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Folder name
 *                 example: "Mathematics Tests"
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *                 description: Parent folder ID
 *                 example: null
 *     responses:
 *       201:
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Folder name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/folders', testController.createFolder);

/**
 * @swagger
 * /api/admin/tests/folders:
 *   get:
 *     summary: Get all folders with pagination
 *     description: Retrieves all folders with pagination support
 *     tags: [Admin Test Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of folders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 folders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Folder'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/folders', testController.getAllFolders);

/**
 * @swagger
 * /api/admin/tests/folders/{folder_id}/contents:
 *   get:
 *     summary: Get folder contents
 *     description: Retrieves all contents (subfolders and tests) within a specific folder
 *     tags: [Admin Test Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folder_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Folder ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Folder contents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 folders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Folder'
 *                 tests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Test'
 *       400:
 *         description: Invalid folder ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/folders/:folder_id/contents', testController.getFolderContents);

/**
 * @swagger
 * /api/admin/tests/folders/{folder_id}:
 *   delete:
 *     summary: Delete a folder
 *     description: Deletes a folder (only if it's empty)
 *     tags: [Admin Test Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folder_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Folder ID to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Folder deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Folder deleted successfully."
 *                 folder:
 *                   $ref: '#/components/schemas/Folder'
 *       400:
 *         description: Invalid folder ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Folder not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Folder not empty
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/folders/:folder_id', testController.deleteFolder);

/**
 * @swagger
 * /api/admin/tests:
 *   post:
 *     summary: Create a new test
 *     description: Creates a new test with basic information
 *     tags: [Admin Tests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Test title
 *                 example: "Basic Mathematics Test"
 *               description:
 *                 type: string
 *                 description: Test description
 *                 example: "A comprehensive test covering basic mathematical concepts"
 *               category:
 *                 type: string
 *                 description: Test category
 *                 example: "Mathematics"
 *               passing_score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Minimum score to pass
 *                 example: 70
 *               duration_minutes:
 *                 type: integer
 *                 minimum: 1
 *                 description: Test duration in minutes
 *                 example: 60
 *               folder_id:
 *                 type: integer
 *                 nullable: true
 *                 description: Folder ID to place test in
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *                 description: Test status
 *                 example: "draft"
 *     responses:
 *       201:
 *         description: Test created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Test created successfully."
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *                 step:
 *                   type: string
 *                   example: "test_sections"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', testController.createTest);

/**
 * @swagger
 * /api/admin/tests/{test_id}/settings:
 *   put:
 *     summary: Update test settings
 *     description: Updates test configuration and settings
 *     tags: [Admin Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: test_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Test ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Test title
 *               description:
 *                 type: string
 *                 description: Test description
 *               category:
 *                 type: string
 *                 description: Test category
 *               passing_score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Minimum score to pass
 *               duration_minutes:
 *                 type: integer
 *                 minimum: 0
 *                 description: Duration in minutes
 *               duration_hours:
 *                 type: integer
 *                 minimum: 0
 *                 description: Duration in hours
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *                 description: Test status
 *     responses:
 *       200:
 *         description: Test settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Test settings updated successfully."
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Test not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:test_id/settings', testController.updateTestSettings);

/**
 * @swagger
 * /api/admin/tests/{test_id}:
 *   delete:
 *     summary: Delete a test
 *     description: Permanently deletes a test and all its questions
 *     tags: [Admin Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: test_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Test ID to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Test deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Test deleted successfully."
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *       400:
 *         description: Invalid test ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Test not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:test_id', testController.deleteTest);

/**
 * @swagger
 * /api/admin/tests/search:
 *   get:
 *     summary: Search tests
 *     description: Search and filter tests with pagination and sorting
 *     tags: [Admin Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query for test title or description
 *         example: "mathematics"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [modified, created, title, category]
 *           default: modified
 *         description: Sort criteria
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Test'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', testController.searchTests);

/**
 * @swagger
 * /api/admin/tests/{test_id}/questions:
 *   post:
 *     summary: Add a question to test
 *     description: Adds a new question with options to a specific test
 *     tags: [Admin Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: test_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Test ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question_english
 *               - question_tamil
 *             properties:
 *               question_english:
 *                 type: string
 *                 description: Question text in English
 *                 example: "What is 2 + 2?"
 *               question_tamil:
 *                 type: string
 *                 description: Question text in Tamil
 *                 example: "2 + 2 எவ்வளவு?"
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - option_english
 *                     - option_tamil
 *                     - is_correct
 *                   properties:
 *                     option_english:
 *                       type: string
 *                       description: Option text in English
 *                       example: "4"
 *                     option_tamil:
 *                       type: string
 *                       description: Option text in Tamil
 *                       example: "4"
 *                     is_correct:
 *                       type: boolean
 *                       description: Whether this option is correct
 *                       example: true
 *     responses:
 *       201:
 *         description: Question added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Question added successfully."
 *                 question:
 *                   $ref: '#/components/schemas/Question'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:test_id/questions', testController.addQuestion);

/**
 * @swagger
 * /api/admin/tests/{test_id}/questions/{question_id}:
 *   put:
 *     summary: Update a question
 *     description: Updates an existing question and its options
 *     tags: [Admin Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: test_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Test ID
 *         example: 1
 *       - in: path
 *         name: question_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question_english:
 *                 type: string
 *                 description: Question text in English
 *               question_tamil:
 *                 type: string
 *                 description: Question text in Tamil
 *               question:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: string
 *                     description: Question text in English (alternative format)
 *                   ta:
 *                     type: string
 *                     description: Question text in Tamil (alternative format)
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     option_english:
 *                       type: string
 *                       description: Option text in English
 *                     option_tamil:
 *                       type: string
 *                       description: Option text in Tamil
 *                     text:
 *                       type: object
 *                       properties:
 *                         en:
 *                           type: string
 *                           description: Option text in English (alternative format)
 *                         ta:
 *                           type: string
 *                           description: Option text in Tamil (alternative format)
 *                     is_correct:
 *                       type: boolean
 *                       description: Whether this option is correct
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Question updated successfully."
 *                 question:
 *                   $ref: '#/components/schemas/Question'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:test_id/questions/:question_id', testController.updateQuestion);

/**
 * @swagger
 * /api/admin/tests/{test_id}/questions/{question_id}:
 *   delete:
 *     summary: Delete a question
 *     description: Permanently deletes a question from a test
 *     tags: [Admin Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: test_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Test ID
 *         example: 1
 *       - in: path
 *         name: question_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Question deleted successfully."
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:test_id/questions/:question_id', testController.deleteQuestion);

/**
 * @swagger
 * /api/admin/tests/{test_id}/questions:
 *   get:
 *     summary: Get all questions for a test
 *     description: Retrieves all questions and their options for a specific test
 *     tags: [Admin Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: test_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Test ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       400:
 *         description: Invalid test ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:test_id/questions', testController.getAllQuestions);

module.exports = router;
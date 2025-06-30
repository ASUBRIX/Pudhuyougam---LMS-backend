// controllers/admin/testController.js
const TestManagement = require('../../models/test');

/**
 * Create a new folder for organizing tests
 * @async
 * @function createFolder
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - Folder name
 * @param {number|string|null} req.body.parent_id - Parent folder ID or null
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Created folder object or error response
 */
const createFolder = async (req, res) => {
  try {
    const { parent_id, name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    
    const folder = await TestManagement.createFolder(name.trim(), parent_id === 'null' ? null : parent_id);
    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'A folder with this name already exists in this location' });
    }
    
    res.status(500).json({ error: 'Failed to create folder. Please try again.' });
  }
};

/**
 * Get all folders with pagination
 * @async
 * @function getAllFolders
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=10] - Items per page
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Paginated folders list or error response
 */
const getAllFolders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await TestManagement.getAllFolders(parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Error getting all folders:', error);
    res.status(500).json({ error: 'Failed to load folders. Please try again.' });
  }
};

/**
 * Get contents of a specific folder
 * @async
 * @function getFolderContents
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.folder_id - Folder ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Folder contents (subfolders and tests) or error response
 */
const getFolderContents = async (req, res) => {
  try {
    const { folder_id } = req.params;
    
    if (!folder_id || isNaN(folder_id)) {
      return res.status(400).json({ error: 'Valid folder ID is required' });
    }
    
    const contents = await TestManagement.getFolderContents(folder_id);
    res.json(contents);
  } catch (error) {
    console.error('Error getting folder contents:', error);
    res.status(500).json({ error: 'Failed to load folder contents. Please try again.' });
  }
};

/**
 * Delete a folder (only if empty)
 * @async
 * @function deleteFolder
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.folder_id - Folder ID to delete
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Success message or error response
 */
const deleteFolder = async (req, res) => {
  try {
    const { folder_id } = req.params;
    
    if (!folder_id || isNaN(folder_id)) {
      return res.status(400).json({ error: 'Valid folder ID is required' });
    }
    
    const result = await TestManagement.deleteFolder(folder_id);
    res.json({ status: 'success', message: 'Folder deleted successfully.', folder: result });
  } catch (error) {
    console.error('Error deleting folder:', error);
    
    if (error.message.includes('Cannot delete folder that contains')) {
      return res.status(409).json({ error: error.message });
    }
    
    if (error.message === 'Folder not found') {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete folder. Please try again.' });
  }
};

/**
 * Create a new test
 * @async
 * @function createTest
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Test title
 * @param {string} [req.body.description] - Test description
 * @param {string} [req.body.category] - Test category
 * @param {number} [req.body.passing_score] - Minimum score to pass (0-100)
 * @param {number} [req.body.duration_minutes] - Test duration in minutes
 * @param {number} [req.body.folder_id] - Folder ID to place test in
 * @param {string} [req.body.status] - Test status (active, inactive, draft)
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Created test object or error response
 */
const createTest = async (req, res) => {
  console.log("Create test function called with body:", req.body);
  
  try {
    const { title, description, category, passing_score, duration_minutes, folder_id, status } = req.body;
    
    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Test title is required' });
    }
    
    if (passing_score !== undefined && (passing_score < 0 || passing_score > 100)) {
      return res.status(400).json({ error: 'Passing score must be between 0 and 100' });
    }
    
    if (duration_minutes !== undefined && duration_minutes <= 0) {
      return res.status(400).json({ error: 'Duration must be greater than 0' });
    }
    
    const test = await TestManagement.createTest(req.body);
    res.status(201).json({ status: 'success', message: 'Test created successfully.', test, step: 'test_sections' });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test. Please try again.' });
  }
};

/**
 * Delete a test and all its questions
 * @async
 * @function deleteTest
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.test_id - Test ID to delete
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Success message or error response
 */
const deleteTest = async (req, res) => {
  try {
    const { test_id } = req.params;
    
    if (!test_id || isNaN(test_id)) {
      return res.status(400).json({ error: 'Valid test ID is required' });
    }
    
    const result = await TestManagement.deleteTest(test_id);
    res.json({ status: 'success', message: 'Test deleted successfully.', test: result });
  } catch (error) {
    console.error('Error deleting test:', error);
    
    if (error.message === 'Test not found') {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete test. Please try again.' });
  }
};

/**
 * Add a new question to a test
 * @async
 * @function addQuestion
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.test_id - Test ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.question_english - Question text in English
 * @param {string} req.body.question_tamil - Question text in Tamil
 * @param {Array} [req.body.options] - Array of answer options
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Created question object or error response
 */
const addQuestion = async (req, res) => {
  try {
    const { test_id } = req.params;
    const { question_english, question_tamil, options } = req.body;
    
    if (!test_id || isNaN(test_id)) {
      return res.status(400).json({ error: 'Valid test ID is required' });
    }
    
    if (!question_english || question_english.trim() === '') {
      return res.status(400).json({ error: 'English question text is required' });
    }
    
    if (!question_tamil || question_tamil.trim() === '') {
      return res.status(400).json({ error: 'Tamil question text is required' });
    }
    
    // Validate options if provided
    if (options && options.length > 0) {
      const hasCorrectAnswer = options.some(option => option.is_correct);
      if (!hasCorrectAnswer) {
        return res.status(400).json({ error: 'At least one option must be marked as correct' });
      }
      
      for (const option of options) {
        if (!option.option_english || !option.option_tamil) {
          return res.status(400).json({ error: 'All options must have both English and Tamil text' });
        }
      }
    }
    
    const question = await TestManagement.addQuestion(test_id, req.body);
    res.status(201).json({ 
      status: 'success', 
      message: 'Question added successfully.', 
      question 
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question. Please try again.' });
  }
};

/**
 * Update an existing question
 * @async
 * @function updateQuestion
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.test_id - Test ID
 * @param {string} req.params.question_id - Question ID
 * @param {Object} req.body - Request body
 * @param {string} [req.body.question_english] - Question text in English
 * @param {string} [req.body.question_tamil] - Question text in Tamil
 * @param {Object} [req.body.question] - Alternative question format {en, ta}
 * @param {Array} [req.body.options] - Array of answer options
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated question object or error response
 */
const updateQuestion = async (req, res) => {
  try {
    const { test_id, question_id } = req.params;
    const { question_english, question_tamil, question, options } = req.body;
    
    if (!test_id || isNaN(test_id)) {
      return res.status(400).json({ error: 'Valid test ID is required' });
    }
    
    if (!question_id || isNaN(question_id)) {
      return res.status(400).json({ error: 'Valid question ID is required' });
    }
    
    // Handle both data structures
    const questionEn = question_english || question?.en;
    const questionTa = question_tamil || question?.ta;
    
    if (!questionEn || questionEn.trim() === '') {
      return res.status(400).json({ error: 'English question text is required' });
    }
    
    if (!questionTa || questionTa.trim() === '') {
      return res.status(400).json({ error: 'Tamil question text is required' });
    }
    
    // Validate options if provided
    if (options && options.length > 0) {
      const hasCorrectAnswer = options.some(option => option.is_correct);
      if (!hasCorrectAnswer) {
        return res.status(400).json({ error: 'At least one option must be marked as correct' });
      }
      
      for (const option of options) {
        const optionEn = option.option_english || option.text?.en;
        const optionTa = option.option_tamil || option.text?.ta;
        if (!optionEn || !optionTa) {
          return res.status(400).json({ error: 'All options must have both English and Tamil text' });
        }
      }
    }
    
    const updatedQuestion = await TestManagement.updateQuestion(test_id, question_id, req.body);
    res.json({ 
      status: 'success', 
      message: 'Question updated successfully.', 
      question: updatedQuestion 
    });
  } catch (error) {
    console.error('Error updating question:', error);
    
    if (error.message === 'Question not found') {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.status(500).json({ error: 'Failed to update question. Please try again.' });
  }
};

/**
 * Delete a question from a test
 * @async
 * @function deleteQuestion
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.test_id - Test ID
 * @param {string} req.params.question_id - Question ID to delete
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Success message or error response
 */
const deleteQuestion = async (req, res) => {
  try {
    const { test_id, question_id } = req.params;
    
    if (!test_id || isNaN(test_id)) {
      return res.status(400).json({ error: 'Valid test ID is required' });
    }
    
    if (!question_id || isNaN(question_id)) {
      return res.status(400).json({ error: 'Valid question ID is required' });
    }
    
    await TestManagement.deleteQuestion(test_id, question_id);
    res.json({ status: 'success', message: 'Question deleted successfully.' });
  } catch (error) {
    console.error('Error deleting question:', error);
    
    if (error.message === 'Question not found') {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete question. Please try again.' });
  }
};

/**
 * Get all questions for a specific test
 * @async
 * @function getAllQuestions
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.test_id - Test ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Array of questions or error response
 */
const getAllQuestions = async (req, res) => {
  try {
    const { test_id } = req.params;
    
    if (!test_id || isNaN(test_id)) {
      return res.status(400).json({ error: 'Valid test ID is required' });
    }
    
    const questions = await TestManagement.getAllQuestions(test_id);
    res.json({ status: 'success', questions });
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ error: 'Failed to load questions. Please try again.' });
  }
};

/**
 * Update test settings and configuration
 * @async
 * @function updateTestSettings
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.test_id - Test ID
 * @param {Object} req.body - Request body
 * @param {string} [req.body.title] - Test title
 * @param {string} [req.body.description] - Test description
 * @param {string} [req.body.category] - Test category
 * @param {number} [req.body.passing_score] - Minimum score to pass (0-100)
 * @param {number} [req.body.duration_minutes] - Duration in minutes
 * @param {number} [req.body.duration_hours] - Duration in hours
 * @param {string} [req.body.status] - Test status
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated test object or error response
 */
const updateTestSettings = async (req, res) => {
  try {
    const { test_id } = req.params;
    
    if (!test_id || isNaN(test_id)) {
      return res.status(400).json({ error: 'Valid test ID is required' });
    }
    
    // Validate settings
    const { passing_score, duration_minutes, duration_hours } = req.body;
    
    if (passing_score !== undefined && (passing_score < 0 || passing_score > 100)) {
      return res.status(400).json({ error: 'Passing score must be between 0 and 100' });
    }
    
    const totalMinutes = (duration_hours || 0) * 60 + (duration_minutes || 0);
    if (totalMinutes <= 0) {
      return res.status(400).json({ error: 'Duration must be greater than 0' });
    }
    
    const result = await TestManagement.updateTestSettings(test_id, req.body);
    res.json({ status: 'success', message: 'Test settings updated successfully.', test: result });
  } catch (error) {
    console.error('Error updating test settings:', error);
    
    if (error.message === 'Test not found') {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    res.status(500).json({ error: 'Failed to update test settings. Please try again.' });
  }
};

/**
 * Search and filter tests with pagination and sorting
 * @async
 * @function searchTests
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.query=''] - Search query
 * @param {string} [req.query.sort='modified'] - Sort criteria
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=10] - Items per page
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Search results with pagination or error response
 */
const searchTests = async (req, res) => {
  try {
    const { 
      query: searchQuery = '', 
      sort = 'modified', 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const result = await TestManagement.searchTests(searchQuery, sort, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error searching tests:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to search tests. Please try again.' 
    });
  }
};

module.exports = {
  createFolder,
  getAllFolders,
  getFolderContents,
  deleteFolder,
  createTest,
  deleteTest,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
  updateTestSettings,
  searchTests,
};
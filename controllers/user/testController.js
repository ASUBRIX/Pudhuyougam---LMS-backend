// controllers/user/testController.js
const TestManagement = require('../../models/test');

const getFreeTests = async (req, res) => {
  try {
    const freeTests = await TestManagement.getFreeTests();
    res.json({
      status: 'success',
      folders: freeTests
    });
  } catch (error) {
    console.error('Error getting free tests:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to fetch free tests.' 
    });
  }
};

const getAllParentFolders = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const folders = await TestManagement.getAllParentFolders();
    
    // Filter only folders that have free tests
    const foldersWithFreeTests = folders.filter(folder => folder.test_count > 0);
    
    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedFolders = foldersWithFreeTests.slice(startIndex, endIndex);
    
    res.json({
      status: 'success',
      folders: paginatedFolders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(foldersWithFreeTests.length / parseInt(limit)),
        total: foldersWithFreeTests.length,
        hasNext: endIndex < foldersWithFreeTests.length,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error getting parent folders:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to fetch folders.' 
    });
  }
};

const getFolderContentsPublic = async (req, res) => {
  try {
    const { folder_id } = req.params;
    
    if (!folder_id || isNaN(folder_id)) {
      return res.status(400).json({ 
        status: 'error',
        error: 'Valid folder ID is required' 
      });
    }
    
    // Get folder contents with free tests only
    const contents = await TestManagement.getFolderContents(folder_id, true);
    
    // Ensure we only return published and free tests
    if (contents.tests) {
      contents.tests = contents.tests.filter(test => 
        test.status === 'published' && test.is_free === true
      );
    }
    
    res.json({
      status: 'success',
      ...contents
    });
  } catch (error) {
    console.error('Error getting folder contents:', error);
    
    if (error.message === 'Folder not found') {
      return res.status(404).json({ 
        status: 'error',
        error: 'Folder not found' 
      });
    }
    
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to load folder contents.' 
    });
  }
};

const getTestDetails = async (req, res) => {
  try {
    const { test_id } = req.params;
    
    if (!test_id || isNaN(test_id)) {
      return res.status(400).json({ 
        status: 'error',
        error: 'Valid test ID is required' 
      });
    }
    
    const testDetails = await TestManagement.getTestDetails(test_id);
    
    if (!testDetails) {
      return res.status(404).json({ 
        status: 'error',
        error: 'Test not found or not available for free access' 
      });
    }
    
    // Verify test is free and published
    if (!testDetails.is_free || testDetails.status !== 'published') {
      return res.status(403).json({ 
        status: 'error',
        error: 'Test is not available for free access' 
      });
    }
    
    res.json({
      status: 'success',
      test: {
        id: testDetails.id,
        title: testDetails.title,
        description: testDetails.description,
        duration_minutes: testDetails.duration_minutes,
        instructions: testDetails.instructions,
        passing_score: testDetails.passing_score,
        shuffle_questions: testDetails.shuffle_questions,
        show_results_immediately: testDetails.show_results_immediately,
        allow_answer_review: testDetails.allow_answer_review,
        enable_time_limit: testDetails.enable_time_limit
      }
    });
  } catch (error) {
    console.error('Error getting test details:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to load test details.' 
    });
  }
};

const getTestQuestions = async (req, res) => {
  try {
    const { test_id } = req.params;
    
    if (!test_id || isNaN(test_id)) {
      return res.status(400).json({ 
        status: 'error',
        error: 'Valid test ID is required' 
      });
    }
    
    // First verify the test is free and published
    const testDetails = await TestManagement.getTestDetails(test_id);
    if (!testDetails || !testDetails.is_free || testDetails.status !== 'published') {
      return res.status(404).json({ 
        status: 'error',
        error: 'Test not found or not available for free access' 
      });
    }
    
    // Get questions without correct answers for client side
    const questions = await TestManagement.getAllQuestions(test_id);
    
    if (!questions || questions.length === 0) {
      return res.status(404).json({ 
        status: 'error',
        error: 'No questions found for this test' 
      });
    }
    
    // Remove correct answers from options for security
    const questionsForClient = questions.map(question => ({
      question_id: question.question_id,
      question: question.question,
      options: question.options?.map(option => ({
        option_id: option.option_id,
        text: option.text
        // Don't include is_correct for client
      })) || []
    }));
    
    res.json({
      status: 'success',
      test: {
        id: testDetails.id,
        title: testDetails.title,
        description: testDetails.description,
        duration_minutes: testDetails.duration_minutes,
        instructions: testDetails.instructions,
        passing_score: testDetails.passing_score,
        shuffle_questions: testDetails.shuffle_questions,
        show_results_immediately: testDetails.show_results_immediately,
        allow_answer_review: testDetails.allow_answer_review,
        enable_time_limit: testDetails.enable_time_limit
      },
      questions: questionsForClient
    });
  } catch (error) {
    console.error('Error getting test questions:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to load test questions.' 
    });
  }
};

const submitTest = async (req, res) => {
  try {
    const { test_id } = req.params;
    const { answers, time_taken_seconds } = req.body;
    const user_id = req.user.id; // From auth middleware
    
    if (!test_id || isNaN(test_id)) {
      return res.status(400).json({ 
        status: 'error',
        error: 'Valid test ID is required' 
      });
    }
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        status: 'error',
        error: 'Valid answers array is required' 
      });
    }
    
    // Verify test exists and is free
    const testDetails = await TestManagement.getTestDetails(test_id);
    if (!testDetails || !testDetails.is_free || testDetails.status !== 'published') {
      return res.status(404).json({ 
        status: 'error',
        error: 'Test not found or not available for free access' 
      });
    }
    
    // Validate answers format
    for (const answer of answers) {
      if (!answer.question_id || !answer.selected_option_id) {
        return res.status(400).json({ 
          status: 'error',
          error: 'Each answer must have question_id and selected_option_id' 
        });
      }
    }
    
    // Prepare submission data
    const submissionData = {
      test_id: parseInt(test_id),
      user_id,
      answers,
      time_taken_seconds: time_taken_seconds || 0,
      submitted_at: new Date()
    };
    
    const result = await TestManagement.evaluateTest(test_id, submissionData);
    
    res.json({
      status: 'success',
      result
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    
    if (error.message === 'Test not found') {
      return res.status(404).json({ 
        status: 'error',
        error: 'Test not found' 
      });
    }
    
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to submit test.' 
    });
  }
};

const getTestHistory = async (req, res) => {
  try {
    const { page = 1, sort = 'date_desc', limit = 10 } = req.query;
    const user_id = req.user.id;
    
    // Get user's test attempts for free tests only
    const history = await TestManagement.getUserTestHistory(user_id, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      free_tests_only: true
    });
    
    res.json({
      status: 'success',
      attempts: history.attempts || [],
      pagination: {
        currentPage: parseInt(page),
        totalPages: history.totalPages || 1,
        total: history.total || 0,
        hasNext: history.hasNext || false,
        hasPrev: history.hasPrev || false
      }
    });
  } catch (error) {
    console.error('Error getting test history:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to load test history.' 
    });
  }
};

// Additional helper function to get test attempt details
const getTestAttemptDetails = async (req, res) => {
  try {
    const { attempt_id } = req.params;
    const user_id = req.user.id;
    
    if (!attempt_id || isNaN(attempt_id)) {
      return res.status(400).json({ 
        status: 'error',
        error: 'Valid attempt ID is required' 
      });
    }
    
    const attemptDetails = await TestManagement.getTestAttemptDetails(attempt_id, user_id);
    
    if (!attemptDetails) {
      return res.status(404).json({ 
        status: 'error',
        error: 'Test attempt not found' 
      });
    }
    
    res.json({
      status: 'success',
      attempt: attemptDetails
    });
  } catch (error) {
    console.error('Error getting test attempt details:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to load attempt details.' 
    });
  }
};

module.exports = {
  getFreeTests,
  getAllParentFolders,
  getFolderContentsPublic,
  getTestDetails,
  getTestQuestions,
  submitTest,
  getTestHistory,
  getTestAttemptDetails
};
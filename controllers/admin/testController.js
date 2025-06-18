const TestManagement = require('../../models/test');
const { query } = require('../../config/database');

const createFolder = async (req, res) => {
  try {
    const { parent_id, name } = req.body;
    const folder = await TestManagement.createFolder(name, parent_id === 'null' ? null : parent_id);
    res.json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const getFolderContents = async (req, res) => {
  try {
    const { folder_id } = req.params;
    const contents = await TestManagement.getFolderContents(folder_id);
    res.json(contents);
  } catch (error) {
    console.error('Error getting folder contents:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { folder_id } = req.params;
    const result = await TestManagement.deleteFolder(folder_id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const createTest = async (req, res) => {
  console.log("create test function called with body:", req.body);
  
  try {
    const test = await TestManagement.createTest(req.body);
    res.json(test);
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { test_id } = req.params;
    const question = await TestManagement.addQuestion(test_id, req.body);
    res.json({ status: 'success', message: 'Question added successfully.', question });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { test_id, question_id } = req.params;
    const question = await TestManagement.updateQuestion(test_id, question_id, req.body);
    res.json({ status: 'success', message: 'Question updated successfully.', question });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { test_id, question_id } = req.params;
    await TestManagement.deleteQuestion(test_id, question_id);
    res.json({ status: 'success', message: 'Question deleted successfully.' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const { test_id } = req.params;
    const questions = await TestManagement.getAllQuestions(test_id);
    res.json(questions);
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const updateTestSettings = async (req, res) => {
  try {
    const { test_id } = req.params;
    const result = await TestManagement.updateTestSettings(test_id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating test settings:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const searchTests = async (req, res) => {
  try {
    const { query: searchQuery, sort = 'modified', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let searchCondition = '';
    let queryParams = [];
    let paramCounter = 1;

    if (searchQuery && searchQuery.trim() !== '') {
      searchCondition = `WHERE LOWER(t.title) LIKE $${paramCounter} 
                        OR LOWER(t.description) LIKE $${paramCounter}
                        OR LOWER(tf.name) LIKE $${paramCounter}`;
      queryParams.push(`%${searchQuery.toLowerCase()}%`);
      paramCounter++;
    }

    let sortCondition;
    const normalizedSort = sort.toLowerCase();
    switch (normalizedSort) {
      case 'name':
        sortCondition = 'ORDER BY t.title ASC';
        break;
      case 'date':
      case 'modified':
      default:
        sortCondition = 'ORDER BY t.updated_at DESC';
        break;
    }

    const countSqlQuery = `
      SELECT COUNT(*) as total 
      FROM tests t 
      LEFT JOIN test_folders tf ON t.folder_id = tf.id
      ${searchCondition}`;

    const totalResult = await query(countSqlQuery, queryParams);
    const total = parseInt(totalResult.rows[0].total);

    const searchSqlQuery = `
      SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.category,
        t.status,
        t.is_free,
        t.created_at,
        t.updated_at,
        tf.name as folder_name,
        tf.id as folder_id,
        (SELECT COUNT(*) FROM test_questions WHERE test_id = t.id) as question_count
      FROM tests t
      LEFT JOIN test_folders tf ON t.folder_id = tf.id
      ${searchCondition}
      ${sortCondition}
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;

    queryParams.push(parseInt(limit), offset);
    const result = await query(searchSqlQuery, queryParams);

    res.json({
      status: 'success',
      pagination: {
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      query: searchQuery || '',
      sort: normalizedSort,
      tests: result.rows,
    });
  } catch (error) {
    console.error('Error searching tests:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};



module.exports = {
  createFolder,
  getFolderContents,
  deleteFolder,
  createTest,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
  updateTestSettings,
  searchTests,};


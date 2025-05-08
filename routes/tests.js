// routes/tests.js

const express = require('express');
const router = express.Router();
const TestManagement = require('../models/test');
const { auth, requireAdmin } = require('../middleware/auth');
const { query } = require('../config/database');

// Middleware to check auth_key
router.use(auth);

// Create folder
router.post('/folders/create', requireAdmin, async (req, res) => {
    try {
        const { parent_id, name } = req.body;
        const folder = await TestManagement.createFolder(name, parent_id === 'null' ? null : parent_id);
        res.json(folder);
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get folder contents
router.get('/folders/:folder_id/contents', requireAdmin, async (req, res) => {
    try {
        const { folder_id } = req.params;
        const contents = await TestManagement.getFolderContents(folder_id);
        res.json(contents);
    } catch (error) {
        console.error('Error getting folder contents:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Delete folder
router.delete('/folders/:folder_id', requireAdmin, async (req, res) => {
    try {
        const { folder_id } = req.params;
        const result = await TestManagement.deleteFolder(folder_id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Create test
router.post('/test/create', requireAdmin, async (req, res) => {
    try {
        const test = await TestManagement.createTest(req.body);
        res.json(test);
    } catch (error) {
        console.error('Error creating test:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Add question to test
router.post('/test/:test_id/questions', requireAdmin, async (req, res) => {
    try {
        const { test_id } = req.params;
        const question = await TestManagement.addQuestion(test_id, req.body);
        res.json({
            status: 'success',
            message: 'Question added successfully.',
            question
        });
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Edit question
router.put('/test/:test_id/questions/:question_id', requireAdmin, async (req, res) => {
    try {
        const { test_id, question_id } = req.params;
        const question = await TestManagement.updateQuestion(test_id, question_id, req.body);
        res.json({
            status: 'success',
            message: 'Question updated successfully.',
            question
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Delete question
router.delete('/test/:test_id/questions/:question_id', requireAdmin, async (req, res) => {
    try {
        const { test_id, question_id } = req.params;
        await TestManagement.deleteQuestion(test_id, question_id);
        res.json({
            status: 'success',
            message: 'Question deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get all questions in a test
router.get('/test/:test_id/questions', requireAdmin, async (req, res) => {
    try {
        const { test_id } = req.params;
        const questions = await TestManagement.getAllQuestions(test_id);
        res.json(questions);
    } catch (error) {
        console.error('Error getting questions:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Save test settings & finalize
router.put('/test/:test_id/settings', requireAdmin, async (req, res) => {
    try {
        const { test_id } = req.params;
        const result = await TestManagement.updateTestSettings(test_id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error updating test settings:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Search and sort tests
router.get('/search', requireAdmin, async (req, res) => {
    try {
        const { query: searchQuery, sort = 'modified', page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Build the search condition for tests
        let searchCondition = '';
        let queryParams = [];
        let paramCounter = 1;
        
        if (searchQuery && searchQuery.trim() !== '') {
            // Make sure to use ILIKE for case-insensitive search in PostgreSQL
            searchCondition = `WHERE LOWER(t.title) LIKE $${paramCounter} 
                              OR LOWER(t.description) LIKE $${paramCounter}
                              OR LOWER(tf.name) LIKE $${paramCounter}`;
            queryParams.push(`%${searchQuery.toLowerCase()}%`);
            paramCounter++;
        }
        
        // Build sorting condition for tests
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
        
        // Get total count for pagination
        const countSqlQuery = `
            SELECT COUNT(*) as total 
            FROM tests t 
            LEFT JOIN test_folders tf ON t.folder_id = tf.id
            ${searchCondition}`;
            
        const totalResult = await query(countSqlQuery, queryParams);
        const total = parseInt(totalResult.rows[0].total);
        
        // Main query with pagination
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
        
        console.log("Executing search query:", searchSqlQuery.replace(/\s+/g, ' '));
        console.log("With parameters:", queryParams);
        
        queryParams.push(parseInt(limit), offset);
        const result = await query(searchSqlQuery, queryParams);
        
        // Also search for matching folders separately
        let matchingFolders = [];
        if (searchQuery && searchQuery.trim() !== '') {
            // Build folder sort condition based on the same sort parameter
            let folderSortCondition;
            switch (normalizedSort) {
                case 'name':
                    folderSortCondition = 'ORDER BY name ASC';
                    break;
                case 'date':
                case 'modified':
                default:
                    folderSortCondition = 'ORDER BY updated_at DESC';
                    break;
            }
            
            const folderSearchSqlQuery = `
                SELECT 
                    id,
                    name,
                    parent_id,
                    created_at,
                    updated_at,
                    (SELECT COUNT(*) FROM tests WHERE folder_id = test_folders.id) as test_count,
                    (SELECT COUNT(*) FROM test_folders sub WHERE sub.parent_id = test_folders.id) as subfolder_count
                FROM test_folders
                WHERE LOWER(name) LIKE $1
                ${folderSortCondition}
                LIMIT 10`;
                
            console.log("Executing folder search query:", folderSearchSqlQuery.replace(/\s+/g, ' '));
            const folderResult = await query(folderSearchSqlQuery, [`%${searchQuery.toLowerCase()}%`]);
            matchingFolders = folderResult.rows;
            console.log(`Found ${matchingFolders.length} matching folders for "${searchQuery}"`);
        }
        
        // Calculate pagination info
        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNext = parseInt(page) < totalPages;
        const hasPrev = parseInt(page) > 1;
        
        console.log(`Tests found: ${result.rows.length} for query "${searchQuery || 'all'}", sort by ${sort}`);
        
        // Check which matches are by folder name
        const folderMatches = result.rows.filter(row => 
            row.folder_name && 
            searchQuery && 
            row.folder_name.toLowerCase().includes(searchQuery.toLowerCase())
        ).length;
        
        if (folderMatches > 0) {
            console.log(`Of these, ${folderMatches} matches are by folder name`);
        }
        
        res.json({
            status: 'success',
            pagination: {
                total,
                totalPages,
                currentPage: parseInt(page),
                limit: parseInt(limit),
                hasNext,
                hasPrev,
                nextPage: hasNext ? parseInt(page) + 1 : null,
                prevPage: hasPrev ? parseInt(page) - 1 : null
            },
            query: searchQuery || '',
            sort: normalizedSort,
            tests: result.rows,
            folders: matchingFolders
        });
    } catch (error) {
        console.error('Error searching tests:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Client-side routes

// Get top-level folders (no parent ID) that contain free tests either directly or in subfolders
router.get('/free', async (req, res) => {
    try {
        console.log('Free tests endpoint called by user:', req.user.id);
        const folders = await TestManagement.getFreeTests();
        console.log('Free test folders found:', folders.length);
        res.json({
            status: 'success',
            folders
        });
    } catch (error) {
        console.error('Error getting free tests:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get all top-level folders (no parent ID) regardless of whether they contain tests
router.get('/free/all', async (req, res) => {
    try {
        console.log('All parent folders endpoint called by user:', req.user.id);
        
        // Parse pagination parameters with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        
        // Get total count for pagination info
        const countSqlQuery = `
            SELECT COUNT(*) as total
            FROM test_folders tf
            WHERE tf.parent_id IS NULL`;
        
        const totalResult = await query(countSqlQuery);
        const total = parseInt(totalResult.rows[0].total);
        
        // Direct database query with pagination
        const sqlQuery = `
            SELECT 
                id, 
                name,
                parent_id,
                0 as level,
                (
                    SELECT json_agg(json_build_object(
                        'id', t.id,
                        'title', t.title,
                        'description', t.description,
                        'category', t.category,
                        'duration_minutes', t.duration_minutes,
                        'instructions', t.instructions,
                        'status', t.status
                    ))
                    FROM tests t 
                    WHERE t.folder_id = tf.id 
                    AND t.is_free = true
                    AND t.status = 'published'
                ) as tests,
                (
                    SELECT COUNT(*) 
                    FROM test_folders sub 
                    WHERE sub.parent_id = tf.id
                ) as subfolder_count
            FROM test_folders tf
            WHERE tf.parent_id IS NULL
            ORDER BY tf.name
            LIMIT $1 OFFSET $2`;
        
        const result = await query(sqlQuery, [limit, offset]);
        const folders = result.rows;
        
        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;
        
        console.log(`Parent folders found: ${folders.length} (page ${page} of ${totalPages})`);
        
        res.json({
            status: 'success',
            pagination: {
                total,
                totalPages,
                currentPage: page,
                limit,
                hasNext,
                hasPrev,
                nextPage: hasNext ? page + 1 : null,
                prevPage: hasPrev ? page - 1 : null
            },
            folders
        });
    } catch (error) {
        console.error('Error getting parent folders:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get folder contents (without requiring admin)
router.get('/folders/:folder_id/contents/public', async (req, res) => {
    try {
        const { folder_id } = req.params;
        const contents = await TestManagement.getFolderContents(folder_id, true);
        res.json(contents);
    } catch (error) {
        console.error('Error getting folder contents:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get test details for taking the test
router.get('/test/:test_id/take', async (req, res) => {
    try {
        const { test_id } = req.params;
        const test = await TestManagement.getTestDetails(test_id);
        
        if (!test) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Test not found or not available.' 
            });
        }

        res.json({
            status: 'success',
            test
        });
    } catch (error) {
        console.error('Error getting test details:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Submit test answers
router.post('/test/:test_id/submit', async (req, res) => {
    try {
        const { test_id } = req.params;
        const { answers, time_taken_seconds } = req.body;
        
        // Add user_id and time_taken to each answer
        const answersWithUser = answers.map(answer => ({
            ...answer,
            user_id: req.user.id,
            time_taken_seconds
        }));

        const result = await TestManagement.evaluateTest(test_id, answersWithUser);
        
        res.json({
            status: 'success',
            result
        });
    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get questions and options for client-side test taking
router.get('/test/:test_id/questions/details', async (req, res) => {
    try {
        const { test_id } = req.params;
        
        // Check if test is available for taking and get settings
        const testSqlQuery = `
            SELECT id, title, description, category, duration_minutes, 
                   instructions, passing_score, shuffle_questions, 
                   show_results_immediately, allow_answer_review, enable_time_limit
            FROM tests 
            WHERE id = $1 AND is_free = true AND status = 'published'`;
        const testResult = await query(testSqlQuery, [test_id]);
        
        if (testResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'Test not found or not available'
            });
        }
        
        // Get questions and options but don't reveal correct answers
        const questionsSqlQuery = `
            SELECT 
                q.id as question_id,
                json_build_object(
                    'en', q.question_english,
                    'ta', q.question_tamil
                ) as question,
                (
                    SELECT json_agg(
                        json_build_object(
                            'option_id', o.id,
                            'text', json_build_object(
                                'en', o.option_english,
                                'ta', o.option_tamil
                            )
                        )
                    )
                    FROM test_options o
                    WHERE o.question_id = q.id
                ) as options
            FROM test_questions q
            WHERE q.test_id = $1
            GROUP BY q.id
            ORDER BY q.id`;
        
        const questions = await query(questionsSqlQuery, [test_id]);
        
        res.json({
            status: 'success',
            test: testResult.rows[0],
            questions: questions.rows
        });
    } catch (error) {
        console.error('Error getting questions for client:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// Get student's test history
router.get('/history', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Parse pagination and sorting parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const sort = req.query.sort || 'date_desc';
        const offset = (page - 1) * limit;
        
        let sortField, sortDirection;
        
        // Determine sort field and direction based on sort parameter
        switch(sort) {
            case 'date_asc':
                sortField = 'ta.created_at';
                sortDirection = 'ASC';
                break;
            case 'name_asc':
                sortField = 't.title';
                sortDirection = 'ASC';
                break;
            case 'name_desc':
                sortField = 't.title';
                sortDirection = 'DESC';
                break;
            case 'score_asc':
                sortField = 'ta.score';
                sortDirection = 'ASC';
                break;
            case 'score_desc':
                sortField = 'ta.score';
                sortDirection = 'DESC';
                break;
            case 'date_desc':
            default:
                sortField = 'ta.created_at';
                sortDirection = 'DESC';
                break;
        }
        
        // Get total count of test attempts
        const countSqlQuery = `
            SELECT COUNT(*) as total 
            FROM test_attempts ta 
            WHERE ta.user_id = $1`;
        
        const totalResult = await query(countSqlQuery, [userId]);
        const total = parseInt(totalResult.rows[0].total);
        
        // Get test history with pagination and sorting
        const historySqlQuery = `
            SELECT 
                ta.id as attempt_id,
                t.id as test_id,
                t.title as test_name,
                ta.created_at as taken_date,
                ta.score,
                ta.total_questions,
                ta.correct_answers,
                ta.incorrect_answers,
                ta.unanswered,
                ta.time_taken_seconds,
                ta.passing_score,
                CASE WHEN ta.score >= t.passing_score THEN 'Passed' ELSE 'Failed' END as status
            FROM test_attempts ta
            JOIN tests t ON ta.test_id = t.id
            WHERE ta.user_id = $1
            ORDER BY ${sortField} ${sortDirection}
            LIMIT $2 OFFSET $3`;
        
        const historyResult = await query(historySqlQuery, [userId, limit, offset]);
        
        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            status: 'success',
            history: historyResult.rows,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching test history:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

module.exports = router;

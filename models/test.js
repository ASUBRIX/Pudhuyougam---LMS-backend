const { query } = require('../config/database');

class TestManagement {
    // Folder Management
    static async createFolder(name, parentId = null) {
        try {
            const sqlQuery = `
                INSERT INTO test_folders (name, parent_id)
                VALUES ($1, $2)
                RETURNING id, name, parent_id, created_at`;
            const values = [name, parentId];
            
            const result = await query(sqlQuery, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating folder:', error);
            throw error;
        }
    }

    static async getFolderContents(folderId, publicAccess = false) {
        try {
            // Get current folder info
            const folderQuery = `
                SELECT id, name FROM test_folders WHERE id = $1`;
            const folder = await query(folderQuery, [folderId]);

            // Get breadcrumbs
            const breadcrumbsQuery = `
                WITH RECURSIVE folder_path AS (
                    SELECT id, name, parent_id, ARRAY[id] as path
                    FROM test_folders
                    WHERE id = $1
                    UNION ALL
                    SELECT f.id, f.name, f.parent_id, f.id || fp.path
                    FROM test_folders f
                    JOIN folder_path fp ON f.id = fp.parent_id
                )
                SELECT id, name FROM folder_path ORDER BY path DESC`;
            const breadcrumbs = await query(breadcrumbsQuery, [folderId]);

            // Get subfolders
            const subfoldersQuery = `
                SELECT id, name FROM test_folders WHERE parent_id = $1`;
            const subfolders = await query(subfoldersQuery, [folderId]);

            // Get tests in this folder
            const testsQuery = `
                SELECT id, title, is_free, status 
                FROM tests 
                WHERE folder_id = $1
                ${publicAccess ? 'AND is_free = true AND status = \'published\'' : ''}`;
            const tests = await query(testsQuery, [folderId]);

            return {
                folder: folder.rows[0],
                breadcrumbs: breadcrumbs.rows,
                folders: subfolders.rows,
                tests: tests.rows
            };
        } catch (error) {
            console.error('Error getting folder contents:', error);
            throw error;
        }
    }

    static async deleteFolder(folderId) {
        try {
            const sqlQuery = `DELETE FROM test_folders WHERE id = $1 RETURNING *`;
            const result = await query(sqlQuery, [folderId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting folder:', error);
            throw error;
        }
    }

    // Test Management
    static async createTest(testData) {
        try {
            const {
                folder_id,
                title,
                description,
                category,
                passing_score,
                duration_hours,
                duration_minutes,
                instructions
            } = testData;

            const totalMinutes = (duration_hours || 0) * 60 + (duration_minutes || 0);

            const sqlQuery = `
                INSERT INTO tests (
                    folder_id, title, description, category,
                    passing_score, duration_minutes, instructions
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, status`;
            
            const values = [
                folder_id,
                title,
                description,
                category,
                passing_score,
                totalMinutes,
                instructions
            ];

            const result = await query(sqlQuery, values);
            return {
                ...result.rows[0],
                step: 'test_sections'
            };
        } catch (error) {
            console.error('Error creating test:', error);
            throw error;
        }
    }

    static async addQuestion(testId, questionData) {
        try {
            // Transaction is handled by query function with properly released client

            // Insert question
            const questionQuery = `
                INSERT INTO test_questions (
                    test_id, question_english, question_tamil
                )
                VALUES ($1, $2, $3)
                RETURNING id`;
            const questionValues = [
                testId,
                questionData.question_english,
                questionData.question_tamil
            ];
            const questionResult = await query(questionQuery, questionValues);
            const questionId = questionResult.rows[0].id;

            // Insert options
            for (const option of questionData.options) {
                await query(`
                    INSERT INTO test_options (
                        question_id, option_english, option_tamil, is_correct
                    )
                    VALUES ($1, $2, $3, $4)`,
                    [questionId, option.option_english, option.option_tamil, option.is_correct]
                );
            }

            // Return the created question with options
            return await this.getQuestion(questionId);
        } catch (error) {
            console.error('Error adding question:', error);
            throw error;
        }
    }

    static async getQuestion(questionId) {
        try {
            const questionQuery = `
                SELECT q.id as question_id, q.test_id,
                       json_build_object(
                           'en', q.question_english,
                           'ta', q.question_tamil
                       ) as question,
                       json_agg(
                           json_build_object(
                               'option_id', o.id,
                               'text', json_build_object(
                                   'en', o.option_english,
                                   'ta', o.option_tamil
                               ),
                               'is_correct', o.is_correct
                           )
                       ) as options
                FROM test_questions q
                LEFT JOIN test_options o ON q.id = o.question_id
                WHERE q.id = $1
                GROUP BY q.id, q.test_id`;
            
            const result = await query(questionQuery, [questionId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting question:', error);
            throw error;
        }
    }

    static async updateQuestion(testId, questionId, questionData) {
        try {
            // Update question
            await query(`
                UPDATE test_questions
                SET question_english = $1,
                    question_tamil = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3 AND test_id = $4`,
                [
                    questionData.question.en,
                    questionData.question.ta,
                    questionId,
                    testId
                ]
            );

            // Delete existing options
            await query(`
                DELETE FROM test_options
                WHERE question_id = $1`,
                [questionId]
            );

            // Insert new options
            for (const option of questionData.options) {
                await query(`
                    INSERT INTO test_options (
                        question_id,
                        option_english,
                        option_tamil,
                        is_correct
                    )
                    VALUES ($1, $2, $3, $4)`,
                    [
                        questionId,
                        option.text.en,
                        option.text.ta,
                        option.is_correct
                    ]
                );
            }

            // Return updated question
            return await this.getQuestion(questionId);
        } catch (error) {
            console.error('Error updating question:', error);
            throw error;
        }
    }

    static async deleteQuestion(testId, questionId) {
        try {
            const sqlQuery = `
                DELETE FROM test_questions
                WHERE id = $1 AND test_id = $2
                RETURNING id`;
            const result = await query(sqlQuery, [questionId, testId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    }

    static async getAllQuestions(testId) {
        try {
            const sqlQuery = `
                SELECT 
                    q.id as question_id,
                    json_build_object(
                        'en', q.question_english,
                        'ta', q.question_tamil
                    ) as question,
                    json_agg(
                        json_build_object(
                            'option_id', o.id,
                            'text', json_build_object(
                                'en', o.option_english,
                                'ta', o.option_tamil
                            ),
                            'is_correct', o.is_correct
                        )
                    ) as options
                FROM test_questions q
                LEFT JOIN test_options o ON q.id = o.question_id
                WHERE q.test_id = $1
                GROUP BY q.id
                ORDER BY q.id`;
            
            const result = await query(sqlQuery, [testId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting all questions:', error);
            throw error;
        }
    }

    static async updateTestSettings(testId, settings) {
        try {
            const {
                title,
                description,
                category,
                passing_score,
                duration_hours,
                duration_minutes,
                instructions,
                is_free,
                status,
                shuffle_questions,
                show_results_immediately,
                allow_answer_review,
                enable_time_limit
            } = settings;

            const totalMinutes = 
                (parseInt(duration_hours) || 0) * 60 + 
                (parseInt(duration_minutes) || 0);

            const sqlQuery = `
                UPDATE tests
                SET title = $1,
                    description = $2,
                    category = $3,
                    passing_score = $4,
                    duration_minutes = $5,
                    instructions = $6,
                    is_free = $7,
                    status = $8,
                    shuffle_questions = $9,
                    show_results_immediately = $10,
                    allow_answer_review = $11,
                    enable_time_limit = $12,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $13
                RETURNING *`;

            const values = [
                title,
                description,
                category,
                passing_score,
                totalMinutes,
                instructions,
                is_free === true || is_free === 'true',
                status || 'draft',
                shuffle_questions === true || shuffle_questions === 'true',
                show_results_immediately === true || show_results_immediately === 'true',
                allow_answer_review === true || allow_answer_review === 'true',
                enable_time_limit === true || enable_time_limit === 'true',
                testId
            ];

            const result = await query(sqlQuery, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating test settings:', error);
            throw error;
        }
    }

    // Getting free tests (client-side)
    static async getFreeTests() {
        try {
            const sqlQuery = `
                WITH RECURSIVE folder_tree AS (
                    -- Start with all root folders (parent_id is NULL)
                    SELECT id, name, parent_id, 0 as level
                    FROM test_folders
                    WHERE parent_id IS NULL
                    
                    UNION ALL
                    
                    -- Add all children recursively with increased level
                    SELECT tf.id, tf.name, tf.parent_id, ft.level + 1
                    FROM test_folders tf
                    JOIN folder_tree ft ON tf.parent_id = ft.id
                )
                SELECT 
                    ft.id, 
                    ft.name,
                    ft.parent_id,
                    ft.level,
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
                        WHERE t.folder_id = ft.id 
                        AND t.is_free = true
                        AND t.status = 'published'
                    ) as tests,
                    (
                        SELECT COUNT(*) > 0
                        FROM folder_tree sub_ft
                        JOIN tests t ON t.folder_id = sub_ft.id
                        WHERE sub_ft.id = ft.id OR sub_ft.parent_id = ft.id
                        AND t.is_free = true
                        AND t.status = 'published'
                    ) as has_tests
                FROM folder_tree ft
                WHERE ft.parent_id IS NULL
                AND (
                    EXISTS (
                        SELECT 1
                        FROM tests t
                        WHERE t.folder_id = ft.id
                        AND t.is_free = true
                        AND t.status = 'published'
                    )
                    OR
                    EXISTS (
                        SELECT 1
                        FROM folder_tree sub_ft
                        JOIN tests t ON t.folder_id = sub_ft.id
                        WHERE sub_ft.parent_id = ft.id
                        AND t.is_free = true
                        AND t.status = 'published'
                    )
                )
                ORDER BY ft.name`;
            
            const result = await query(sqlQuery);
            return result.rows;
        } catch (error) {
            console.error('Error getting free tests:', error);
            throw error;
        }
    }

    // Get detailed test for taking test
    static async getTestDetails(testId) {
        try {
            // Get test info
            const testQuery = `
                SELECT id, title, description, category, duration_minutes, 
                       instructions, passing_score, shuffle_questions, 
                       show_results_immediately, allow_answer_review, enable_time_limit
                FROM tests 
                WHERE id = $1 AND is_free = true AND status = 'published'`;
            
            const testResult = await query(testQuery, [testId]);
            
            if (testResult.rows.length === 0) {
                return null;
            }
            
            // Get test questions preview (no correct answers)
            const questionsQuery = `
                SELECT 
                    q.id,
                    json_build_object(
                        'en', q.question_english,
                        'ta', q.question_tamil
                    ) as question,
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', o.id,
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
                GROUP BY q.id`;
            
            const questionsResult = await query(questionsQuery, [testId]);
            
            return {
                ...testResult.rows[0],
                questions: questionsResult.rows,
                shuffle_questions: testResult.rows[0].shuffle_questions
            };
        } catch (error) {
            console.error('Error getting test details:', error);
            throw error;
        }
    }

    // Evaluate test
    static async evaluateTest(testId, answers) {
        try {
            // First, get test information
            const testQuery = `
                SELECT id, title, passing_score
                FROM tests 
                WHERE id = $1`;
            
            const testResult = await query(testQuery, [testId]);
            
            if (testResult.rows.length === 0) {
                throw new Error("Test not found");
            }
            
            const test = testResult.rows[0];
            
            // Get correct answers for this test
            const correctAnswersQuery = `
                SELECT 
                    q.id as question_id,
                    (
                        SELECT o.id 
                        FROM test_options o 
                        WHERE o.question_id = q.id AND o.is_correct = true
                        LIMIT 1
                    ) as correct_option_id
                FROM test_questions q
                WHERE q.test_id = $1`;
            
            const correctAnswersResult = await query(correctAnswersQuery, [testId]);
            const correctAnswersMap = correctAnswersResult.rows.reduce((map, item) => {
                map[item.question_id] = item.correct_option_id;
                return map;
            }, {});
            
            // Check each answer
            let correctCount = 0;
            const totalQuestions = correctAnswersResult.rows.length;
            const answersWithResults = [];
            
            // Create a set of all question IDs to track unanswered questions
            const allQuestionIds = new Set(correctAnswersResult.rows.map(row => row.question_id));
            const answeredQuestionIds = new Set();
            
            for (const answer of answers) {
                // Mark this question as answered
                answeredQuestionIds.add(answer.question_id);
                
                const isCorrect = correctAnswersMap[answer.question_id] === answer.selected_option_id;
                
                if (isCorrect) {
                    correctCount++;
                }
                
                answersWithResults.push({
                    ...answer,
                    is_correct: isCorrect,
                    correct_option_id: correctAnswersMap[answer.question_id]
                });
            }
            
            // Calculate score as percentage
            const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
            const passed = score >= test.passing_score;
            
            // Calculate additional metrics
            const incorrectCount = answers.length - correctCount;
            const unansweredCount = totalQuestions - answeredQuestionIds.size;
            
            // Get time taken from request body or default to 0
            const timeTakenSeconds = answers.length > 0 && answers[0].time_taken_seconds 
                ? parseInt(answers[0].time_taken_seconds) 
                : 0;
            
            // Record the attempt with new fields
            const attemptQuery = `
                INSERT INTO test_attempts(
                    test_id, user_id, score, passed, answers,
                    total_questions, correct_answers, incorrect_answers, 
                    unanswered, time_taken_seconds, passing_score
                )
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id`;
            
            const attemptValues = [
                testId,
                answers[0].user_id, // All answers should have the same user_id
                score,
                passed,
                JSON.stringify(answersWithResults),
                totalQuestions,
                correctCount,
                incorrectCount,
                unansweredCount,
                timeTakenSeconds,
                test.passing_score
            ];
            
            const attemptResult = await query(attemptQuery, attemptValues);
            
            return {
                test_id: testId,
                test_title: test.title,
                score,
                passed,
                total_questions: totalQuestions,
                correct_answers: correctCount,
                incorrect_answers: incorrectCount,
                unanswered: unansweredCount,
                time_taken_seconds: timeTakenSeconds,
                passing_score: test.passing_score,
                attempt_id: attemptResult.rows[0].id,
                answers: answersWithResults
            };
        } catch (error) {
            console.error('Error evaluating test:', error);
            throw error;
        }
    }

    // Get all parent folders
    static async getAllParentFolders() {
        try {
            const sqlQuery = `
                SELECT 
                    id, 
                    name,
                    parent_id,
                    (SELECT COUNT(*) FROM test_folders sub WHERE sub.parent_id = tf.id) as subfolder_count,
                    (SELECT COUNT(*) FROM tests t WHERE t.folder_id = tf.id) as test_count
                FROM test_folders tf
                WHERE parent_id IS NULL
                ORDER BY name`;
            
            const result = await query(sqlQuery);
            return result.rows;
        } catch (error) {
            console.error('Error getting parent folders:', error);
            throw error;
        }
    }
}

module.exports = TestManagement;

// models/test.js
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

  static async getAllFolders(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM test_folders WHERE parent_id IS NULL`;
      const countResult = await query(countQuery);
      const total = parseInt(countResult.rows[0].total);
      
      // Get folders with pagination and counts
      const foldersQuery = `
        SELECT 
          tf.id,
          tf.name,
          tf.parent_id,
          tf.created_at,
          tf.updated_at,
          (SELECT COUNT(*) FROM test_folders sub WHERE sub.parent_id = tf.id) as subfolder_count,
          (SELECT COUNT(*) FROM tests t WHERE t.folder_id = tf.id) as tests_count
        FROM test_folders tf
        WHERE tf.parent_id IS NULL
        ORDER BY tf.updated_at DESC
        LIMIT $1 OFFSET $2`;
      
      const result = await query(foldersQuery, [limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        folders: result.rows,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        }
      };
    } catch (error) {
      console.error('Error getting all folders:', error);
      throw error;
    }
  }

  static async getFolderContents(folderId, publicAccess = false) {
    try {
      // Get current folder info
      const folderQuery = `
        SELECT id, name FROM test_folders WHERE id = $1`;
      const folder = await query(folderQuery, [folderId]);

      // Get breadcrumbs with improved recursive query
      const breadcrumbsQuery = `
        WITH RECURSIVE folder_path AS (
          SELECT id, name, parent_id, 1 as level
          FROM test_folders
          WHERE id = $1
          UNION ALL
          SELECT f.id, f.name, f.parent_id, fp.level + 1
          FROM test_folders f
          JOIN folder_path fp ON f.id = fp.parent_id
        )
        SELECT id, name FROM folder_path 
        WHERE id != $1
        ORDER BY level DESC`;
      const breadcrumbs = await query(breadcrumbsQuery, [folderId]);

      // Get subfolders with counts
      const subfoldersQuery = `
        SELECT 
          tf.id, 
          tf.name,
          tf.created_at,
          tf.updated_at,
          (SELECT COUNT(*) FROM test_folders sub WHERE sub.parent_id = tf.id) as subfolder_count,
          (SELECT COUNT(*) FROM tests t WHERE t.folder_id = tf.id ${publicAccess ? 'AND t.is_free = true AND t.status = \'published\'' : ''}) as tests_count
        FROM test_folders tf 
        WHERE tf.parent_id = $1
        ORDER BY tf.name`;
      const subfolders = await query(subfoldersQuery, [folderId]);

      // Get tests in this folder with enhanced data
      const testsQuery = `
        SELECT 
          t.id, 
          t.title, 
          t.description,
          t.category,
          t.duration_minutes, 
          t.is_free, 
          t.status,
          t.passing_score,
          t.created_at,
          t.updated_at,
          (SELECT COUNT(*) FROM test_attempts ta WHERE ta.test_id = t.id) as attempts_count,
          (SELECT COUNT(*) FROM test_questions tq WHERE tq.test_id = t.id) as question_count
        FROM tests t
        WHERE t.folder_id = $1
        ${publicAccess ? 'AND t.is_free = true AND t.status = \'published\'' : ''}
        ORDER BY t.updated_at DESC`;
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
      // Check if folder has contents
      const contentsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM test_folders WHERE parent_id = $1) as subfolder_count,
          (SELECT COUNT(*) FROM tests WHERE folder_id = $1) as tests_count`;
      
      const contentsResult = await query(contentsQuery, [folderId]);
      const { subfolder_count, tests_count } = contentsResult.rows[0];
      
      if (parseInt(subfolder_count) > 0 || parseInt(tests_count) > 0) {
        throw new Error('Cannot delete folder that contains subfolders or tests');
      }
      
      const sqlQuery = `DELETE FROM test_folders WHERE id = $1 RETURNING *`;
      const result = await query(sqlQuery, [folderId]);
      
      if (result.rows.length === 0) {
        throw new Error('Folder not found');
      }
      
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
        instructions,
        status = 'draft',
        shuffle_questions = false,
        show_results_immediately = true,
        allow_answer_review = true,
        enable_time_limit = true,
        is_free = false
      } = testData;

      const totalMinutes = (duration_hours || 0) * 60 + (duration_minutes || 0);

      const sqlQuery = `
        INSERT INTO tests (
          folder_id, title, description, category,
          passing_score, duration_minutes, instructions,
          status, shuffle_questions, show_results_immediately,
          allow_answer_review, enable_time_limit, is_free
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`;
      
      const values = [
        folder_id,
        title,
        description,
        category,
        passing_score,
        totalMinutes,
        instructions,
        status,
        shuffle_questions,
        show_results_immediately,
        allow_answer_review,
        enable_time_limit,
        is_free
      ];

      const result = await query(sqlQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating test:', error);
      throw error;
    }
  }

  static async deleteTest(testId) {
    try {
      const deleteQuery = `DELETE FROM tests WHERE id = $1 RETURNING *`;
      const result = await query(deleteQuery, [testId]);
      
      if (result.rows.length === 0) {
        throw new Error('Test not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting test:', error);
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
      
      if (result.rows.length === 0) {
        throw new Error('Test not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating test settings:', error);
      throw error;
    }
  }

  // Question Management  
  static async addQuestion(testId, questionData) {
    try {
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
      // Handle both old and new data structures
      const questionEn = questionData.question_english || questionData.question?.en;
      const questionTa = questionData.question_tamil || questionData.question?.ta;
      
      // Update question
      await query(`
        UPDATE test_questions
        SET question_english = $1,
            question_tamil = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND test_id = $4`,
        [questionEn, questionTa, questionId, testId]
      );

      // Delete existing options
      await query(`
        DELETE FROM test_options
        WHERE question_id = $1`,
        [questionId]
      );

      // Insert new options - handle both data structures
      const options = questionData.options || [];
      for (const option of options) {
        const optionEn = option.option_english || option.text?.en;
        const optionTa = option.option_tamil || option.text?.ta;
        
        await query(`
          INSERT INTO test_options (
            question_id,
            option_english,
            option_tamil,
            is_correct
          )
          VALUES ($1, $2, $3, $4)`,
          [questionId, optionEn, optionTa, option.is_correct]
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
      
      if (result.rows.length === 0) {
        throw new Error('Question not found');
      }
      
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

  // Search functionality
  static async searchTests(searchQuery, sort = 'modified', page = 1, limit = 10) {
    try {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
      const offset = (pageNum - 1) * limitNum;
      
      let searchCondition = '';
      let queryParams = [];
      let paramCounter = 1;

      if (searchQuery && searchQuery.trim() !== '') {
        searchCondition = `WHERE (
          LOWER(t.title) LIKE $${paramCounter} 
          OR LOWER(t.description) LIKE $${paramCounter}
          OR LOWER(tf.name) LIKE $${paramCounter}
        )`;
        queryParams.push(`%${searchQuery.toLowerCase().trim()}%`);
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

      // Get total count
      const countSqlQuery = `
        SELECT COUNT(DISTINCT t.id) as total 
        FROM tests t 
        LEFT JOIN test_folders tf ON t.folder_id = tf.id
        ${searchCondition}`;

      const totalResult = await query(countSqlQuery, queryParams);
      const total = parseInt(totalResult.rows[0].total);

      // Get search results
      const searchSqlQuery = `
        SELECT DISTINCT
          t.id, 
          t.title, 
          t.description, 
          t.category,
          t.status,
          t.is_free,
          t.passing_score,
          t.duration_minutes,
          t.created_at,
          t.updated_at,
          tf.name as folder_name,
          tf.id as folder_id,
          (SELECT COUNT(*) FROM test_questions WHERE test_id = t.id) as question_count,
          (SELECT COUNT(*) FROM test_attempts WHERE test_id = t.id) as attempts_count
        FROM tests t
        LEFT JOIN test_folders tf ON t.folder_id = tf.id
        ${searchCondition}
        ${sortCondition}
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;

      queryParams.push(limitNum, offset);
      const result = await query(searchSqlQuery, queryParams);

      // Also search in folders if there's a search query
      let folders = [];
      if (searchQuery && searchQuery.trim() !== '') {
        const folderSearchQuery = `
          SELECT 
            tf.id,
            tf.name,
            tf.parent_id,
            tf.created_at,
            tf.updated_at,
            (SELECT COUNT(*) FROM test_folders sub WHERE sub.parent_id = tf.id) as subfolder_count,
            (SELECT COUNT(*) FROM tests t WHERE t.folder_id = tf.id) as tests_count
          FROM test_folders tf
          WHERE LOWER(tf.name) LIKE $1
          ORDER BY tf.updated_at DESC
          LIMIT $2`;
        
        const folderResult = await query(folderSearchQuery, [
          `%${searchQuery.toLowerCase().trim()}%`, 
          limitNum
        ]);
        folders = folderResult.rows;
      }

      const totalPages = Math.ceil(total / limitNum);

      return {
        status: 'success',
        pagination: {
          total,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        query: searchQuery.trim(),
        sort: normalizedSort,
        tests: result.rows,
        folders: folders
      };
    } catch (error) {
      console.error('Error searching tests:', error);
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
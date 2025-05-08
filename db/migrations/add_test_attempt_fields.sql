-- Migration to add additional fields to test_attempts table

-- Add total_questions column
ALTER TABLE test_attempts ADD COLUMN total_questions INTEGER DEFAULT 0;

-- Add correct_answers column
ALTER TABLE test_attempts ADD COLUMN correct_answers INTEGER DEFAULT 0;

-- Add incorrect_answers column
ALTER TABLE test_attempts ADD COLUMN incorrect_answers INTEGER DEFAULT 0;

-- Add unanswered column
ALTER TABLE test_attempts ADD COLUMN unanswered INTEGER DEFAULT 0;

-- Add time_taken_seconds column
ALTER TABLE test_attempts ADD COLUMN time_taken_seconds INTEGER DEFAULT 0;

-- Add passing_score column (copying from the test)
ALTER TABLE test_attempts ADD COLUMN passing_score INTEGER;

-- Comment explaining migration
COMMENT ON TABLE test_attempts IS 'Records of student test attempts with detailed performance metrics'; 
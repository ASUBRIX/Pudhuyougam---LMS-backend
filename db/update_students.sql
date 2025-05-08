-- Migration script to update student records to match the new user schema
-- This script will update the student name fields to match users table

-- First verify which students don't match the user data
SELECT 
  s.id AS student_id, 
  s.user_id,
  s.first_name AS student_first_name, 
  s.last_name AS student_last_name,
  u.first_name AS user_first_name,
  u.last_name AS user_last_name
FROM students s
JOIN users u ON s.user_id = u.id
WHERE s.first_name != u.first_name OR s.last_name != u.last_name;

-- Update student records to match user data
UPDATE students s
SET 
  first_name = u.first_name,
  last_name = u.last_name,
  updated_at = CURRENT_TIMESTAMP
FROM users u
WHERE s.user_id = u.id
AND (s.first_name != u.first_name OR s.last_name != u.last_name);

-- Verify the changes
SELECT 
  s.id AS student_id, 
  s.user_id,
  s.first_name AS student_first_name, 
  s.last_name AS student_last_name,
  u.first_name AS user_first_name,
  u.last_name AS user_last_name
FROM students s
JOIN users u ON s.user_id = u.id
LIMIT 10; 
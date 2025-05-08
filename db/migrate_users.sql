-- Migration script to update users table schema
-- Maps existing username → first_name and full_name → last_name

-- Step 1: Add new columns
ALTER TABLE users ADD COLUMN first_name VARCHAR(50);
ALTER TABLE users ADD COLUMN last_name VARCHAR(50);

-- Step 2: Populate the new columns from existing data
UPDATE users
SET 
  first_name = username,
  last_name = full_name;

-- Step 3: Make columns NOT NULL after populating them
ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;

-- Step 4: Drop the old columns
ALTER TABLE users DROP COLUMN username;
ALTER TABLE users DROP COLUMN full_name;

-- Verify the migration
SELECT id, first_name, last_name, email FROM users LIMIT 10; 
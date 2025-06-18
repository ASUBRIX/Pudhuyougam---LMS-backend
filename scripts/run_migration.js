const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function runMigration() {
    try {
        console.log('Running test_attempts table migration...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '../db/migrations/add_test_attempt_fields.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        // Run the migration
        await query(migrationSql);
        
        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Error running migration:', error);
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    runMigration();
}

module.exports = runMigration; 
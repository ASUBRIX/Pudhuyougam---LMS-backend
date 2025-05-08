// update_student_records.js
// Script to update student records to match the new user schema

const fs = require('fs');
const path = require('path');
const { pool, query } = require('./config/database');

async function updateStudentRecords() {
    try {
        console.log('Starting student records update...');
        
        // First check if both tables exist
        const checkTables = await query(`
            SELECT 
                COUNT(*) FILTER (WHERE table_name = 'users') AS users_count,
                COUNT(*) FILTER (WHERE table_name = 'students') AS students_count
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        if (checkTables.rows[0].users_count === '0' || checkTables.rows[0].students_count === '0') {
            console.log('Migration not needed: users or students table does not exist.');
            return;
        }
        
        // Read the migration SQL
        const migrationPath = path.join(__dirname, 'db', 'update_students.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split SQL into statements
        const statements = migrationSQL.split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);
        
        // Execute each statement
        for (const statement of statements) {
            if (statement.toLowerCase().trim().startsWith('select')) {
                // For SELECT statements, print the results
                const result = await query(statement);
                console.log(`\nQuery results (${result.rows.length} rows):`);
                if (result.rows.length > 0) {
                    console.table(result.rows);
                } else {
                    console.log('No rows returned.');
                }
            } else if (statement.toLowerCase().trim().startsWith('update')) {
                // For UPDATE statements, print the affected rows
                const result = await query(statement);
                console.log(`\nUpdated ${result.rowCount} student records to match user data.`);
            } else {
                // For other statements, just execute
                await query(statement);
                console.log(`\nExecuted: ${statement.substring(0, 50)}...`);
            }
        }
        
        console.log('\nStudent records update completed successfully.');
        
    } catch (error) {
        console.error('Update failed:', error);
    } finally {
        // Close pool connection
        await pool.end();
    }
}

// Run the migration
updateStudentRecords().then(() => {
    console.log('Student records update process completed.');
}).catch(err => {
    console.error('Unhandled error in student records update:', err);
}); 
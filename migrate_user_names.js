// migrate_user_names.js
// Script to migrate from username/full_name to first_name/last_name

const fs = require('fs');
const path = require('path');
const { pool, query } = require('./config/database');

async function migrateUserNames() {
    try {
        console.log('Starting user name field migration...');
        
        // First check if we need to migrate
        const checkColumns = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('username', 'full_name', 'first_name', 'last_name')
        `);

        const columns = checkColumns.rows.map(row => row.column_name);
        
        if (!columns.includes('username') || !columns.includes('full_name')) {
            console.log('Migration not needed: username or full_name columns not found.');
            return;
        }
        
        if (columns.includes('first_name') && columns.includes('last_name')) {
            console.log('Migration not needed: first_name and last_name columns already exist.');
            return;
        }
        
        console.log('Backing up users table before migration...');
        await query('CREATE TABLE users_backup AS SELECT * FROM users');
        console.log('Backup created as users_backup table.');
        
        // Read the migration SQL
        const migrationPath = path.join(__dirname, 'db', 'migrate_users.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split SQL into statements
        const statements = migrationSQL.split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);
        
        // Execute each statement
        for (const statement of statements) {
            if (statement.toLowerCase().includes('select')) {
                // For SELECT statements, print the results
                const result = await query(statement);
                console.log('Verification results:');
                console.table(result.rows);
            } else {
                // For other statements, just execute
                await query(statement);
                console.log(`Executed: ${statement.substring(0, 50)}...`);
            }
        }
        
        console.log('Migration completed successfully.');
        console.log('Old data backed up in users_backup table.');
        
    } catch (error) {
        console.error('Migration failed:', error);
        console.log('Attempting to restore from backup...');
        
        try {
            // Check if backup exists
            const backupCheck = await query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'users_backup'
                )
            `);
            
            if (backupCheck.rows[0].exists) {
                // Drop the current users table if it exists
                await query('DROP TABLE IF EXISTS users');
                
                // Restore from backup
                await query('CREATE TABLE users AS SELECT * FROM users_backup');
                console.log('Restored users table from backup.');
            } else {
                console.error('No backup found for restoration.');
            }
        } catch (restoreError) {
            console.error('Restoration failed:', restoreError);
        }
    } finally {
        // Close pool connection
        await pool.end();
    }
}

// Run the migration
migrateUserNames().then(() => {
    console.log('Migration process completed.');
}).catch(err => {
    console.error('Unhandled error in migration:', err);
}); 
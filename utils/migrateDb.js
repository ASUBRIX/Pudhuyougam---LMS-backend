const fs = require('fs');
const path = require('path');
const { pool, query } = require('../config/database');

// Function to run migration files
async function runMigration(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running migration: ${path.basename(filePath)}`);
    await query(sql);
    console.log(`Migration successful: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`Migration failed for ${path.basename(filePath)}:`, error);
    return false;
  }
}

// Function to run all migrations in the migrations folder
async function runAllMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir);
    
    // Sort files to ensure they run in order (if they have numbered prefixes)
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration file(s) to process`);
    
    // Run each migration file
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const success = await runMigration(filePath);
      
      if (!success) {
        console.error(`Stopping migrations due to failure in file: ${file}`);
        process.exit(1);
      }
    }
    
    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runAllMigrations();
}

module.exports = {
  runMigration,
  runAllMigrations
}; 
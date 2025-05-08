// simpleBannerTest.js - Minimal test script to diagnose loading issues
console.log('Starting test...');

try {
  console.log('Loading dotenv...');
  require('dotenv').config();
  console.log('✓ dotenv loaded');
  
  console.log('Loading app...');
  const app = require('./app');
  console.log('✓ app loaded');
  
  console.log('Loading database...');
  const { pool } = require('./config/database');
  console.log('✓ database loaded');
  
  console.log('Test complete! All modules loaded successfully.');
  
  // Clean up
  async function cleanup() {
    console.log('Closing database connection...');
    await pool.end();
    console.log('✓ Database connection closed');
  }
  
  // Run cleanup
  cleanup().catch(err => {
    console.error('Error during cleanup:', err.message);
  });
  
} catch (err) {
  console.error('Error:', err.message);
  console.error(err.stack);
} 
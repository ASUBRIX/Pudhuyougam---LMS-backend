const { Pool } = require('pg');
require('dotenv').config();

// Debug logging to see what environment variables are being used
console.log('🔧 Database Environment Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_USER: process.env.NODE_ENV === 'production' ? process.env.DB_USER : process.env.DB_LOCAL_USER,
  DB_HOST: process.env.NODE_ENV === 'production' ? process.env.DB_HOST : process.env.DB_LOCAL_HOST,
  DB_NAME: process.env.NODE_ENV === 'production' ? process.env.DB_NAME : process.env.DB_LOCAL_NAME,
  DB_PORT: process.env.DB_PORT,
  DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
  DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden for security)' : 'NOT SET'
});

// Additional debug: Show the exact DATABASE_URL (temporarily)
if (process.env.DATABASE_URL) {
  console.log('🔍 DATABASE_URL Check:', {
    length: process.env.DATABASE_URL.length,
    starts_with: process.env.DATABASE_URL.substring(0, 20),
    contains_hostname: process.env.DATABASE_URL.includes('dpg-d1clde6r433s73fu9sj0-a')
  });
}

// Updated pool configuration with better error handling
const pool = new Pool({
  // Option 1: Use DATABASE_URL if available (recommended for production)
  ...(process.env.DATABASE_URL ? 
    { connectionString: process.env.DATABASE_URL } : 
    {
      user: process.env.NODE_ENV === 'production' ? process.env.DB_USER : process.env.DB_LOCAL_USER,
      host: process.env.NODE_ENV === 'production' ? process.env.DB_HOST : process.env.DB_LOCAL_HOST,
      database: process.env.NODE_ENV === 'production' ? process.env.DB_NAME : process.env.DB_LOCAL_NAME,
      password: process.env.NODE_ENV === 'production' ? process.env.DB_PASSWORD : process.env.DB_LOCAL_PASSWORD,
    }
  ),
  port: process.env.DB_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Simple query with better error handling
async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('🚨 Database Query Error:', {
      query: text,
      params: params,
      error: error.message
    });
    throw error;
  }
}

// Transaction wrapper with enhanced error handling
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('🚨 Transaction Error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Enhanced connection test with detailed logging
pool.connect()
  .then(client => {
    console.log('✅ Database connection successful');
    return client
      .query('SELECT NOW() as current_time, current_database() as database_name, current_user as user_name')
      .then(res => {
        console.log('✅ Database Info:', {
          connected_at: res.rows[0].current_time,
          database: res.rows[0].database_name,
          user: res.rows[0].user_name
        });
        client.release();
      })
      .catch(err => {
        client.release();
        console.error('🚨 Database test query failed:', err.message);
        console.error('🚨 Full error:', err.stack);
      });
  })
  .catch(err => {
    console.error('🚨 Database connection failed:', {
      message: err.message,
      code: err.code,
      detail: err.detail
    });
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Received SIGTERM, closing database pool...');
  pool.end(() => {
    console.log('✅ Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Received SIGINT, closing database pool...');
  pool.end(() => {
    console.log('✅ Database pool closed');
    process.exit(0);
  });
});

module.exports = {
  query,
  withTransaction,
  pool,
};
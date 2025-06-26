const { Pool } = require('pg');
require('dotenv').config();

// Updated pool configuration for Hostinger VPS with Docker
const pool = new Pool({
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
  connectionTimeoutMillis: 10000,
  // Fixed SSL configuration for Docker PostgreSQL on VPS
  ssl: process.env.PGSSLMODE === 'disable' ? false : 
       (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) ? false :
       process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL ? false : 
       process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Simple query with error handling
async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

// Transaction wrapper with error handling
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    console.error('Transaction error:', err.message);
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Connection test with better logging
pool.connect()
  .then(client => {
    return client
      .query('SELECT NOW() as current_time')
      .then((result) => {
        console.log("✅ DB Connected successfully");
        console.log(`📊 Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
        console.log(`🔒 SSL Mode: ${pool.options.ssl ? 'enabled' : 'disabled'}`);
        client.release();
      })
      .catch(err => {
        client.release();
        throw err;
      });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('🔧 Check your database configuration and ensure PostgreSQL is running');
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Gracefully shutting down database connections...');
  pool.end(() => {
    console.log('✅ Database connections closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Gracefully shutting down database connections...');
  pool.end(() => {
    console.log('✅ Database connections closed');
    process.exit(0);
  });
});

module.exports = {
  query,
  withTransaction,
  pool,
};
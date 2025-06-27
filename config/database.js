const { Pool } = require('pg');
require('dotenv').config();


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

// Connection test
pool.connect()
  .then(client => {
    console.log("DB Connected");
    
    return client
      .query('SELECT NOW() as current_time')
      .then(() => {
        client.release();
      })
      .catch(err => {
        client.release();
        throw err;
      });
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  pool.end(() => {
    process.exit(0);
  });
});

module.exports = {
  query,
  withTransaction,
  pool,
};
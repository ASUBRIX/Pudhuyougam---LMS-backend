const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.NODE_ENV === 'production' ? process.env.DB_USER : process.env.DB_LOCAL_USER,
  host: process.env.NODE_ENV === 'production' ? process.env.DB_HOST : process.env.DB_LOCAL_HOST,
  database: process.env.NODE_ENV === 'production' ? process.env.DB_NAME : process.env.DB_LOCAL_NAME,
  password: process.env.NODE_ENV === 'production' ? process.env.DB_PASSWORD : process.env.DB_LOCAL_PASSWORD,
  port: process.env.DB_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Simple query
async function query(text, params) {
  return pool.query(text, params);
}

// Transaction wrapper
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Initial connection test
pool.connect()
  .then(client => {
    return client
      .query('SELECT NOW()')
      .then(res => {
        console.log(`DB Connected`);
        client.release();
      })
      .catch(err => {
        client.release();
        console.error('Error during initial DB test query:', err.stack);
      });
  })
  .catch(err => {
    console.error('DB connection error');
  });

module.exports = {
  query,
  withTransaction,
  pool,
};

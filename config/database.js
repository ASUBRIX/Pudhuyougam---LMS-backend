const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user:
    process.env.NODE_ENV == "production"
      ? process.env.DB_USER
      : process.env.DB_LOCAL_USER,
  host:
    process.env.NODE_ENV == "production"
      ? process.env.DB_HOST
      : process.env.DB_LOCAL_HOST,
  database:
    process.env.NODE_ENV == "production"
      ? process.env.DB_NAME
      : process.env.DB_LOCAL_NAME,
  password:
    process.env.NODE_ENV == "production"
      ? process.env.DB_PASSWORD
      : process.env.DB_LOCAL_PASSWORD,
  port: process.env.DB_PORT || 5432,
  max: process.env.DB_MAX_CONNECTIONS || 10, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  retryDelay: 1000,
  maxRetryAttempts: 3,
});

pool.connect().then(() => {
  console.log("Connected to PostgreSQL");
});
// Test the connection
// pool.on("connect", () => {
//   console.log("Connected to PostgreSQL database");
// });

// Handle connection errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Helper function to execute queries with proper error handling and connection release
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};

// Export the pool and query function
module.exports = {
  query,
  pool,
  // connect
};



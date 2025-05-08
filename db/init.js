// db/init.js

const { Pool } = require('pg');
require('dotenv').config();

async function initializeDatabase() {
    // First connect to postgres database to create lms database
    const pgPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

    try {
        // Create database if it doesn't exist
        await pgPool.query(`
            CREATE DATABASE lms
            WITH 
            OWNER = postgres
            ENCODING = 'UTF8'
            TEMPLATE template0
            CONNECTION LIMIT = -1;
        `);
        console.log('Created lms database');
    } catch (error) {
        if (error.code !== '42P04') { // 42P04 is the error code when database already exists
            console.error('Error creating database:', error);
        } else {
            console.log('Database lms already exists');
        }
    }

    // Close postgres connection
    await pgPool.end();

    // Connect to lms database
    const lmsPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'lms',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

    try {
        // Read and execute the schema
        const fs = require('fs');
        const path = require('path');
        const schema = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        await lmsPool.query(schema);
        console.log('Schema initialized successfully');
    } catch (error) {
        console.error('Error initializing schema:', error);
    } finally {
        await lmsPool.end();
    }
}

initializeDatabase();

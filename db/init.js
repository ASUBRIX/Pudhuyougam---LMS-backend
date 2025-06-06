const { Pool } = require('pg');
require('dotenv').config();

const TARGET_DB = process.env.DB_NAME || 'lms_db';

async function initializeDatabase() {
    // 1. Connect to 'postgres' database to create the TARGET_DB if not exists
    const pgPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

    try {
        await pgPool.query(`
            CREATE DATABASE ${TARGET_DB}
            WITH 
            OWNER = postgres
            ENCODING = 'UTF8'
            TEMPLATE template0
            CONNECTION LIMIT = -1;
        `);
        console.log(`Created ${TARGET_DB} database`);
    } catch (error) {
        if (error.code !== '42P04') { // 42P04 means database already exists
            console.error(`Error creating database:`, error);
        } else {
            console.log(`Database ${TARGET_DB} already exists`);
        }
    }

    await pgPool.end();

    // 2. Connect to the TARGET_DB to initialize schema
    const lmsDbPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: TARGET_DB,
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

    try {
        const fs = require('fs');
        const path = require('path');
        const schema = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        await lmsDbPool.query(schema);
        console.log('Schema initialized successfully');
    } catch (error) {
        console.error('Error initializing schema:', error);
    } finally {
        await lmsDbPool.end();
    }
}

initializeDatabase();

// createAdmin.js

require('dotenv').config();
const { pool } = require('./config/database');
const crypto = require('crypto');

async function createAdminUser() {
    try {
        console.log('Creating admin user...');
        
        // Hash the password
        const password = 'admin123';
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        
        // Check if the user already exists
        const checkQuery = 'SELECT * FROM users WHERE email = $1';
        const checkResult = await pool.query(checkQuery, ['admin@example.com']);
        
        if (checkResult.rows.length > 0) {
            console.log('Admin user already exists');
            return;
        }
        
        // Create the admin user
        const insertQuery = `
            INSERT INTO users (
                username, email, password_hash, phone_number, full_name, role
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, username, email, role`;
        
        const values = [
            'admin',
            'admin@example.com',
            hash,
            '1234567890',
            'Admin User',
            'admin'
        ];
        
        const result = await pool.query(insertQuery, values);
        console.log('Admin user created successfully:', result.rows[0]);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        // Close the pool
        pool.end();
    }
}

// Run the function
createAdminUser(); 
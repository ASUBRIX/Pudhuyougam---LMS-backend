// utils/auth.js

const pool = require('../config/database');
const crypto = require('crypto');

// Generate a random auth key
const generateAuthKey = async () => {
    const authKey = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create a test admin user if not exists
    const createUserQuery = `
        INSERT INTO users (first_name, last_name, email, role, auth_key, auth_key_expires)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO UPDATE
        SET auth_key = $5, auth_key_expires = $6
        RETURNING auth_key`;

    const values = [
        'Test',
        'Admin',
        'testadmin@example.com',
        'admin',
        authKey,
        expiresAt
    ];

    try {
        const result = await pool.query(createUserQuery, values);
        return result.rows[0].auth_key;
    } catch (error) {
        console.error('Error generating auth key:', error);
        throw error;
    }
};

module.exports = {
    generateAuthKey
};

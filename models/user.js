// models/user.js

const { pool, query } = require('../config/database');
const crypto = require('crypto');

class User {
    static async findAll() {
        try {
            const result = await query('SELECT id, first_name, last_name, email, phone_number, role, created_at FROM users ORDER BY id');
            return result.rows;
        } catch (error) {
            console.error('Error finding all users:', error);
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const result = await query('SELECT id, first_name, last_name, email, phone_number, role, created_at FROM users WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            console.error(`Error finding user by ID ${id}:`, error);
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const result = await query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0];
        } catch (error) {
            console.error(`Error finding user by email ${email}:`, error);
            throw error;
        }
    }

    // Find user by phone number
    static async findByPhone(phone_number) {
        try {
            const result = await query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
            return result.rows[0];
        } catch (error) {
            console.error(`Error finding user by phone ${phone_number}:`, error);
            throw error;
        }
    }

    // Create new user
    static async create({ first_name, last_name, email, password_hash, phone_number, role }) {
        try {
            const result = await query(
                'INSERT INTO users (first_name, last_name, email, password_hash, phone_number, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [first_name, last_name, email, password_hash, phone_number, role]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Update user
    static async update(id, { first_name, last_name, email, phone_number, role }) {
        try {
            const result = await query(
                'UPDATE users SET first_name = $1, last_name = $2, email = $3, phone_number = $4, role = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
                [first_name, last_name, email, phone_number, role, id]
            );
            return result.rows[0];
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw error;
        }
    }

    // Delete user
    static async delete(id) {
        try {
            await query('DELETE FROM users WHERE id = $1', [id]);
            return true;
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw error;
        }
    }

    // Generate OTP
    static async generateOTP(phone_number) {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
            const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

            await query(
                'UPDATE users SET otp = $1, otp_expires = $2 WHERE phone_number = $3',
                [otp, otp_expires, phone_number]
            );

            return otp;
        } catch (error) {
            console.error(`Error generating OTP for phone ${phone_number}:`, error);
            throw error;
        }
    }

    // Verify OTP
    static async verifyOTP(phone_number, otp) {
        try {
            const result = await query(
                'SELECT * FROM users WHERE phone_number = $1 AND otp = $2 AND otp_expires > CURRENT_TIMESTAMP',
                [phone_number, otp]
            );

            if (result.rows.length === 0) {
                return null;
            }

            // Generate auth key
            const auth_key = crypto.randomBytes(32).toString('hex');
            const auth_key_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Clear OTP and set auth key
            await query(
                'UPDATE users SET otp = NULL, otp_expires = NULL, auth_key = $1, auth_key_expires = $2 WHERE phone_number = $3',
                [auth_key, auth_key_expires, phone_number]
            );

            return { auth_key, user: result.rows[0] };
        } catch (error) {
            console.error(`Error verifying OTP for phone ${phone_number}:`, error);
            throw error;
        }
    }

    // Verify email/password and generate auth key
    static async verifyEmailPassword(email, password_hash) {
        try {
            const result = await query(
                'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
                [email, password_hash]
            );

            if (result.rows.length === 0) {
                return null;
            }

            // Generate auth key
            const auth_key = crypto.randomBytes(32).toString('hex');
            const auth_key_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Update auth key
            await query(
                'UPDATE users SET auth_key = $1, auth_key_expires = $2 WHERE email = $3',
                [auth_key, auth_key_expires, email]
            );

            // Get updated user
            const updatedUser = await query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            return { auth_key, user: updatedUser.rows[0] };
        } catch (error) {
            console.error(`Error verifying email/password for ${email}:`, error);
            throw error;
        }
    }

    // Logout - clear auth key
    static async logout(userId) {
        try {
            await query(
                'UPDATE users SET auth_key = NULL, auth_key_expires = NULL WHERE id = $1',
                [userId]
            );
            return true;
        } catch (error) {
            console.error(`Error logging out user ${userId}:`, error);
            throw error;
        }
    }
}

module.exports = User;

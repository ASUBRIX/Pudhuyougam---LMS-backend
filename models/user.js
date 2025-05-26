const { query } = require('../config/database');
const crypto = require('crypto');

class User {
    static async findAll() {
        const result = await query('SELECT id, first_name, last_name, email, phone_number, role, created_at FROM users ORDER BY id');
        return result.rows;
    }

    static async findById(id) {
        const result = await query('SELECT id, first_name, last_name, email, phone_number, role, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async findByPhone(phone_number) {
        const result = await query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
        return result.rows[0];
    }

    static async create({ first_name, last_name, email, password_hash, phone_number, role }) {
        const result = await query(
            'INSERT INTO users (first_name, last_name, email, password_hash, phone_number, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [first_name, last_name, email, password_hash, phone_number, role]
        );
        return result.rows[0];
    }

    static async update(id, { first_name, last_name, email, phone_number, role }) {
        const result = await query(
            'UPDATE users SET first_name = $1, last_name = $2, email = $3, phone_number = $4, role = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [first_name, last_name, email, phone_number, role, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await query('DELETE FROM users WHERE id = $1', [id]);
        return true;
    }

    static async generateOTP(phone_number) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_expires = new Date(Date.now() + 10 * 60 * 1000);
        await query(
            'UPDATE users SET otp = $1, otp_expires = $2 WHERE phone_number = $3',
            [otp, otp_expires, phone_number]
        );
        return otp;
    }

    static async verifyOTP(phone_number, otp) {
        const result = await query(
            'SELECT * FROM users WHERE phone_number = $1 AND otp = $2 AND otp_expires > CURRENT_TIMESTAMP',
            [phone_number, otp]
        );
        if (result.rows.length === 0) return null;
        const auth_key = crypto.randomBytes(32).toString('hex');
        const auth_key_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await query(
            'UPDATE users SET otp = NULL, otp_expires = NULL, auth_key = $1, auth_key_expires = $2 WHERE phone_number = $3',
            [auth_key, auth_key_expires, phone_number]
        );
        return { auth_key, user: result.rows[0] };
    }

    static async verifyEmailPassword(email, password_hash) {
        const result = await query(
            'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
            [email, password_hash]
        );
        if (result.rows.length === 0) return null;
        const auth_key = crypto.randomBytes(32).toString('hex');
        const auth_key_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await query(
            'UPDATE users SET auth_key = $1, auth_key_expires = $2 WHERE email = $3',
            [auth_key, auth_key_expires, email]
        );
        const updatedUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        return { auth_key, user: updatedUser.rows[0] };
    }

    static async logout(userId) {
        await query('UPDATE users SET auth_key = NULL, auth_key_expires = NULL WHERE id = $1', [userId]);
        return true;
    }
}

module.exports = User;

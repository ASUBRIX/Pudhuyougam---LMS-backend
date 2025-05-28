const { query } = require('../config/database');
const crypto = require('crypto');
global.otpStore = global.otpStore || new Map();

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
    console.log("generate otp");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000);

    // Check if user exists
    let result = await query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
    if (result.rows.length === 0) {
        // Store OTP in separate user_otps table for registration
        await query(
          `INSERT INTO user_otps (phone_number, otp, otp_expires)
           VALUES ($1, $2, $3)
           ON CONFLICT (phone_number) DO UPDATE
           SET otp = $2, otp_expires = $3`,
          [phone_number, otp, otp_expires]
        );
    } else {
        // Existing user: store OTP in users table for login
        await query(
          'UPDATE users SET otp = $1, otp_expires = $2 WHERE phone_number = $3',
          [otp, otp_expires, phone_number]
        );
    }
    return otp;
}



static async verifyOTP(phone_number, otp) {
    // First, check in users table (existing user)
    let result = await query(
      'SELECT * FROM users WHERE phone_number = $1 AND otp = $2 AND otp_expires > CURRENT_TIMESTAMP',
      [phone_number, otp]
    );
    if (result.rows.length > 0) {
        // Login, clear OTP fields as before
        const auth_key = crypto.randomBytes(32).toString('hex');
        const auth_key_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await query(
          'UPDATE users SET otp = NULL, otp_expires = NULL, auth_key = $1, auth_key_expires = $2 WHERE phone_number = $3',
          [auth_key, auth_key_expires, phone_number]
        );
        return { auth_key, user: result.rows[0] };
    }
    // Next, check in user_otps table (registration)
    let otpResult = await query(
      'SELECT * FROM user_otps WHERE phone_number = $1 AND otp = $2 AND otp_expires > CURRENT_TIMESTAMP',
      [phone_number, otp]
    );
    if (otpResult.rows.length > 0) {
        // Valid for registration
        // Optionally, delete OTP after use:
        await query('DELETE FROM user_otps WHERE phone_number = $1', [phone_number]);
        return { exists: false, phone_number };
    }
    return null;
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

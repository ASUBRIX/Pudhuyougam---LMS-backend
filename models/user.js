const { query } = require("../config/database");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_fallback";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_fallback";
global.otpStore = global.otpStore || new Map();

class User {
  static async findAll() {
    const result = await query(
      "SELECT id, first_name, last_name, email, phone_number, role, created_at FROM users ORDER BY id"
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      "SELECT id, first_name, last_name, email, phone_number, role, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  }

  static async findByPhone(phone_number) {
    const result = await query("SELECT * FROM users WHERE phone_number = $1", [
      phone_number,
    ]);
    return result.rows[0];
  }

  static async create({
    first_name,
    last_name,
    email,
    password_hash,
    phone_number,
    role,
  }) {
    const result = await query(
      "INSERT INTO users (first_name, last_name, email, password_hash, phone_number, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [first_name, last_name, email, password_hash, phone_number, role]
    );
    return result.rows[0];
  }

  static async update(
    id,
    { first_name, last_name, email, phone_number, role }
  ) {
    const result = await query(
      "UPDATE users SET first_name = $1, last_name = $2, email = $3, phone_number = $4, role = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
      [first_name, last_name, email, phone_number, role, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await query("DELETE FROM users WHERE id = $1", [id]);
    return true;
  }

  static async generateOTP(phone_number) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000);

    let result = await query("SELECT * FROM users WHERE phone_number = $1", [
      phone_number,
    ]);
    if (result.rows.length === 0) {
      await query(
        `INSERT INTO user_otps (phone_number, otp, otp_expires)
                VALUES ($1, $2, $3)
                ON CONFLICT (phone_number) DO UPDATE
                SET otp = $2, otp_expires = $3`,
        [phone_number, otp, otp_expires]
      );
    } else {
      await query(
        "UPDATE users SET otp = $1, otp_expires = $2 WHERE phone_number = $3",
        [otp, otp_expires, phone_number]
      );
    }
    return otp;
  }

  static async verifyOTP(phone_number, otp) {
    // Check in users table (existing user)
    let result = await query(
      "SELECT * FROM users WHERE phone_number = $1 AND otp = $2 AND otp_expires > CURRENT_TIMESTAMP",
      [phone_number, otp]
    );
    if (result.rows.length > 0) {
      // Clear OTP
      await query(
        "UPDATE users SET otp = NULL, otp_expires = NULL WHERE phone_number = $1",
        [phone_number]
      );
      return { user: result.rows[0] };
    }
    // Check in user_otps table (registration)
    let otpResult = await query(
      "SELECT * FROM user_otps WHERE phone_number = $1 AND otp = $2 AND otp_expires > CURRENT_TIMESTAMP",
      [phone_number, otp]
    );
    if (otpResult.rows.length > 0) {
      await query("DELETE FROM user_otps WHERE phone_number = $1", [
        phone_number,
      ]);
      return { exists: false, phone_number };
    }
    return null;
  }

  static async verifyEmailPassword(email, password_hash) {
    const result = await query(
      "SELECT * FROM users WHERE email = $1 AND password_hash = $2",
      [email, password_hash]
    );
    if (result.rows.length === 0) return null;
    return { user: result.rows[0] };
  }

  static async logout(userId) {
    // With JWT, logout is handled on client (token removal), but you can blacklist if needed
    return true;
  }

  // Generate access token (short-lived)
  static generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role, phone_number: user.phone_number },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );
  }

  // Generate refresh token (long-lived)
  static generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role, phone_number: user.phone_number },
      JWT_REFRESH_SECRET,
      { expiresIn: "15d" }
    );
  }
}

module.exports = User;

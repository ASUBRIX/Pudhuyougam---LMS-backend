const { query } = require("../config/database");
const jwt = require("jsonwebtoken");

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "mySecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "mySecret";

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
    const result = await query("SELECT * FROM users WHERE phone_number = $1", [phone_number]);
    return result.rows[0];
  }

  static async create({ first_name, last_name, email, phone_number, role }) {
    const result = await query(
      "INSERT INTO users (first_name, last_name, email, phone_number, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [first_name, last_name, email, phone_number, role]
    );
    return result.rows[0];
  }

  static async update(id, { first_name, last_name, email, phone_number, role }) {
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


  static async verifyEmailPassword(email, plainPassword) {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return null;
    if (user.password_hash !== plainPassword) return null;

    return { user };
  }

    static generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role, phone_number: user.phone_number },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );
  }

  static generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role, phone_number: user.phone_number },
      JWT_REFRESH_SECRET,
      { expiresIn: "15d" }
    );
  }
}

module.exports = User;

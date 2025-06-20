const { query } = require('../config/database');

class Student {

  static async create(data) {
  console.log("Creating student with data:", data);
  const sql = `
    INSERT INTO students (
      user_id, first_name, last_name, email, phone,
      enrollment_date, status, program, enrollment_id, profile_picture
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;
  const values = [
    data.userId,
    data.firstName,
    data.lastName,
    data.email,
    data.phone,
    data.enrollmentDate || new Date(),
    data.status || 'active',
    data.program || '',
    data.enrollmentId || null,
    data.profile_picture || null 
  ];
  const result = await query(sql, values);
  return result.rows[0];
}
  static async update(id, data) {
    const sql = `
      UPDATE students SET
        user_id = $1,
        first_name = $2,
        last_name = $3,
        email = $4,
        phone = $5,
        enrollment_date = $6,
        status = $7,
        program = $8,
        enrollment_id = $9,
        profile_picture = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *;
    `;
    const values = [
      data.userId,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.enrollmentDate || new Date(),
      data.status || 'active',
      data.program || '',
      data.enrollmentId || null,
      data.profile_picture || null,
      id
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query('SELECT * FROM students ORDER BY created_at DESC');
    return result.rows;
  }

  static async findByPk(id) {
    const result = await query('SELECT * FROM students WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await query('SELECT * FROM students WHERE user_id = $1', [userId]);
    return result.rows[0];
  }

  static async findByPhone(phone) {
    const result = await query('SELECT * FROM students WHERE phone = $1', [phone]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query('SELECT * FROM students WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async destroy(id) {
    const result = await query('DELETE FROM students WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

module.exports = Student;
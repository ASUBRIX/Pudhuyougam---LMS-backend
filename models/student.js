// models/Student.js
const { query } = require("../config/database");

class Student {
  static async create(data) {
    const sqlQuery = `
      INSERT INTO students (
        user_id, first_name, last_name, email, phone,
        enrollment_date, status, program, semester, year,
        courses, profile_picture
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      data.userId,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.enrollmentDate,
      data.status || 'active',
      data.program || '',
      data.semester || '',
      data.year || '',
      data.courses || null,
      data.profile_picture || null
    ];
    const result = await query(sqlQuery, values);
    return result.rows[0];
  }

  static async update(id, data) {
    const sqlQuery = `
      UPDATE students
      SET user_id = $1,
          first_name = $2,
          last_name = $3,
          email = $4,
          phone = $5,
          enrollment_date = $6,
          status = $7,
          program = $8,
          semester = $9,
          year = $10,
          courses = $11,
          profile_picture = $12,
          enrollment_id = $13,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `;
    const values = [
      data.userId,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.enrollmentDate,
      data.status,
      data.program,
      data.semester,
      data.year,
      data.courses,
      data.profile_picture || null,
      data.enrollmentId || null,
      id
    ];
    const result = await query(sqlQuery, values);
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

  static async destroy(id) {
    const result = await query('DELETE FROM students WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

module.exports = Student;

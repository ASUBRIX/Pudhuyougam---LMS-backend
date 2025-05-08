const { pool, query } = require('../config/database');
const crypto = require('crypto');

class Student {
    static async create(data) {
        const id = `STU${Math.floor(Math.random() * 900000) + 100000}`;
        const sqlQuery = `
            INSERT INTO students (
                id, user_id, first_name, last_name, email, phone, 
                enrollment_date, status, about, 
                education, profile_picture
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`;

        console.log('Creating student with query:', sqlQuery);
        console.log('Creating student with data:', data);
            
        // Ensure education is properly converted to JSON string
        let educationJson = null;
        if (data.education) {
            try {
                // If it's already a string, we'll use it directly
                if (typeof data.education === 'string') {
                    educationJson = data.education;
                } else {
                    // Otherwise, stringify it
                    educationJson = JSON.stringify(data.education);
                }
            } catch (err) {
                console.error('Error stringifying education data:', err);
            }
        }

        const values = [
            id,
            data.userId,
            data.firstName,
            data.lastName,
            data.email,
            data.phone,
            data.enrollmentDate,
            data.status || 'active',
            data.about,
            educationJson,
            data.profilePicture
        ];

        console.log('Values for query:', values);

        try {
            // Use our improved query function instead of direct pool access
            const result = await query(sqlQuery, values);
            return result.rows[0];
        } catch (err) {
            console.error('Database error creating student:', err);
            throw err;
        }
    }

    static async findAll(options = {}) {
        let sqlQuery = 'SELECT * FROM students';
        const values = [];
        const conditions = [];

        if (options.search) {
            values.push(`%${options.search}%`);
            conditions.push(`(
                first_name ILIKE $${values.length} OR 
                last_name ILIKE $${values.length} OR 
                email ILIKE $${values.length} OR 
                id ILIKE $${values.length}
            )`);
        }

        if (options.fromDate && options.toDate) {
            values.push(options.fromDate, options.toDate);
            conditions.push(`enrollment_date BETWEEN $${values.length - 1} AND $${values.length}`);
        }

        if (conditions.length > 0) {
            sqlQuery += ' WHERE ' + conditions.join(' AND ');
        }

        if (options.sortBy) {
            switch (options.sortBy) {
                case 'newest':
                    sqlQuery += ' ORDER BY enrollment_date DESC';
                    break;
                case 'oldest':
                    sqlQuery += ' ORDER BY enrollment_date ASC';
                    break;
                case 'name':
                    sqlQuery += ' ORDER BY first_name ASC, last_name ASC';
                    break;
                case 'status':
                    sqlQuery += ' ORDER BY status ASC';
                    break;
                default:
                    sqlQuery += ' ORDER BY created_at DESC';
            }
        } else {
            sqlQuery += ' ORDER BY created_at DESC';
        }

        try {
            const result = await query(sqlQuery, values);
            return result.rows;
        } catch (err) {
            console.error('Database error finding students:', err);
            throw err;
        }
    }

    static async findByPk(id) {
        try {
            const sqlQuery = 'SELECT * FROM students WHERE id = $1';
            const result = await query(sqlQuery, [id]);
            return result.rows[0];
        } catch (err) {
            console.error('Database error finding student by ID:', err);
            throw err;
        }
    }

    static async findByUserId(userId) {
        try {
            const sqlQuery = 'SELECT * FROM students WHERE user_id = $1';
            const result = await query(sqlQuery, [userId]);
            return result.rows[0];
        } catch (err) {
            console.error('Database error finding student by user ID:', err);
            throw err;
        }
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
                about = $8, 
                education = $9,
                profile_picture = $10,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $11
            RETURNING *`;

        console.log('Updating student with data:', data);
            
        // Ensure education is properly converted to JSON string
        let educationJson = null;
        if (data.education) {
            try {
                // If it's already a string, we'll use it directly
                if (typeof data.education === 'string') {
                    educationJson = data.education;
                } else {
                    // Otherwise, stringify it
                    educationJson = JSON.stringify(data.education);
                }
            } catch (err) {
                console.error('Error stringifying education data:', err);
            }
        }

        const values = [
            data.userId,
            data.firstName,
            data.lastName,
            data.email,
            data.phone,
            data.enrollmentDate,
            data.status,
            data.about,
            educationJson,
            data.profilePicture,
            id
        ];

        console.log('Values for update query:', values);

        try {
            const result = await query(sqlQuery, values);
            return result.rows[0];
        } catch (err) {
            console.error('Database error updating student:', err);
            throw err;
        }
    }

    static async destroy(id) {
        try {
            const sqlQuery = 'DELETE FROM students WHERE id = $1 RETURNING id';
            const result = await query(sqlQuery, [id]);
            return result.rows[0];
        } catch (err) {
            console.error('Database error deleting student:', err);
            throw err;
        }
    }

    static async count(where = {}) {
        try {
            let sqlQuery = 'SELECT COUNT(*) FROM students';
            const values = [];

            if (where.status) {
                values.push(where.status);
                sqlQuery += ' WHERE status = $1';
            }

            const result = await query(sqlQuery, values);
            return parseInt(result.rows[0].count);
        } catch (err) {
            console.error('Database error counting students:', err);
            throw err;
        }
    }
}

module.exports = Student;

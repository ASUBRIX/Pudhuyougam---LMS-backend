const { pool, query } = require('../config/database');

class Banner {
    // Get all banners with sorting
    static async findAll(sortBy = 'newest') {
        try {
            let orderClause;
            switch (sortBy) {
                case 'oldest':
                    orderClause = 'created_at ASC';
                    break;
                case 'title':
                    orderClause = 'title ASC';
                    break;
                case 'newest':
                default:
                    orderClause = 'created_at DESC';
                    break;
            }

            const result = await query(`
                SELECT id, title, image_url, link, description, created_at, updated_at
                FROM banners
                ORDER BY ${orderClause}
            `);
            
            return result.rows;
        } catch (error) {
            console.error('Error finding all banners:', error);
            throw error;
        }
    }

    // Find banner by ID
    static async findById(id) {
        try {
            const result = await query(
                'SELECT id, title, image_url, link, description, created_at, updated_at FROM banners WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error(`Error finding banner by ID ${id}:`, error);
            throw error;
        }
    }

    // Create new banner
    static async create({ title, image_url, link, description }) {
        try {
            const result = await query(
                'INSERT INTO banners (title, image_url, link, description) VALUES ($1, $2, $3, $4) RETURNING *',
                [title, image_url, link, description]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating banner:', error);
            throw error;
        }
    }

    // Update banner
    static async update(id, { title, image_url, link, description }) {
        try {
            // Build dynamic update query to handle optional image_url
            let updateFields = [];
            let queryParams = [];
            let paramCounter = 1;

            if (title !== undefined) {
                updateFields.push(`title = $${paramCounter++}`);
                queryParams.push(title);
            }
            
            if (image_url !== undefined) {
                updateFields.push(`image_url = $${paramCounter++}`);
                queryParams.push(image_url);
            }
            
            if (link !== undefined) {
                updateFields.push(`link = $${paramCounter++}`);
                queryParams.push(link);
            }
            
            if (description !== undefined) {
                updateFields.push(`description = $${paramCounter++}`);
                queryParams.push(description);
            }
            
            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            
            // Add id as the last parameter
            queryParams.push(id);
            
            const updateQuery = `
                UPDATE banners 
                SET ${updateFields.join(', ')} 
                WHERE id = $${paramCounter}
                RETURNING *
            `;
            
            const result = await query(updateQuery, queryParams);
            return result.rows[0];
        } catch (error) {
            console.error(`Error updating banner ${id}:`, error);
            throw error;
        }
    }

    // Delete banner
    static async delete(id) {
        try {
            const result = await query('DELETE FROM banners WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } catch (error) {
            console.error(`Error deleting banner ${id}:`, error);
            throw error;
        }
    }

    // Search banners
    static async search(searchTerm, sortBy = 'newest') {
        try {
            let orderClause;
            switch (sortBy) {
                case 'oldest':
                    orderClause = 'created_at ASC';
                    break;
                case 'title':
                    orderClause = 'title ASC';
                    break;
                case 'newest':
                default:
                    orderClause = 'created_at DESC';
                    break;
            }

            const result = await query(
                `SELECT id, title, image_url, link, description, created_at, updated_at
                FROM banners
                WHERE title ILIKE $1 OR description ILIKE $1
                ORDER BY ${orderClause}`,
                [`%${searchTerm}%`]
            );
            
            return result.rows;
        } catch (error) {
            console.error(`Error searching banners:`, error);
            throw error;
        }
    }

    // In models/user.js
static async generateOTP(phone_number) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000);

    // Check if user exists
    let user = await query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
    if (user.rows.length === 0) {
      // Create new temp user with just phone and otp
      await query(
        'INSERT INTO users (phone_number, otp, otp_expires, role) VALUES ($1, $2, $3, $4)',
        [phone_number, otp, otp_expires, 'student']
      );
    } else {
      // Update existing user OTP
      await query(
        'UPDATE users SET otp = $1, otp_expires = $2 WHERE phone_number = $3',
        [otp, otp_expires, phone_number]
      );
    }
    return otp;
  } catch (err) {
    console.error(`Error generating OTP for phone ${phone_number}:`, err);
    throw err;
  }
}


}

module.exports = Banner; 
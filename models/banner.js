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
}

module.exports = Banner; 
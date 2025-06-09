const { query } = require('../config/database');

class Setting {
    // Get all website settings
    static async getWebsiteSettings() {
        try {
            const result = await query('SELECT * FROM website_settings WHERE id = 1');
            
            return result.rows[0] || {};
        } catch (error) {
            console.error('Error fetching website settings:', error);
            throw error;
        }
    }

    
    // Update website settings
    static async updateWebsiteSettings(data) {
        try {
            // First check if settings exist
            const checkResult = await query('SELECT id FROM website_settings LIMIT 1');
            
            if (checkResult.rows.length === 0) {
                // If no settings exist, insert new row
                const fields = Object.keys(data);
                const values = Object.values(data);
                const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
                
                const insertQuery = `
                    INSERT INTO website_settings (${fields.join(', ')})
                    VALUES (${placeholders})
                    RETURNING *
                `;
                
                const insertResult = await query(insertQuery, values);
                return insertResult.rows[0];
            } else {
                // If settings exist, update them
                const id = checkResult.rows[0].id;
                const setClause = Object.keys(data)
                    .map((key, index) => `${key} = $${index + 1}`)
                    .join(', ');
                
                const updateQuery = `
                    UPDATE website_settings
                    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $${Object.keys(data).length + 1}
                    RETURNING *
                `;
                
                const values = [...Object.values(data), id];
                const updateResult = await query(updateQuery, values);
                return updateResult.rows[0];
            }
        } catch (error) {
            console.error('Error updating website settings:', error);
            throw error;
        }
    }
}

module.exports = Setting; 
// models/termsConditions.js
// new
const { query } = require('../config/database');

class TermsConditions {
    // Get terms and conditions
    static async getTerms() {
        const queryStr = 'SELECT * FROM terms_conditions WHERE is_active = true ORDER BY id DESC LIMIT 1';
        const result = await query(queryStr);
        return result.rows[0] || {};
    }

    // Get all terms and conditions versions
    static async getAllTerms() {
        const queryStr = 'SELECT * FROM terms_conditions ORDER BY created_at DESC';
        const result = await query(queryStr);
        return result.rows;
    }

    // Update terms and conditions
    static async updateTerms(content) {
        // Create a new version (setting old ones to inactive)
        await query('UPDATE terms_conditions SET is_active = false');
        
        const insertQuery = `
            INSERT INTO terms_conditions (content, is_active)
            VALUES ($1, true)
            RETURNING *
        `;
        
        const result = await query(insertQuery, [content]);
        return result.rows[0];
    }

    // Get privacy policy
    static async getPrivacyPolicy() {
        const queryStr = 'SELECT * FROM privacy_policy WHERE is_active = true ORDER BY id DESC LIMIT 1';
        const result = await query(queryStr);
        return result.rows[0] || {};
    }

    // Get all privacy policy versions
    static async getAllPrivacyPolicies() {
        const queryStr = 'SELECT * FROM privacy_policy ORDER BY created_at DESC';
        const result = await query(queryStr);
        return result.rows;
    }

    // Update privacy policy
    static async updatePrivacyPolicy(content) {
        // Create a new version (setting old ones to inactive)
        await query('UPDATE privacy_policy SET is_active = false');
        
        const insertQuery = `
            INSERT INTO privacy_policy (content, is_active)
            VALUES ($1, true)
            RETURNING *
        `;
        
        const result = await query(insertQuery, [content]);
        return result.rows[0];
    }
}

module.exports = TermsConditions; 
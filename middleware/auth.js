// middleware/auth.js

const { pool, query } = require('../config/database');

const auth = async (req, res, next) => {
    console.log('Auth middleware called');
    console.log('Headers received:', req.headers);
    const authKey = req.headers.auth_key;

    if (!authKey) {
        console.log('No auth_key found in headers');
        return res.status(401).json({ error: 'Auth key is required.', code: 'AUTH_REQUIRED' });
    }

    try {
        // Check if auth key exists and is valid in your users table
        const sqlQuery = `
            SELECT u.id, u.first_name, u.last_name, u.email, u.role
            FROM users u
            WHERE u.auth_key = $1 
            AND u.auth_key_expires > CURRENT_TIMESTAMP`;
        
        // Use the improved query function instead of direct pool access
        const result = await query(sqlQuery, [authKey]);

        if (result.rows.length === 0) {
            // Check if the auth key exists but is expired
            const checkExpiredQuery = `
                SELECT u.id 
                FROM users u 
                WHERE u.auth_key = $1 
                AND u.auth_key_expires <= CURRENT_TIMESTAMP`;
            
            const expiredResult = await query(checkExpiredQuery, [authKey]);
            
            if (expiredResult.rows.length > 0) {
                console.log('Auth key is expired');
                return res.status(401).json({ error: 'Auth key has expired. Please login again.', code: 'AUTH_EXPIRED' });
            } else {
                console.log('Auth key is invalid');
                return res.status(401).json({ error: 'Invalid Auth key.', code: 'AUTH_INVALID' });
            }
        }

        // Add user info to request object
        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = { auth, requireAdmin };
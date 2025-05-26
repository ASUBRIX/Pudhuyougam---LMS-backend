const { pool, query } = require('../config/database');

const isAuthDisabled = process.env.DISABLE_AUTH === 'true';

const auth = async (req, res, next) => {
    if (isAuthDisabled) {
        // Bypass authentication for development or local testing
        req.user = { id: 1, role: 'admin', first_name: 'Test', email: 'test@example.com' };
        return next();
    }

    const authKey = req.headers.auth_key;
    if (!authKey) {
        return res.status(401).json({ error: 'Auth key is required.', code: 'AUTH_REQUIRED' });
    }

    try {
        const sqlQuery = `
            SELECT u.id, u.first_name, u.last_name, u.email, u.role
            FROM users u
            WHERE u.auth_key = $1 
            AND u.auth_key_expires > CURRENT_TIMESTAMP`;
        const result = await query(sqlQuery, [authKey]);

        if (result.rows.length === 0) {
            // Check if the auth key is expired
            const expiredResult = await query(
                `SELECT u.id FROM users u WHERE u.auth_key = $1 AND u.auth_key_expires <= CURRENT_TIMESTAMP`,
                [authKey]
            );
            if (expiredResult.rows.length > 0) {
                return res.status(401).json({ error: 'Auth key has expired. Please login again.', code: 'AUTH_EXPIRED' });
            }
            return res.status(401).json({ error: 'Invalid Auth key.', code: 'AUTH_INVALID' });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};

const requireAdmin = (req, res, next) => {
    if (isAuthDisabled) {
        req.user = { role: 'admin' }; 
        return next();
    }
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = { auth, requireAdmin };

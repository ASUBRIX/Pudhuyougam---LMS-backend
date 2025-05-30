const jwt = require('jsonwebtoken');
const { pool, query } = require('../config/database');

// Crash if disabling auth in production (security!)
if (
  process.env.NODE_ENV === 'production' &&
  process.env.DISABLE_AUTH === 'true'
) {
  throw new Error(
    "FATAL: DISABLE_AUTH=true is NOT allowed in production! Fix your env variables."
  );
}

const isAuthDisabled = process.env.DISABLE_AUTH === 'true';
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'yoursecretkey';

/**
 * Auth middleware.
 * If auth is disabled, simulates a user.
 * Supports role simulation for easy testing.
 */
const auth = (req, res, next) => {
  if (isAuthDisabled) {
    // Simulate user/admin for dev via header or query (default: admin)
    const role = req.headers['x-dev-role'] || req.query.role || 'admin';
    const id = req.headers['x-dev-userid'] || req.query.userId || 1;
    req.user = {
      id,
      role,
      first_name: role === 'admin' ? 'Admin' : 'User',
      email: `${role}@test.com`,
    };
    return next();
  }

  // Real JWT auth for prod
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'JWT token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};

/**
 * Require admin middleware.
 * Allows admin in dev or real admin in prod.
 */
const requireAdmin = (req, res, next) => {
  // Should only be called after `auth` middleware
  if (!req.user || req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = { auth, requireAdmin };

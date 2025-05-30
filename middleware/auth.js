const jwt = require('jsonwebtoken');
const { pool, query } = require('../config/database');

const isAuthDisabled = process.env.DISABLE_AUTH === 'true';
const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || 'mySecret';

// Prevent disabling auth in production for safety!
if (isProd && isAuthDisabled) {
  throw new Error(
    "FATAL: DISABLE_AUTH=true is NOT allowed in production! Remove this from your .env."
  );
}

const auth = (req, res, next) => {
  if (isAuthDisabled) {
    // Simulate user (admin by default)
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

  // Standard JWT Auth (for production, and when not disabled)
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

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = { auth, requireAdmin };

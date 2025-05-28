const jwt = require('jsonwebtoken');
const { pool, query } = require('../config/database');

const isAuthDisabled = process.env.DISABLE_AUTH === 'true';
const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

const auth = (req, res, next) => {
  if (isAuthDisabled) {
    req.user = { id: 1, role: 'admin', first_name: 'Test', email: 'test@example.com' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'JWT token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
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

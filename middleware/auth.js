const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'mySecret';


const AUTH_ENABLED = process.env.AUTH_ENABLED !== 'false';
const ADMIN_ENABLED = process.env.ADMIN_ENABLED !== 'false';

const auth = (req, res, next) => {
  if (!AUTH_ENABLED) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'JWT token required.' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired access token.' });
  }
};


const requireAdmin = (req, res, next) => {
  if (!ADMIN_ENABLED) {
    return next();
  }

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = { auth, requireAdmin };

const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'ndwsd93er932rh02';

// Middleware to verify JWT and extract user ID
const verifyToken = (req, res, next) => {
  const { token } = req.cookies || {};
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, jwtSecret, {}, (err, userData) => {
    if (err) {
      console.log('JWT verification error:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.userId = userData.id;
    console.log('Debug - verifyToken middleware - extracted userId:', req.userId);
    console.log('Debug - verifyToken middleware - full userData:', userData);
    next();
  });
};

module.exports = { verifyToken };

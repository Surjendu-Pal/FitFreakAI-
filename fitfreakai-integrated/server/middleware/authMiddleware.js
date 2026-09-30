// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { getJWTSecret } = require('../config/auth');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, getJWTSecret());
    if (!decoded?.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Attach user to request
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { id: user._id.toString() };
    next();
  } catch (err) {
    if (err.status === 503) return next(err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;

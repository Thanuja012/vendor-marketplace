const jwt = require('jsonwebtoken');
const User = require('../models/User');
const response = require('../utils/response');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.error(res, 'Authentication required', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return response.error(res, 'User not found or inactive', 401);
    req.user = user;
    next();
  } catch {
    return response.error(res, 'Invalid or expired token', 401);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return response.error(res, 'Access denied', 403);
  }
  next();
};

module.exports = { authenticate, authorize };

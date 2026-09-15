const logger = require('../utils/logger');
const response = require('../utils/response');

const errorHandler = (err, req, res, _next) => {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message).join(', ');
    return response.error(res, messages, 422);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return response.error(res, `${field} already exists`, 409);
  }
  if (err.name === 'CastError') {
    return response.error(res, 'Invalid ID format', 400);
  }

  return response.error(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = errorHandler;

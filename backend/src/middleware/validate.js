const { validationResult } = require('express-validator');
const response = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(', ');
    return response.error(res, messages, 422);
  }
  next();
};

module.exports = validate;

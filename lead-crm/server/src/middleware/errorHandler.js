const env = require('../config/env');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value';
    details = err.keyValue;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  if (statusCode >= 500) {
    logger.error(err);
  }

  res.status(statusCode).json({
    error: message,
    details: details || undefined,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
}

module.exports = errorHandler;

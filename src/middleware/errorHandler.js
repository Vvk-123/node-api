'use strict';

const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const handleSequelizeValidationError = (err) => {
  const message = err.errors.map((e) => e.message).join('; ');
  return new AppError(message, 422);
};

const handleSequelizeUniqueConstraint = (err) => {
  const field = err.errors[0]?.path || 'field';
  return new AppError(`Duplicate value for '${field}'. Please use a different value.`, 409);
};

const handleSequelizeForeignKey = () =>
  new AppError('Referenced resource does not exist.', 400);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({ success: false, message: err.message });
  } else {
    logger.error('UNEXPECTED ERROR:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.errorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`[${req.id}] ${err.statusCode} - ${err.message}`);

  let error = err;
  if (err.name === 'SequelizeValidationError') error = handleSequelizeValidationError(err);
  if (err.name === 'SequelizeUniqueConstraintError') error = handleSequelizeUniqueConstraint(err);
  if (err.name === 'SequelizeForeignKeyConstraintError') error = handleSequelizeForeignKey();

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

exports.notFoundHandler = (req, res, next) => {
  next(new AppError(`Route '${req.originalUrl}' not found`, 404));
};

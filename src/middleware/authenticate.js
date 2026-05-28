'use strict';

const authService = require('../services/authService');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const authenticate = catchAsync(async (req, res, next) => {
  // Step 1 — check token exists in header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please login to get access.', 401));
  }

  // Step 2 — verify token
  const decoded = authService.verifyToken(token);

  // Step 3 — check user still exists
  const user = await User.findByPk(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  // Step 4 — check user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated.', 403));
  }

  // Step 5 — attach user to request
  req.user = user;
  next();
});

// ─── Role Authorization ────────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

module.exports = { authenticate, authorize };

'use strict';

const authService = require('../services/authService');
const { sendSuccess, sendCreated } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');

// ─── Register ──────────────────────────────────────────────
exports.register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  sendCreated(res, {
    message: 'Account created successfully!',
    token,
    user,
  });
});

// ─── Login ─────────────────────────────────────────────────
exports.login = catchAsync(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  sendSuccess(res, {
    message: 'Logged in successfully!',
    token,
    user,
  });
});

// ─── Get Profile ───────────────────────────────────────────
exports.getProfile = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  sendSuccess(res, { user });
});

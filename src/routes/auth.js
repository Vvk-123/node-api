"use strict";

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authenticate");
const { validate, authSchemas } = require("../middleware/validate");

/**
 * @route  POST /api/v1/auth/register
 * @desc   Register new user
 * @access Public
 */
router.post(
  "/register",
  validate(authSchemas.register),
  authController.register,
);

/**
 * @route  POST /api/v1/auth/login
 * @desc   Login user
 * @access Public
 */
router.post("/login", validate(authSchemas.login), authController.login);

/**
 * @route  GET /api/v1/auth/profile
 * @desc   Get logged in user profile
 * @access Private (requires token)
 */
router.get("/profile", authenticate, authController.getProfile);

module.exports = router;

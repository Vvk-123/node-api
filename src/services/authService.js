"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const AppError = require("../utils/AppError");

class AuthService {
  // ─── Generate JWT Token ────────────────────────────────
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }

  // ─── Register ──────────────────────────────────────────
  async register({ name, email, password }) {
    // check if email already exists
    const existingUser = await User.scope("withPassword").findOne({
      where: { email },
    });
    if (existingUser) {
      throw new AppError(
        "Email already registered. Please use a different email.",
        409,
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // generate token
    const token = this.generateToken(user.id);

    return { user, token };
  }

  // ─── Login ─────────────────────────────────────────────
  async login({ email, password }) {
    // find user with password
    const user = await User.scope("withPassword").findOne({ where: { email } });

    // check user exists and password correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError("Incorrect email or password.", 401);
    }

    // check user is active
    if (!user.isActive) {
      throw new AppError(
        "Your account has been deactivated. Please contact support.",
        403,
      );
    }

    // generate token
    const token = this.generateToken(user.id);

    // remove password from response
    user.password = undefined;

    return { user, token };
  }

  // ─── Get Profile ───────────────────────────────────────
  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError("User not found.", 404);
    return user;
  }

  // ─── Verify Token ──────────────────────────────────────
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new AppError(
          "Your session has expired. Please login again.",
          401,
        );
      }
      throw new AppError("Invalid token. Please login again.", 401);
    }
  }
}

module.exports = new AuthService();

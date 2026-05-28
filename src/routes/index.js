"use strict";

const express = require("express");
const router = express.Router();

const itemRoutes = require("./items");
const authRoutes = require("./auth");

router.use("/auth", authRoutes);

router.use("/items", itemRoutes);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();

const itemRoutes = require('./items');

router.use('/items', itemRoutes);

module.exports = router;

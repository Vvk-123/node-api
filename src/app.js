'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// ─── Security ──────────────────────────────────────────────────────────────
app.use(helmet());
app.set('trust proxy', 1);

// ─── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Request ID ────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.id = uuidv4();
  next();
});

// ─── Logging ───────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip: (_req, res) => res.statusCode < 400 && process.env.NODE_ENV === 'test',
}));

// ─── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Compression ───────────────────────────────────────────────────────────
app.use(compression());

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Performance test endpoint
app.get('/perf-test', async (req, res) => {
  const { Item } = require('./models');
  const { Op } = require('sequelize');

  const results = {};

  // Test 1 — count all records
  let start = Date.now();
  const total = await Item.count();
  results.countAll = `${Date.now() - start}ms (total: ${total})`;

  // Test 2 — get first page
  start = Date.now();
  await Item.findAll({ limit: 10, offset: 0 });
  results.firstPage = `${Date.now() - start}ms`;

  // Test 3 — get last page
  start = Date.now();
  await Item.findAll({ limit: 10, offset: 9990 });
  results.lastPage = `${Date.now() - start}ms`;

  // Test 4 — search
  start = Date.now();
  await Item.findAll({
    where: { name: { [Op.iLike]: '%Electronics%' } },
    limit: 10
  });
  results.search = `${Date.now() - start}ms`;

  // Test 5 — filter by status
  start = Date.now();
  await Item.findAll({
    where: { status: 'active' },
    limit: 10
  });
  results.filterStatus = `${Date.now() - start}ms`;

  res.json({ success: true, performance: results });
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── Error Handling ────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

'use strict';

const Joi = require('joi');
const AppError = require('../utils/AppError');

const validate = (schema, target = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[target], { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return next(new AppError(message, 422));
  }
  req[target] = value;
  next();
};

// ─── Item Schemas ──────────────────────────────────────────────────────────
const itemSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(5000).optional().allow('', null),
    status: Joi.string().valid('active', 'inactive', 'archived').default('active'),
    metadata: Joi.object().optional().default({}),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(5000).optional().allow('', null),
    status: Joi.string().valid('active', 'inactive', 'archived').optional(),
    metadata: Joi.object().optional(),
  }).min(1),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('active', 'inactive', 'archived').optional(),
    search: Joi.string().max(100).optional(),
    sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  }),
};

module.exports = { validate, itemSchemas };
'use strict';

const itemService = require('../services/itemService');
const { sendSuccess, sendCreated } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');

exports.getAll = catchAsync(async (req, res) => {
  const { page, limit, status, search, sortBy, sortOrder } = req.query;
  const result = await itemService.findAll({ page, limit, status, search, sortBy, sortOrder });
  sendSuccess(res, result);
});

exports.getOne = catchAsync(async (req, res) => {
  const item = await itemService.findById(req.params.id);
  sendSuccess(res, { item });
});

exports.create = catchAsync(async (req, res) => {
  const item = await itemService.create(req.body);
  sendCreated(res, { item });
});

exports.update = catchAsync(async (req, res) => {
  const item = await itemService.update(req.params.id, req.body);
  sendSuccess(res, { item });
});

exports.remove = catchAsync(async (req, res) => {
  const result = await itemService.delete(req.params.id);
  sendSuccess(res, result);
});

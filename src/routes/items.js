'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/itemController');
const { validate, itemSchemas } = require('../middleware/validate');

/**
 * @route   GET /api/v1/items
 * @desc    Get all items (paginated, filterable)
 * @access  Public
 */
router.get('/', validate(itemSchemas.query, 'query'), controller.getAll);

/**
 * @route   GET /api/v1/items/:id
 * @desc    Get a single item by ID
 * @access  Public
 */
router.get('/:id', controller.getOne);

/**
 * @route   POST /api/v1/items
 * @desc    Create a new item
 * @access  Public
 */
router.post('/', validate(itemSchemas.create), controller.create);

/**
 * @route   PUT /api/v1/items/:id
 * @desc    Replace an item
 * @access  Public
 */
router.put('/:id', validate(itemSchemas.update), controller.update);

/**
 * @route   PATCH /api/v1/items/:id
 * @desc    Partially update an item
 * @access  Public
 */
router.patch('/:id', validate(itemSchemas.update), controller.update);

/**
 * @route   DELETE /api/v1/items/:id
 * @desc    Soft-delete an item
 * @access  Public
 */
router.delete('/:id', controller.remove);

module.exports = router;

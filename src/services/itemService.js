'use strict';

const { Item } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

class ItemService {
  async findAll({ page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'DESC' } = {}) {
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const validSortFields = ['name', 'createdAt', 'updatedAt', 'status'];
    const order = [[validSortFields.includes(sortBy) ? sortBy : 'createdAt', sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    const { count, rows } = await Item.findAndCountAll({
      where,
      limit: Math.min(limit, 100),
      offset,
      order,
    });

    return {
      items: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id) {
    const item = await Item.findByPk(id);
    if (!item) throw new AppError(`Item with id '${id}' not found`, 404);
    return item;
  }

  async create(data) {
    return Item.create(data);
  }

  async update(id, data) {
    const item = await this.findById(id);
    return item.update(data);
  }

  async delete(id) {
    const item = await this.findById(id);
    await item.destroy(); // soft delete (paranoid)
    return { message: 'Item deleted successfully' };
  }
}

module.exports = new ItemService();

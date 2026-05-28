'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { sequelize, Item } = require('../models');
const logger = require('./logger');

const statuses = ['active', 'inactive', 'archived'];
const categories = ['Electronics', 'Clothing', 'Food', 'Sports', 'Books', 'Toys', 'Furniture', 'Beauty'];

const generateItems = (count) => {
  const items = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      name: `Item ${i} - ${categories[i % categories.length]}`,
      description: `This is description for item number ${i}. Category: ${categories[i % categories.length]}`,
      status: statuses[i % statuses.length],
      metadata: {
        category: categories[i % categories.length],
        price: parseFloat((Math.random() * 1000).toFixed(2)),
        stock: Math.floor(Math.random() * 500),
        index: i,
      },
    });
  }
  return items;
};

const seed = async () => {
  try {
    await sequelize.authenticate();
    logger.info('DB connected ✅');

    await sequelize.sync({ alter: true });
    logger.info('Tables synced ✅');

    logger.info('Deleting existing items...');
    await Item.destroy({ where: {}, truncate: true, force: true });
    logger.info('Existing items deleted ✅');

    logger.info('Inserting 10,000 items...');
    const startTime = Date.now();

    const BATCH_SIZE = 500;
    const TOTAL = 10000;
    const items = generateItems(TOTAL);

    for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      await Item.bulkCreate(batch);
      logger.info(`Inserted ${Math.min(i + BATCH_SIZE, TOTAL)} / ${TOTAL} items...`);
    }

    const endTime = Date.now();
    logger.info(`✅ 10,000 items inserted in ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
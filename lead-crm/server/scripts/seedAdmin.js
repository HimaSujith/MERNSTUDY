const mongoose = require('mongoose');
const env = require('../src/config/env');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const logger = require('../src/utils/logger');

async function seed() {
  if (!env.seedAdmin.email || !env.seedAdmin.password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env');
  }

  await connectDB();

  const existing = await User.findOne({ email: env.seedAdmin.email });
  if (existing) {
    logger.info(`Admin user already exists: ${env.seedAdmin.email}`);
  } else {
    await User.create({
      name: env.seedAdmin.name,
      email: env.seedAdmin.email,
      password: env.seedAdmin.password,
      role: 'admin',
    });
    logger.info(`Admin user created: ${env.seedAdmin.email}`);
  }

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Seed failed:', err);
    process.exit(1);
  });

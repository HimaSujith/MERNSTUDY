const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

async function connectDB() {
  // Some corporate/ISP DNS servers fail to resolve mongodb.net SRV records
  // (Atlas connection strings) even though the records are valid publicly.
  // Set DNS_SERVERS in .env (comma-separated) to override Node's resolver
  // for this process only if you hit "querySrv ECONNREFUSED" on a valid URI.
  if (env.dnsServers.length) {
    dns.setServers(env.dnsServers);
    logger.info(`Using custom DNS servers for resolution: ${env.dnsServers.join(', ')}`);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  logger.info(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDB;

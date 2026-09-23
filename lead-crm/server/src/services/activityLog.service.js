const ActivityLog = require('../models/ActivityLog');

async function logActivity({ lead, actor, type, message, meta }) {
  return ActivityLog.create({ lead, actor, type, message, meta });
}

module.exports = { logActivity };

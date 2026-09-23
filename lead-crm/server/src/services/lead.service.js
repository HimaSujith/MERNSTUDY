const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Central visibility rule, reused by every leads/follow-ups query so scoping
 * logic lives in one place instead of being duplicated per controller.
 * admin -> sees everything; manager -> sees own + their direct reports' records;
 * agent -> sees only records assigned to themself.
 *
 * Returns cast ObjectId values (not raw strings) so the filter works both with
 * Mongoose queries (find/countDocuments, which auto-cast) and with .aggregate()
 * $match stages, which do NOT auto-cast query values against the schema.
 */
async function buildScopeFilter(user, field = 'assignedTo') {
  if (user.role === 'admin') return {};

  const selfId = new mongoose.Types.ObjectId(user.id);

  if (user.role === 'manager') {
    const reports = await User.find({ reportsTo: user.id }).select('_id').lean();
    const ids = [selfId, ...reports.map((r) => r._id)];
    return { [field]: { $in: ids } };
  }

  return { [field]: selfId };
}

module.exports = { buildScopeFilter };

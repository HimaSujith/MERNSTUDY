const { buildScopeFilter } = require('./lead.service');

function viewDateFilter(view) {
  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);

  switch (view) {
    case 'today':
      return { dueDate: { $gte: startOfDay, $lte: endOfDay }, status: 'Pending' };
    case 'overdue':
      return { dueDate: { $lt: startOfDay }, status: 'Pending' };
    case 'upcoming':
      return { dueDate: { $gt: endOfDay }, status: 'Pending' };
    default:
      return {};
  }
}

module.exports = { buildScopeFilter, viewDateFilter };

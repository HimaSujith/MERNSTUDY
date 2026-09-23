const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const { STATUSES } = require('../models/Lead');
const asyncHandler = require('../utils/asyncHandler');
const { buildScopeFilter } = require('../services/lead.service');
const { viewDateFilter } = require('../services/followup.service');

const getSummary = asyncHandler(async (req, res) => {
  const leadScope = await buildScopeFilter(req.user, 'assignedTo');
  const followUpScope = await buildScopeFilter(req.user, 'assignedTo');

  const statusCounts = await Lead.aggregate([
    { $match: leadScope },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const pipeline = STATUSES.reduce((acc, status) => {
    const found = statusCounts.find((s) => s._id === status);
    acc[status] = found ? found.count : 0;
    return acc;
  }, {});

  const [todayCount, overdueCount, upcomingCount] = await Promise.all([
    FollowUp.countDocuments({ ...followUpScope, ...viewDateFilter('today') }),
    FollowUp.countDocuments({ ...followUpScope, ...viewDateFilter('overdue') }),
    FollowUp.countDocuments({ ...followUpScope, ...viewDateFilter('upcoming') }),
  ]);

  const totalLeads = Object.values(pipeline).reduce((a, b) => a + b, 0);

  res.json({
    pipeline,
    totalLeads,
    followUps: { today: todayCount, overdue: overdueCount, upcoming: upcomingCount },
  });
});

module.exports = { getSummary };

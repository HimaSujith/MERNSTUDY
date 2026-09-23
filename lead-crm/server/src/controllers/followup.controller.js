const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, paginatedResult } = require('../utils/pagination');
const { buildScopeFilter, viewDateFilter } = require('../services/followup.service');
const { logActivity } = require('../services/activityLog.service');

async function loadScopedFollowUp(req) {
  const scope = await buildScopeFilter(req.user);
  const followUp = await FollowUp.findOne({ _id: req.params.id, ...scope });
  if (!followUp) throw ApiError.notFound('Follow-up not found');
  return followUp;
}

const listFollowUps = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const scope = await buildScopeFilter(req.user);
  const filter = { ...scope, ...viewDateFilter(req.query.view) };

  if (req.query.lead) filter.lead = req.query.lead;
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    FollowUp.find(filter)
      .populate('lead', 'name phone status')
      .populate('assignedTo', 'name')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit),
    FollowUp.countDocuments(filter),
  ]);

  res.json(paginatedResult(items, total, page, limit));
});

const createFollowUp = asyncHandler(async (req, res) => {
  const scope = await buildScopeFilter(req.user, 'assignedTo');
  const lead = await Lead.findOne({ _id: req.body.lead, ...scope });
  if (!lead) throw ApiError.notFound('Lead not found');

  const assignedTo = req.body.assignedTo || lead.assignedTo;

  const followUp = await FollowUp.create({
    lead: lead._id,
    type: req.body.type,
    dueDate: req.body.dueDate,
    notes: req.body.notes,
    assignedTo,
    createdBy: req.user.id,
  });

  await logActivity({
    lead: lead._id,
    actor: req.user.id,
    type: 'FollowUpCreated',
    message: `${followUp.type} follow-up scheduled for ${new Date(followUp.dueDate).toLocaleString()}`,
  });

  res.status(201).json(followUp);
});

const getFollowUp = asyncHandler(async (req, res) => {
  const followUp = await loadScopedFollowUp(req);
  await followUp.populate([{ path: 'lead', select: 'name phone status' }, { path: 'assignedTo', select: 'name' }]);
  res.json(followUp);
});

const updateFollowUp = asyncHandler(async (req, res) => {
  const followUp = await loadScopedFollowUp(req);
  const editable = ['type', 'dueDate', 'notes'];
  for (const field of editable) {
    if (req.body[field] !== undefined) followUp[field] = req.body[field];
  }
  if (req.body.dueDate !== undefined) followUp.reminderSentAt = null;
  await followUp.save();
  res.json(followUp);
});

const completeFollowUp = asyncHandler(async (req, res) => {
  const followUp = await loadScopedFollowUp(req);
  followUp.status = 'Done';
  followUp.completedAt = new Date();
  await followUp.save();

  await logActivity({
    lead: followUp.lead,
    actor: req.user.id,
    type: 'FollowUpCompleted',
    message: `${followUp.type} follow-up marked complete`,
  });

  res.json(followUp);
});

const cancelFollowUp = asyncHandler(async (req, res) => {
  const followUp = await loadScopedFollowUp(req);
  followUp.status = 'Cancelled';
  await followUp.save();
  res.json(followUp);
});

module.exports = { listFollowUps, createFollowUp, getFollowUp, updateFollowUp, completeFollowUp, cancelFollowUp };

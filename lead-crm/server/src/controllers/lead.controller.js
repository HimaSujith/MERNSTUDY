const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, paginatedResult } = require('../utils/pagination');
const { buildScopeFilter } = require('../services/lead.service');
const { logActivity } = require('../services/activityLog.service');
const { notify } = require('../services/notification.service');

async function loadScopedLead(req) {
  const scope = await buildScopeFilter(req.user);
  const lead = await Lead.findOne({ _id: req.params.id, ...scope });
  if (!lead) throw ApiError.notFound('Lead not found');
  return lead;
}

const listLeads = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const scope = await buildScopeFilter(req.user);
  const filter = { ...scope };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assignedTo && req.user.role !== 'agent') filter.assignedTo = req.query.assignedTo;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Lead.countDocuments(filter),
  ]);

  res.json(paginatedResult(items, total, page, limit));
});

const createLead = asyncHandler(async (req, res) => {
  const assignedTo = req.body.assignedTo || req.user.id;

  if (req.user.role === 'agent' && assignedTo !== req.user.id) {
    throw ApiError.forbidden('Agents can only create leads assigned to themselves');
  }

  const possibleDuplicate = await Lead.findOne({ phone: req.body.phone }).select('_id name');

  const lead = await Lead.create({ ...req.body, assignedTo, createdBy: req.user.id });

  await logActivity({
    lead: lead._id,
    actor: req.user.id,
    type: 'LeadCreated',
    message: `Lead created${possibleDuplicate ? ' (possible duplicate phone number detected)' : ''}`,
  });

  res.status(201).json({ lead, possibleDuplicate: possibleDuplicate || null });
});

const getLead = asyncHandler(async (req, res) => {
  const lead = await loadScopedLead(req);
  await lead.populate('assignedTo', 'name email');
  res.json(lead);
});

const updateLead = asyncHandler(async (req, res) => {
  const lead = await loadScopedLead(req);
  const editable = ['name', 'phone', 'email', 'source', 'priority', 'budgetMin', 'budgetMax', 'propertyRequirement', 'location', 'tags'];
  for (const field of editable) {
    if (req.body[field] !== undefined) lead[field] = req.body[field];
  }
  await lead.save();
  res.json(lead);
});

const changeStatus = asyncHandler(async (req, res) => {
  const lead = await loadScopedLead(req);
  const { status, lostReason } = req.body;
  const from = lead.status;

  lead.status = status;
  if (status === 'Lost') lead.lostReason = lostReason || lead.lostReason;
  await lead.save();

  await logActivity({
    lead: lead._id,
    actor: req.user.id,
    type: 'StatusChange',
    message: `Status changed from "${from}" to "${status}"`,
    meta: { from, to: status },
  });

  res.json(lead);
});

const assignLead = asyncHandler(async (req, res) => {
  const scope = await buildScopeFilter(req.user);
  const lead = await Lead.findOne({ _id: req.params.id, ...scope });
  if (!lead) throw ApiError.notFound('Lead not found');

  const previousAssignee = lead.assignedTo;
  lead.assignedTo = req.body.assignedTo;
  await lead.save();

  await logActivity({
    lead: lead._id,
    actor: req.user.id,
    type: 'LeadAssigned',
    message: 'Lead reassigned to a different agent',
    meta: { from: previousAssignee, to: req.body.assignedTo },
  });

  await notify({
    user: req.body.assignedTo,
    type: 'LeadAssigned',
    title: 'A lead has been assigned to you',
    message: `Lead "${lead.name}" has been assigned to you.`,
    link: `/leads/${lead._id}`,
    relatedLead: lead._id,
  });

  res.json(lead);
});

const addNote = asyncHandler(async (req, res) => {
  const lead = await loadScopedLead(req);
  const entry = await logActivity({
    lead: lead._id,
    actor: req.user.id,
    type: 'Note',
    message: req.body.message,
  });
  res.status(201).json(entry);
});

const getActivity = asyncHandler(async (req, res) => {
  await loadScopedLead(req);
  const activity = await ActivityLog.find({ lead: req.params.id })
    .populate('actor', 'name')
    .sort({ createdAt: -1 });
  res.json(activity);
});

const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) throw ApiError.notFound('Lead not found');
  res.json({ success: true });
});

module.exports = {
  listLeads,
  createLead,
  getLead,
  updateLead,
  changeStatus,
  assignLead,
  addNote,
  getActivity,
  deleteLead,
};

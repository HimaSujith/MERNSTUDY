const mongoose = require('mongoose');

const TYPES = [
  'StatusChange',
  'Note',
  'FollowUpCreated',
  'FollowUpCompleted',
  'LeadCreated',
  'LeadAssigned',
  'Other',
];

const activityLogSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: TYPES, required: true },
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ lead: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
module.exports.TYPES = TYPES;

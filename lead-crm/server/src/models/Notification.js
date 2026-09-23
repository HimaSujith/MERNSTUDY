const mongoose = require('mongoose');

const TYPES = ['FollowUpDue', 'FollowUpOverdue', 'LeadAssigned', 'Other'];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: TYPES, default: 'Other' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    relatedFollowUp: { type: mongoose.Schema.Types.ObjectId, ref: 'FollowUp' },
    relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.TYPES = TYPES;

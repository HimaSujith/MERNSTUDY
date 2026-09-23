const mongoose = require('mongoose');

const TYPES = ['Call', 'Site Visit', 'Email', 'Meeting', 'Other'];
const STATUSES = ['Pending', 'Done', 'Missed', 'Cancelled'];

const followUpSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    type: { type: String, enum: TYPES, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: STATUSES, default: 'Pending' },
    notes: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: { type: Date },
    reminderSentAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

followUpSchema.index({ assignedTo: 1, dueDate: 1, status: 1 });
followUpSchema.index({ lead: 1 });
followUpSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
module.exports.TYPES = TYPES;
module.exports.STATUSES = STATUSES;

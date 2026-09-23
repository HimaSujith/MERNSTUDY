const mongoose = require('mongoose');

const SOURCES = ['Walk-in', 'Referral', 'Website', 'Phone Inquiry', 'Social Media', 'Newspaper', 'Other'];
const STATUSES = ['New', 'Contacted', 'Site Visit Scheduled', 'Site Visit Done', 'Negotiation', 'Converted', 'Lost'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    source: { type: String, enum: SOURCES, default: 'Other' },
    status: { type: String, enum: STATUSES, default: 'New' },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },
    propertyRequirement: { type: String, trim: true },
    location: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lostReason: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
module.exports.SOURCES = SOURCES;
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;

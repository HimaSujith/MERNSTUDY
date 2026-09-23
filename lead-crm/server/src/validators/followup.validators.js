const { body } = require('express-validator');
const { TYPES } = require('../models/FollowUp');

const createFollowUpRules = [
  body('lead').isMongoId().withMessage('Valid lead id required'),
  body('type').isIn(TYPES).withMessage(`Type must be one of ${TYPES.join(', ')}`),
  body('dueDate').isISO8601().withMessage('Valid dueDate required'),
  body('notes').optional().trim(),
  body('assignedTo').optional().isMongoId(),
];

const updateFollowUpRules = [
  body('type').optional().isIn(TYPES),
  body('dueDate').optional().isISO8601(),
  body('notes').optional().trim(),
];

module.exports = { createFollowUpRules, updateFollowUpRules };

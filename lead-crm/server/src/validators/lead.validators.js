const { body } = require('express-validator');
const { SOURCES, STATUSES, PRIORITIES } = require('../models/Lead');

const createLeadRules = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('phone').trim().notEmpty().withMessage('Phone required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('source').optional().isIn(SOURCES),
  body('priority').optional().isIn(PRIORITIES),
  body('budgetMin').optional().isFloat({ min: 0 }),
  body('budgetMax').optional().isFloat({ min: 0 }),
  body('assignedTo').optional().isMongoId(),
];

const updateLeadRules = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('email').optional({ checkFalsy: true }).isEmail(),
  body('source').optional().isIn(SOURCES),
  body('priority').optional().isIn(PRIORITIES),
  body('budgetMin').optional().isFloat({ min: 0 }),
  body('budgetMax').optional().isFloat({ min: 0 }),
];

const changeStatusRules = [
  body('status').isIn(STATUSES).withMessage(`Status must be one of ${STATUSES.join(', ')}`),
  body('lostReason').optional().trim(),
];

const assignLeadRules = [
  body('assignedTo').isMongoId().withMessage('Valid assignedTo user id required'),
];

const addNoteRules = [
  body('message').trim().notEmpty().withMessage('Note message required'),
];

module.exports = { createLeadRules, updateLeadRules, changeStatusRules, assignLeadRules, addNoteRules };

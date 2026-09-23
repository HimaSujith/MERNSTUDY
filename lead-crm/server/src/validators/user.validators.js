const { body } = require('express-validator');
const { ROLES } = require('../models/User');

const createUserRules = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(ROLES).withMessage(`Role must be one of ${ROLES.join(', ')}`),
  body('reportsTo').optional().isMongoId().withMessage('Invalid reportsTo id'),
];

const updateUserRules = [
  body('name').optional().trim().notEmpty(),
  body('role').optional().isIn(ROLES),
  body('reportsTo').optional().isMongoId(),
  body('phone').optional().trim(),
];

module.exports = { createUserRules, updateUserRules };

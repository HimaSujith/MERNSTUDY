const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createUserRules, updateUserRules } = require('../validators/user.validators');
const ctrl = require('../controllers/user.controller');

const router = express.Router();

router.use(authenticate, authorize('admin', 'manager'));

router.get('/', ctrl.listUsers);
router.post('/', createUserRules, validate, ctrl.createUser);
router.get('/:id', ctrl.getUser);
router.patch('/:id', authorize('admin'), updateUserRules, validate, ctrl.updateUser);
router.patch('/:id/deactivate', authorize('admin'), ctrl.deactivateUser);
router.patch('/:id/reset-password', authorize('admin'), ctrl.resetPassword);

module.exports = router;

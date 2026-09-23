const express = require('express');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createFollowUpRules, updateFollowUpRules } = require('../validators/followup.validators');
const ctrl = require('../controllers/followup.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', ctrl.listFollowUps);
router.post('/', createFollowUpRules, validate, ctrl.createFollowUp);
router.get('/:id', ctrl.getFollowUp);
router.patch('/:id', updateFollowUpRules, validate, ctrl.updateFollowUp);
router.patch('/:id/complete', ctrl.completeFollowUp);
router.patch('/:id/cancel', ctrl.cancelFollowUp);

module.exports = router;

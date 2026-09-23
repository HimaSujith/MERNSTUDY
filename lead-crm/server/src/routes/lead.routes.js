const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createLeadRules,
  updateLeadRules,
  changeStatusRules,
  assignLeadRules,
  addNoteRules,
} = require('../validators/lead.validators');
const ctrl = require('../controllers/lead.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', ctrl.listLeads);
router.post('/', createLeadRules, validate, ctrl.createLead);
router.get('/:id', ctrl.getLead);
router.patch('/:id', updateLeadRules, validate, ctrl.updateLead);
router.patch('/:id/status', changeStatusRules, validate, ctrl.changeStatus);
router.patch('/:id/assign', authorize('admin', 'manager'), assignLeadRules, validate, ctrl.assignLead);
router.post('/:id/notes', addNoteRules, validate, ctrl.addNote);
router.get('/:id/activity', ctrl.getActivity);
router.delete('/:id', authorize('admin'), ctrl.deleteLead);

module.exports = router;

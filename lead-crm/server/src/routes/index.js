const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/leads', require('./lead.routes'));
router.use('/followups', require('./followup.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/notifications', require('./notification.routes'));

module.exports = router;

const express = require('express');
const authenticate = require('../middleware/authenticate');
const ctrl = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/summary', authenticate, ctrl.getSummary);

module.exports = router;

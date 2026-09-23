const express = require('express');
const authenticate = require('../middleware/authenticate');
const ctrl = require('../controllers/notification.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', ctrl.listNotifications);
router.get('/unread-count', ctrl.unreadCount);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);

module.exports = router;

const Notification = require('../models/Notification');

async function notify({ user, type, title, message, link, relatedFollowUp, relatedLead }) {
  return Notification.create({ user, type, title, message, link, relatedFollowUp, relatedLead });
}

module.exports = { notify };

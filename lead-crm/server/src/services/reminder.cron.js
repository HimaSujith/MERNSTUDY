const cron = require('node-cron');
const FollowUp = require('../models/FollowUp');
const env = require('../config/env');
const logger = require('../utils/logger');
const { notify } = require('./notification.service');
const { sendMail } = require('./email.service');

async function runReminderSweep() {
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 60 * 1000);

  const candidates = await FollowUp.find({
    status: 'Pending',
    reminderSentAt: null,
    dueDate: { $lte: soon },
  }).select('_id');

  let sentCount = 0;

  for (const candidate of candidates) {
    // Atomically claim this follow-up before notifying, so two overlapping sweeps
    // (or two server instances) can never both send a reminder for the same record.
    const followUp = await FollowUp.findOneAndUpdate(
      { _id: candidate._id, reminderSentAt: null },
      { reminderSentAt: now },
      { new: true }
    )
      .populate('lead', 'name phone')
      .populate('assignedTo', 'name email');

    if (!followUp) continue; // another process already claimed it

    try {
      const isOverdue = followUp.dueDate < now;
      const leadName = followUp.lead ? followUp.lead.name : 'a lead';
      const title = isOverdue ? 'Follow-up overdue' : 'Follow-up due soon';
      const message = `${followUp.type} follow-up for ${leadName} is ${
        isOverdue ? 'overdue' : `due at ${followUp.dueDate.toLocaleString()}`
      }.`;

      await notify({
        user: followUp.assignedTo._id,
        type: isOverdue ? 'FollowUpOverdue' : 'FollowUpDue',
        title,
        message,
        link: `/leads/${followUp.lead ? followUp.lead._id : ''}`,
        relatedFollowUp: followUp._id,
        relatedLead: followUp.lead ? followUp.lead._id : undefined,
      });

      if (followUp.assignedTo.email) {
        await sendMail({
          to: followUp.assignedTo.email,
          subject: title,
          text: message,
        });
      }

      sentCount += 1;
    } catch (err) {
      logger.error(`Reminder sweep failed for follow-up ${followUp._id}:`, err.message);
    }
  }

  if (sentCount > 0) logger.info(`Reminder sweep sent ${sentCount} notification(s).`);
  return sentCount;
}

function startReminderCron() {
  if (!env.enableCron) {
    logger.info('Reminder cron disabled (ENABLE_CRON=false).');
    return;
  }
  cron.schedule(env.reminderCronSchedule, () => {
    runReminderSweep().catch((err) => logger.error('Reminder sweep crashed:', err));
  });
  logger.info(`Reminder cron scheduled: ${env.reminderCronSchedule}`);
}

module.exports = { startReminderCron, runReminderSweep };

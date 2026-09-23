const User = require('../src/models/User');
const Lead = require('../src/models/Lead');
const FollowUp = require('../src/models/FollowUp');
const Notification = require('../src/models/Notification');
const { runReminderSweep } = require('../src/services/reminder.cron');

describe('Reminder cron', () => {
  test('concurrent sweeps never send duplicate reminders for the same follow-up', async () => {
    const agent = await User.create({ name: 'Agent', email: 'agent@example.com', password: 'password123', role: 'agent' });
    const lead = await Lead.create({ name: 'Lead A', phone: '111', assignedTo: agent._id, createdBy: agent._id });
    const followUp = await FollowUp.create({
      lead: lead._id,
      type: 'Call',
      dueDate: new Date(Date.now() - 5 * 60 * 1000),
      assignedTo: agent._id,
      createdBy: agent._id,
    });

    // Simulate two overlapping sweep runs racing on the same due follow-up.
    await Promise.all([runReminderSweep(), runReminderSweep()]);

    const notifications = await Notification.find({ relatedFollowUp: followUp._id });
    expect(notifications).toHaveLength(1);

    const updated = await FollowUp.findById(followUp._id);
    expect(updated.reminderSentAt).not.toBeNull();
  });

  test('a follow-up due more than 30 minutes out is left alone', async () => {
    const agent = await User.create({ name: 'Agent', email: 'agent@example.com', password: 'password123', role: 'agent' });
    const lead = await Lead.create({ name: 'Lead A', phone: '111', assignedTo: agent._id, createdBy: agent._id });
    await FollowUp.create({
      lead: lead._id,
      type: 'Call',
      dueDate: new Date(Date.now() + 60 * 60 * 1000),
      assignedTo: agent._id,
      createdBy: agent._id,
    });

    const sent = await runReminderSweep();
    expect(sent).toBe(0);
  });
});

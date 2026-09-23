const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Lead = require('../src/models/Lead');
const ActivityLog = require('../src/models/ActivityLog');

async function loginAs(user) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'password123' });
  return res.body.accessToken;
}

describe('Leads', () => {
  let admin, manager, agent1, agent2;

  beforeEach(async () => {
    admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'admin' });
    manager = await User.create({ name: 'Manager', email: 'manager@example.com', password: 'password123', role: 'manager' });
    agent1 = await User.create({ name: 'Agent1', email: 'agent1@example.com', password: 'password123', role: 'agent', reportsTo: manager._id });
    agent2 = await User.create({ name: 'Agent2', email: 'agent2@example.com', password: 'password123', role: 'agent' });
  });

  test('agent can create a lead assigned to self', async () => {
    const token = await loginAs(agent1);
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'John Doe', phone: '9999999999' });

    expect(res.status).toBe(201);
    expect(res.body.lead.assignedTo).toBe(agent1._id.toString());
  });

  test('agent only sees own leads in list', async () => {
    await Lead.create({ name: 'Lead A', phone: '111', assignedTo: agent1._id, createdBy: agent1._id });
    await Lead.create({ name: 'Lead B', phone: '222', assignedTo: agent2._id, createdBy: agent2._id });

    const token = await loginAs(agent1);
    const res = await request(app).get('/api/leads').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].name).toBe('Lead A');
  });

  test('manager sees own team leads but not unrelated agent leads', async () => {
    await Lead.create({ name: 'Team Lead', phone: '111', assignedTo: agent1._id, createdBy: agent1._id });
    await Lead.create({ name: 'Other Lead', phone: '222', assignedTo: agent2._id, createdBy: agent2._id });

    const token = await loginAs(manager);
    const res = await request(app).get('/api/leads').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const names = res.body.items.map((l) => l.name);
    expect(names).toContain('Team Lead');
    expect(names).not.toContain('Other Lead');
  });

  test('admin sees all leads', async () => {
    await Lead.create({ name: 'Lead A', phone: '111', assignedTo: agent1._id, createdBy: agent1._id });
    await Lead.create({ name: 'Lead B', phone: '222', assignedTo: agent2._id, createdBy: agent2._id });

    const token = await loginAs(admin);
    const res = await request(app).get('/api/leads').set('Authorization', `Bearer ${token}`);

    expect(res.body.items).toHaveLength(2);
  });

  test('status change writes an ActivityLog entry', async () => {
    const lead = await Lead.create({ name: 'Lead A', phone: '111', assignedTo: agent1._id, createdBy: agent1._id });
    const token = await loginAs(agent1);

    const res = await request(app)
      .patch(`/api/leads/${lead._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Contacted' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Contacted');

    const logs = await ActivityLog.find({ lead: lead._id });
    expect(logs).toHaveLength(1);
    expect(logs[0].type).toBe('StatusChange');
  });
});

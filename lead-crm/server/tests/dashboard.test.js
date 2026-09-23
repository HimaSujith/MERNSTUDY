const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Lead = require('../src/models/Lead');

async function loginAs(user) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'password123' });
  return res.body.accessToken;
}

describe('Dashboard summary', () => {
  test('pipeline counts reflect an agent-scoped lead (aggregate $match must cast to ObjectId)', async () => {
    const agent = await User.create({ name: 'Agent', email: 'agent@example.com', password: 'password123', role: 'agent' });
    await Lead.create({ name: 'Lead A', phone: '111', status: 'Contacted', assignedTo: agent._id, createdBy: agent._id });

    const token = await loginAs(agent);
    const res = await request(app).get('/api/dashboard/summary').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalLeads).toBe(1);
    expect(res.body.pipeline.Contacted).toBe(1);
  });
});

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

async function createUser(overrides = {}) {
  return User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'agent',
    ...overrides,
  });
}

describe('Auth', () => {
  test('login succeeds with correct credentials', async () => {
    await createUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  test('login fails with wrong password', async () => {
    await createUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  test('protected route rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('protected route rejects invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  test('authorize() blocks a role without permission', async () => {
    await createUser({ email: 'agent@example.com', role: 'agent' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'agent@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .send({ name: 'New Agent', email: 'new@example.com', password: 'password123' });

    expect(res.status).toBe(403);
  });
});

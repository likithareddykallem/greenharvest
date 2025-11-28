import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';

describe('Authentication flow', () => {
  beforeEach(async () => {
    await User.create({
      name: 'Admin',
      email: 'admin@greenharvest.test',
      password: 'Password123!',
      role: 'admin',
      approved: true,
    });
  });

  test('registers and logs in a user, protects admin route', async () => {
    const registerResp = await request(app).post('/api/auth/register').send({
      name: 'Jane Customer',
      email: 'jane@example.com',
      password: 'Secret123!',
      role: 'customer',
    });
    expect(registerResp.statusCode).toBe(201);
    expect(registerResp.body.user.email).toBe('jane@example.com');

    const loginResp = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
      password: 'Secret123!',
    });
    expect(loginResp.statusCode).toBe(200);
    expect(loginResp.body.accessToken).toBeDefined();
    const cookies = loginResp.headers['set-cookie'];
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);

    const token = loginResp.body.accessToken;

    const adminResp = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(adminResp.statusCode).toBe(403);
  });
});


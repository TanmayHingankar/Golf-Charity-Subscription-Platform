import request from 'supertest';
import app from '../src/app';

describe('auth flow', () => {
  it('register, login, refresh', async () => {
    const email = `user${Date.now()}@test.com`;
    const password = 'Passw0rd!';
    const reg = await request(app).post('/api/auth/register').send({ email, password });
    expect(reg.status).toBe(201);
    const login = await request(app).post('/api/auth/login').send({ email, password });
    expect(login.body.tokens.accessToken).toBeDefined();
    const refresh = await request(app)
      .post('/api/auth/refresh')
      .send({ user_id: login.body.user.id, refresh_token: login.body.tokens.refreshToken });
    expect(refresh.status).toBe(200);
    expect(refresh.body.accessToken).toBeDefined();
  });
});

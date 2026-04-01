import request from 'supertest';
import app from '../src/app';

describe('subscription webhook upsert', () => {
  it('returns 400 without signature', async () => {
    const res = await request(app).post('/api/subscription/webhook').send({});
    expect(res.status).toBe(400);
  });
});

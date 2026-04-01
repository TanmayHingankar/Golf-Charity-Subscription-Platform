import request from 'supertest';
import app from '../src/app';

// Requires seeded admin token and test data; basic shape to keep regression guard
describe('draw engine', () => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || '';
  if (!adminToken) return;
  it('creates and runs draw once', async () => {
    const create = await request(app).post('/api/draws/create').set('Authorization', `Bearer ${adminToken}`);
    expect(create.status).toBe(201);
    const id = create.body.draw.id;
    const run = await request(app).post(`/api/draws/${id}/run`).set('Authorization', `Bearer ${adminToken}`);
    expect(run.status).toBe(200);
    const runAgain = await request(app).post(`/api/draws/${id}/run`).set('Authorization', `Bearer ${adminToken}`);
    expect(runAgain.status).toBe(400);
  });
});

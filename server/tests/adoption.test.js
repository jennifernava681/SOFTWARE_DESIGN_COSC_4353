const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/adoptions', require('../routes/adoption'));

describe('Adoption API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/adoptions - should return requests', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, status: 'pending' }]]);
    const res = await request(app).get('/api/adoptions');
    expect(res.status).toBe(200);
    expect(res.body[0].status).toBe('pending');
  });

  it('POST /api/adoptions - should create request', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/adoptions').send({ 
      request_date: '2024-01-01',
      USERS_id_user: 1,
      USERS_adrees_idadrees_id: 1,
      USERS_adrees_state_state_id: 1
    });
    expect(res.status).toBe(201);
  });

  it('PUT /api/adoptions/:id - should update request', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/adoptions/1').send({ status: 'approved' });
    expect(res.status).toBe(200);
  });

  it('GET /api/adoptions - db error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/adoptions');
    expect(res.status).toBe(500);
  });

  it('POST /api/adoptions - should handle incomplete data', async () => {
    pool.query.mockRejectedValueOnce(new Error('NULL constraint violation'));
    const res = await request(app).post('/api/adoptions').send({});
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('PUT /api/adoptions/999 - should update request (no validation check)', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).put('/api/adoptions/999').send({ status: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Adoption request updated');
  });

  it('POST /api/adoptions - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).post('/api/adoptions').send({ 
      request_date: '2024-01-01',
      USERS_id_user: 1 
    });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('PUT /api/adoptions/1 - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).put('/api/adoptions/1').send({ status: 'approved' });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
}); 
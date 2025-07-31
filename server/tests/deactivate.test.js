// __tests__/deactivate.test.js
const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');

// 👇 This import is required for coverage to work
const deactivateRoute = require('../routes/Deactivate');

const app = express();
app.use(express.json());
app.use('/api/deactivate', deactivateRoute);

describe('PATCH /api/deactivate/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should deactivate an active volunteer', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id_user: 1, role: 'volunteer', active: 1 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).patch('/api/deactivate/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Volunteer deactivated successfully');
  });

  it('should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).patch('/api/deactivate/999');
    expect(res.status).toBe(404);
  });

  it('should handle update failure', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id_user: 1, role: 'volunteer', active: 1 }]])
      .mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).patch('/api/deactivate/1');
    expect(res.status).toBe(500);
  });

  it('should handle db error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).patch('/api/deactivate/1');
    expect(res.status).toBe(500);
  });
});

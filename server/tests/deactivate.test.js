const request = require('supertest');
const express = require('express');

// Mock DB connection
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');

// Load the route you're testing
const deactivateRoute = require('../routes/Deactivate');

// Setup Express app with route
const app = express();
app.use(express.json());
app.use('/api/deactivate', deactivateRoute);

describe('PATCH /api/deactivate/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('✅ should deactivate an active volunteer', async () => {
    // Mock SELECT returning a valid active volunteer
    pool.query
      .mockResolvedValueOnce([[{ id_user: 1, role: 'volunteer', active: 1 }]]) // SELECT
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE

    const res = await request(app).patch('/api/deactivate/1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Volunteer deactivated successfully');
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it('❌ should return 404 if volunteer is already inactive or not found', async () => {
    pool.query.mockResolvedValueOnce([[]]); // SELECT returns nothing

    const res = await request(app).patch('/api/deactivate/999');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Volunteer not found or already deactivated');
  });

  it('⚠️ should return 500 if UPDATE fails', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id_user: 1, role: 'volunteer', active: 1 }]]) // SELECT
      .mockResolvedValueOnce([{ affectedRows: 0 }]); // UPDATE failed

    const res = await request(app).patch('/api/deactivate/1');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Failed to deactivate volunteer');
  });

  it('💥 should return 500 on DB error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).patch('/api/deactivate/1');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
    expect(res.body.error).toBe('DB error');
  });
});

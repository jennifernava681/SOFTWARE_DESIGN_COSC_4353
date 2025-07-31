const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/donations', require('../routes/donations'));

describe('Donations API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/donations - should return donations', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, amount: '100' }]]);
    const res = await request(app).get('/api/donations');
    expect(res.status).toBe(200);
    expect(res.body[0].amount).toBe('100');
  });

  it('POST /api/donations - should add donation with valid data', async () => {
    // Mock the user lookup query first
    pool.query.mockResolvedValueOnce([[]]); // No existing user found
    // Mock the donation insert query
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/donations').send({ 
      donation_type: 'monetary', 
      amount: '50',
      email: 'test@example.com'
    });
    expect(res.status).toBe(201);
  });

  it('POST /api/donations - should reject invalid donation type', async () => {
    const res = await request(app).post('/api/donations').send({ 
      donation_type: 'invalid_type', 
      amount: '50' 
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('POST /api/donations - should reject empty donation type', async () => {
    const res = await request(app).post('/api/donations').send({ 
      donation_type: '', 
      amount: '50' 
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('POST /api/donations - should reject empty amount', async () => {
    const res = await request(app).post('/api/donations').send({ 
      donation_type: 'monetary', 
      amount: '' 
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('POST /api/donations - should reject invalid email', async () => {
    const res = await request(app).post('/api/donations').send({ 
      donation_type: 'monetary', 
      amount: '50',
      email: 'invalid-email' 
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('GET /api/donations - should handle database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/donations');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('GET /api/donations/my - should return user donations', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, amount: '50' }]]);
    const res = await request(app).get('/api/donations/my');
    expect(res.status).toBe(200);
    expect(res.body[0].amount).toBe('50');
  });

  it('GET /api/donations/my - should handle database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/donations/my');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('POST /api/donations - should link donation to existing user', async () => {
    // Mock finding existing user
    pool.query.mockResolvedValueOnce([[{ id_user: 1 }]]);
    // Mock donation insert
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    // Mock linking donation to user
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    const res = await request(app).post('/api/donations').send({
      donation_type: 'monetary',
      amount: '100',
      email: 'existing@example.com'
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Donation recorded');
  });

  it('POST /api/donations - should handle linking error', async () => {
    // Mock finding existing user
    pool.query.mockResolvedValueOnce([[{ id_user: 1 }]]);
    // Mock donation insert
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    // Mock linking failure
    pool.query.mockRejectedValueOnce(new Error('Link error'));
    
    const res = await request(app).post('/api/donations').send({
      donation_type: 'monetary',
      amount: '100',
      email: 'existing@example.com'
    });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
}); 
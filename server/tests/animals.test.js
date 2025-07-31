const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/animals', require('../routes/animals'));

describe('Animals API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/animals - should return animals', async () => {
    pool.query.mockResolvedValueOnce([[{ id_animal: 1, name: 'Buddy' }]]);
    const res = await request(app).get('/api/animals');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Buddy');
  });

  it('POST /api/animals - should add animal with valid data', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/animals').send({ 
      name: 'Max', 
      species: 'Dog', 
      age: 2, 
      status: 'available',
      sex: 'male'
    });
    expect(res.status).toBe(201);
  });

  it('POST /api/animals - should reject empty name', async () => {
    const res = await request(app).post('/api/animals').send({ 
      name: '', 
      species: 'Dog', 
      age: 2, 
      status: 'available' 
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toContain('Animal name is required and must be under 100 characters');
  });

  it('POST /api/animals - should reject empty species', async () => {
    const res = await request(app).post('/api/animals').send({ 
      name: 'Max', 
      species: '', 
      age: 2, 
      status: 'available' 
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toContain('Species is required and must be under 100 characters');
  });

  it('POST /api/animals - should reject invalid age', async () => {
    const res = await request(app).post('/api/animals').send({ 
      name: 'Max', 
      species: 'Dog', 
      age: -5, 
      status: 'available' 
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toContain('Age must be a valid number between 0 and 50');
  });

  it('POST /api/animals - should reject invalid status', async () => {
    const res = await request(app).post('/api/animals').send({ 
      name: 'Max', 
      species: 'Dog', 
      age: 2, 
      status: 'invalid_status' 
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toContain('Status must be available, adopted, or surrendered');
  });

  it('POST /api/animals - should reject invalid sex', async () => {
    const res = await request(app).post('/api/animals').send({ 
      name: 'Max', 
      species: 'Dog', 
      age: 2, 
      status: 'available',
      sex: 'invalid_sex'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toContain('Sex must be male, female, or unknown');
  });

  it('POST /api/animals - should accept valid sex values', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/animals').send({ 
      name: 'Max', 
      species: 'Dog', 
      age: 2, 
      status: 'available',
      sex: 'male'
    });
    expect(res.status).toBe(201);
  });

  it('PUT /api/animals/:id - should update animal with valid data', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/animals/1').send({ 
      name: 'Maximus',
      species: 'Dog',
      age: 3,
      status: 'available'
    });
    expect(res.status).toBe(200);
  });

  it('PUT /api/animals/:id - should reject invalid data', async () => {
    const res = await request(app).put('/api/animals/1').send({ 
      name: '',
      species: 'Dog',
      age: 60,
      status: 'invalid'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('DELETE /api/animals/:id - should delete animal', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/animals/1');
    expect(res.status).toBe(200);
  });

  it('GET /api/animals - db error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/animals');
    expect(res.status).toBe(500);
  });
}); 
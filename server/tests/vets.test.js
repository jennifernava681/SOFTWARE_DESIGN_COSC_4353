const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../middleware/role', () => () => (req, res, next) => next());
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/vets', require('../routes/vets'));

describe('Vets API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/vets - should return all vets', async () => {
    pool.query.mockResolvedValueOnce([[{ id_user: 1, name: 'Dr. Vet' }]]);
    const res = await request(app).get('/api/vets');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Dr. Vet');
  });

  it('GET /api/vets/1 - should return vet by id', async () => {
    pool.query.mockResolvedValueOnce([[{ id_user: 1, name: 'Dr. Vet' }]]);
    const res = await request(app).get('/api/vets/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Dr. Vet');
  });

  it('POST /api/vets - should create vet', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/vets').send({ name: 'New Vet', email: 'vet@x.com', password: 'pw' });
    expect(res.status).toBe(201);
  });

  it('PUT /api/vets/1 - should update vet', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/vets/1').send({ name: 'Updated Vet', email: 'u@x.com' });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/vets/1 - should delete vet', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/vets/1');
    expect(res.status).toBe(200);
  });

  it('POST /api/vets/medical-record - should add medical record', async () => {
    pool.query.mockResolvedValueOnce([[{ maxId: 1 }]]).mockResolvedValueOnce([{}]);
    const res = await request(app).post('/api/vets/medical-record').send({ record_type: 'exam', record_date: '2024-06-01', created_at: '2024-06-01', note: 'Healthy', animal_id: 1 });
    expect(res.status).toBe(201);
  });

  // Additional tests for better coverage
  it('GET /api/vets/999 - should return 404 for non-existent vet', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/vets/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Vet not found');
  });

  it('POST /api/vets - should reject missing required fields', async () => {
    const res = await request(app).post('/api/vets').send({ 
      name: 'New Vet' 
      // missing email and password
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Missing required fields');
  });

  it('PUT /api/vets/999 - should return 404 for non-existent vet', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).put('/api/vets/999').send({ 
      name: 'Updated Vet', 
      email: 'u@x.com' 
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Vet not found');
  });

  it('DELETE /api/vets/999 - should return 404 for non-existent vet', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).delete('/api/vets/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Vet not found');
  });

  it('should handle database errors gracefully', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).get('/api/vets');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('POST /api/vets - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).post('/api/vets').send({ 
      name: 'New Vet', 
      email: 'vet@x.com', 
      password: 'pw' 
    });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('PUT /api/vets/1 - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).put('/api/vets/1').send({ 
      name: 'Updated Vet', 
      email: 'u@x.com' 
    });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('DELETE /api/vets/1 - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).delete('/api/vets/1');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('POST /api/vets/medical-record - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).post('/api/vets/medical-record').send({ 
      record_type: 'exam', 
      record_date: '2024-06-01', 
      created_at: '2024-06-01', 
      note: 'Healthy', 
      animal_id: 1 
    });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
}); 
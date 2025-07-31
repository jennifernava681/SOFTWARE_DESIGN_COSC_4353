const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/volunteers', require('../routes/volunteers'));

describe('Volunteers API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/volunteers - should return all volunteers', async () => {
    pool.query.mockResolvedValueOnce([[{ id_user: 1, name: 'Test Volunteer' }]]);
    const res = await request(app).get('/api/volunteers');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Test Volunteer');
  });

  it('GET /api/volunteers/1 - should return volunteer by id', async () => {
    pool.query.mockResolvedValueOnce([[{ id_user: 1, name: 'Test Volunteer' }]]);
    const res = await request(app).get('/api/volunteers/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Volunteer');
  });

  it('GET /api/volunteers/999 - should return 404 for non-existent volunteer', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/volunteers/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Volunteer not found');
  });

  it('POST /api/volunteers - should create volunteer', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/volunteers').send({ 
      name: 'New', 
      email: 'new@x.com', 
      password: 'pw',
      adrees_idadrees_id: 1,
      adrees_state_state_id: 1
    });
    expect(res.status).toBe(201);
  });

  it('POST /api/volunteers - should reject missing required fields', async () => {
    const res = await request(app).post('/api/volunteers').send({ 
      name: 'New', 
      email: 'new@x.com'
      // missing password
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Missing required fields');
  });

  it('PUT /api/volunteers/1 - should update volunteer', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/volunteers/1').send({ 
      name: 'Updated', 
      email: 'u@x.com',
      adrees_idadrees_id: 1,
      adrees_state_state_id: 1
    });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/volunteers/1 - should delete volunteer', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/volunteers/1');
    expect(res.status).toBe(200);
  });

  it('POST /api/volunteers/apply - should submit application', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 3 }]);
    const res = await request(app).post('/api/volunteers/apply').send({ 
      availability_date: '2024-06-01', 
      skills: 'dog_handling', 
      motivation: 'help', 
      request_date: '2024-05-01', 
      availability_time: '10:00' 
    });
    expect(res.status).toBe(201);
  });

  it('POST /api/volunteers/tasks - should assign task', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 4 }]);
    const res = await request(app).post('/api/volunteers/tasks').send({ 
      task_name: 'Walk dogs', 
      description: 'Walk the dogs', 
      task_date: '2024-06-01', 
      status: 'pending', 
      USERS_id_user: 1 
    });
    expect(res.status).toBe(201);
  });

  it('GET /api/volunteers/tasks/my - should return my tasks', async () => {
    pool.query.mockResolvedValueOnce([[{ task_id: 1, task_name: 'Walk dogs' }]]);
    const res = await request(app).get('/api/volunteers/tasks/my');
    expect(res.status).toBe(200);
    expect(res.body[0].task_name).toBe('Walk dogs');
  });

  it('GET /api/volunteers/applications - should return all applications', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, motivation: 'help animals' }]]);
    const res = await request(app).get('/api/volunteers/applications');
    expect(res.status).toBe(200);
  });

  it('GET /api/volunteers - should handle database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database connection failed'));
    const res = await request(app).get('/api/volunteers');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('POST /api/volunteers - should handle database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database connection failed'));
    const res = await request(app).post('/api/volunteers').send({ 
      name: 'Test', 
      email: 'test@example.com', 
      password: 'password',
      adrees_idadrees_id: 1,
      adrees_state_state_id: 1
    });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
}); 
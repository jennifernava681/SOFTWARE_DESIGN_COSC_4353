const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Set up JWT_SECRET for testing
process.env.JWT_SECRET = 'test-secret-key';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock the database pool
jest.mock('../db', () => ({
  query: jest.fn()
}));

// Mock the auth middleware
jest.mock('../middleware/auth', () => {
  return function mockAuth(req, res, next) {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'No token provided' });
    }
    try {
      const token = req.headers.authorization.split(' ')[1];
      const mockSecret = 'test-secret';
      const decoded = { id_user: 1, role: 'user' };
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
});

// Generate test tokens
const userToken = 'test-user-token';
const adminToken = 'test-admin-token';

describe('Users API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset mock user role
    // mockUserRole = 'manager'; // This line is removed as per the new_code
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      pool.query
        .mockResolvedValueOnce([[]]) // Check for existing email
        .mockResolvedValueOnce([{ insertId: 1 }]); // Insert user

      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'public',
        adrees_idadrees_id: 1,
        adrees_state_state_id: 1
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered');
    });

    it('should handle duplicate email', async () => {
      pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // Existing user found

      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
          role: 'public',
          adrees_idadrees_id: 1,
          adrees_state_state_id: 1
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email already registered');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields');
    });
  });

  describe('POST /login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id_user: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'public',
        password_hash: 'hashedpassword'
      };
      pool.query.mockResolvedValueOnce([[mockUser]]);
      bcrypt.compare.mockResolvedValueOnce(true);

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toEqual({
        id_user: mockUser.id_user,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password_hash);
    });

    it('should reject invalid credentials', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpass'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /profile', () => {
    it('should get user profile', async () => {
      const mockProfile = {
        id_user: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'public',
        sex: 'M',
        date_of_birth: '1990-01-01',
        Security_question: 'What is your favorite color?',
        adrees_idadrees_id: 1,
        adrees_state_state_id: 1,
        line_1: '123 Main St',
        line_2: 'Apt 4B',
        city: 'Houston',
        state: 'TX'
      };
      pool.query
        .mockResolvedValueOnce([[mockProfile]]) // Get user profile
        .mockResolvedValueOnce([[{ skill_name: 'animal care' }]]); // Get user skills

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockProfile,
        skills: ['animal care']
      });
    });

    it('should handle non-existent user', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /profile', () => {
    it('should update user profile', async () => {
      pool.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update basic info
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete old skills
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Insert new skills
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Update preferences

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '1234567890',
        skills: ['animal care', 'transport'],
        preferences: { notifications: true }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer testtoken')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
    });

    it('should validate update data', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer testtoken')
        .send({
          name: '', // Invalid name
          email: 'invalid-email', // Invalid email
          phone: '123' // Invalid phone
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body).toHaveProperty('errors');
    });
  });
});

describe('User Availability Management', () => {
  test('should get user availability', async () => {
    const mockAvailability = [
      { day_of_week: 1, start_time: '09:00', end_time: '17:00' },
      { day_of_week: 3, start_time: '10:00', end_time: '18:00' }
    ];

    pool.query.mockImplementation(() => [mockAvailability]);

    const res = await request(app)
      .get('/api/users/availability')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('day_of_week');
    expect(res.body[0]).toHaveProperty('start_time');
    expect(res.body[0]).toHaveProperty('end_time');
  });

  test('should update user availability', async () => {
    const newAvailability = [
      { day: 1, start: '09:00', end: '17:00' },
      { day: 2, start: '10:00', end: '16:00' }
    ];

    pool.query.mockImplementation(() => [[]]);

    const res = await request(app)
      .put('/api/users/availability')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ availability: newAvailability });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Availability updated');
  });

  test('should reject invalid availability format', async () => {
    const invalidAvailability = 'not an array';

    const res = await request(app)
      .put('/api/users/availability')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ availability: invalidAvailability });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Availability must be an array');
  });

  test('should handle database errors when updating availability', async () => {
    const availability = [
      { day: 1, start: '09:00', end: '17:00' }
    ];

    pool.query.mockImplementation(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .put('/api/users/availability')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ availability });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  test('should require authentication for availability endpoints', async () => {
    const res1 = await request(app).get('/api/users/availability');
    expect(res1.status).toBe(401);

    const res2 = await request(app)
      .put('/api/users/availability')
      .send({ availability: [] });
    expect(res2.status).toBe(401);
  });
}); 
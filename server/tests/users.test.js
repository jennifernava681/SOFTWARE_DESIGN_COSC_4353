jest.mock('../middleware/auth', () => {
  return jest.fn((req, res, next) => {
    req.user = { id_user: 1, role: 'public' };
    next();
  });
});

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the database
jest.mock('../db', () => ({
  query: jest.fn()
}));

const pool = require('../db');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/users', require('../routes/users'));

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'public',
        address: '123 Main St',
        city: 'Test City',
        state: 'TX',
        adrees_idadrees_id: 1,
        adrees_state_state_id: 1
      };

      // Mock bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      
      // Mock database queries
      pool.query
        .mockResolvedValueOnce([[]]) // No existing user
        .mockResolvedValueOnce([{ insertId: 1 }]); // Insert successful

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
        // Missing password, address, city, state
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields');
    });

    it('should return 409 for existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'public',
        address: '123 Main St',
        city: 'Test City',
        state: 'TX',
        adrees_idadrees_id: 1,
        adrees_state_state_id: 1
      };

      // Mock existing user
      pool.query.mockResolvedValueOnce([[{ id: 1, email: 'existing@example.com' }]]);

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email already registered');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id_user: 1,
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 'public'
      };

      // Mock database query
      pool.query.mockResolvedValueOnce([[mockUser]]);
      
      // Mock bcrypt.compare
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      
      // Mock jwt.sign
      jest.spyOn(jwt, 'sign').mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return 400 for missing credentials', async () => {
      const loginData = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing email or password');
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Mock user not found
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for wrong password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id_user: 1,
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 'public'
      };

      // Mock user found but wrong password
      pool.query.mockResolvedValueOnce([[mockUser]]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id_user: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'public',
        sex: 'male',
        date_of_birth: '1990-01-01',
        Security_question: 'What is your favorite color?',
        adrees_idadrees_id: 1,
        adrees_state_state_id: 1,
        line_1: '123 Main St',
        line_2: 'Apt 1',
        city: 'Test City',
        state: 'TX'
      };

      const mockSkills = [
        { skill_name: 'dog_handling' },
        { skill_name: 'first_aid' }
      ];

      // Mock the complex JOIN query
      pool.query.mockResolvedValueOnce([[mockUser]]);
      // Mock the skills query
      pool.query.mockResolvedValueOnce([mockSkills]);

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test User');
      expect(response.body.skills).toEqual(['dog_handling', 'first_aid']);
    });

    it('should return 404 for non-existent user', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '1234567890',
        skills: ['dog_handling', 'first_aid']
      };

      pool.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update user
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete skills
        .mockResolvedValueOnce([{ insertId: 1 }]) // Insert skill 1
        .mockResolvedValueOnce([{ insertId: 2 }]); // Insert skill 2

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer mockToken')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
    });

    it('should return 400 for invalid data', async () => {
      const updateData = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid email format
        phone: '123' // Invalid phone
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer mockToken')
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });
  });
}); 
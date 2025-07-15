const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

describe('Auth Middleware', () => {
  let app;
  const JWT_SECRET = 'testsecret';

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  describe('Token Validation', () => {
    beforeEach(() => {
      app.use(auth);
      app.get('/protected', (req, res) => {
        res.json({ message: 'Access granted', user: req.user });
      });
    });

    it('should allow access with a valid token', async () => {
      const token = jwt.sign({ id_user: 1, role: 'manager' }, JWT_SECRET);
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Access granted');
      expect(response.body.user.id_user).toBe(1);
      expect(response.body.user.role).toBe('manager');
    });

    it('should deny access with no token', async () => {
      const response = await request(app)
        .get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('should deny access with malformed token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'NotBearer token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('should deny access with an invalid token', async () => {
      const response = await request(app)
        .get('/api/test-auth')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should deny access with an expired token', async () => {
      const token = jwt.sign({ id: 1, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '-1h' });
      const response = await request(app)
        .get('/api/test-auth')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token expired');
    });
  });

  describe('Token Payload', () => {
    beforeEach(() => {
      app.use(auth);
      app.get('/user-info', (req, res) => {
        res.json({ user: req.user });
      });
    });

    it('should properly decode user information from token', async () => {
      const userData = {
        id_user: 1,
        role: 'manager',
        email: 'test@example.com',
        name: 'Test User'
      };
      const token = jwt.sign(userData, JWT_SECRET);

      const response = await request(app)
        .get('/user-info')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual(expect.objectContaining(userData));
    });

    it('should handle tokens with missing required fields', async () => {
      const token = jwt.sign({ name: 'Test User' }, JWT_SECRET); // Missing id_user and role

      const response = await request(app)
        .get('/user-info')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200); // The middleware doesn't validate payload contents
      expect(response.body.user.id_user).toBeUndefined();
      expect(response.body.user.role).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      app.use(auth);
      app.get('/error-test', (req, res) => {
        res.json({ message: 'Success' });
      });
    });

    it('should handle malformed JWT gracefully', async () => {
      const response = await request(app)
        .get('/api/test-auth')
        .set('Authorization', 'Bearer not.a.jwt');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should handle empty Authorization header gracefully', async () => {
      const response = await request(app)
        .get('/error-test')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });
  });
}); 
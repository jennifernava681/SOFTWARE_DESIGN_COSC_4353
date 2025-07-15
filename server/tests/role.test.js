const express = require('express');
const request = require('supertest');
const restrictTo = require('../middleware/role');

describe('Role Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Manager Role', () => {
    it('should allow access for manager role', async () => {
      app.use((req, res, next) => {
        req.user = { id: 1, role: 'manager' };
        next();
      });

      app.get('/manager-only', restrictTo('manager'), (req, res) => {
        res.json({ message: 'Manager access granted' });
      });

      const response = await request(app).get('/manager-only');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Manager access granted');
    });

    it('should deny access for non-manager role', async () => {
      app.use((req, res, next) => {
        req.user = { id: 2, role: 'volunteer' };
        next();
      });

      app.get('/manager-only', restrictTo('manager'), (req, res) => {
        res.json({ message: 'Should not get here' });
      });

      const response = await request(app).get('/manager-only');
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied. Insufficient role.');
    });
  });

  describe('Volunteer Role', () => {
    it('should allow access for volunteer role', async () => {
      app.use((req, res, next) => {
        req.user = { id: 2, role: 'volunteer' };
        next();
      });

      app.get('/volunteer-only', restrictTo('volunteer'), (req, res) => {
        res.json({ message: 'Volunteer access granted' });
      });

      const response = await request(app).get('/volunteer-only');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Volunteer access granted');
    });

    it('should deny access for non-volunteer role', async () => {
      app.use((req, res, next) => {
        req.user = { id: 3, role: 'public' };
        next();
      });

      app.get('/volunteer-only', restrictTo('volunteer'), (req, res) => {
        res.json({ message: 'Should not get here' });
      });

      const response = await request(app).get('/volunteer-only');
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied. Insufficient role.');
    });
  });

  describe('Multiple Roles', () => {
    it('should allow access for any allowed role', async () => {
      app.use((req, res, next) => {
        req.user = { id: 2, role: 'volunteer' };
        next();
      });

      app.get('/shared-access', restrictTo('manager', 'volunteer'), (req, res) => {
        res.json({ message: 'Access granted' });
      });

      const response = await request(app).get('/shared-access');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Access granted');
    });

    it('should deny access for non-allowed role', async () => {
      app.use((req, res, next) => {
        req.user = { id: 3, role: 'public' };
        next();
      });

      app.get('/shared-access', restrictTo('manager', 'volunteer'), (req, res) => {
        res.json({ message: 'Should not get here' });
      });

      const response = await request(app).get('/shared-access');
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied. Insufficient role.');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user object', async () => {
      app.get('/test', restrictTo('manager'), (req, res) => {
        res.json({ message: 'Should not get here' });
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(403);
    });

    it('should handle missing role property', async () => {
      app.use((req, res, next) => {
        req.user = { id: 1 }; // No role property
        next();
      });

      app.get('/test', restrictTo('manager'), (req, res) => {
        res.json({ message: 'Should not get here' });
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(403);
    });

    it('should handle empty roles array', async () => {
      app.use((req, res, next) => {
        req.user = { id: 1, role: 'manager' };
        next();
      });

      app.get('/test', restrictTo(), (req, res) => {
        res.json({ message: 'Should not get here' });
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(403);
    });
  });
}); 
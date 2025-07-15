const request = require('supertest');
const app = require('../app');
const pool = require('../db');

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
      // Use token to determine role
      const role = token === 'manager-token' ? 'manager' : 'volunteer';
      req.user = { id_user: 1, role };
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
});

// Test tokens
const volunteerToken = 'volunteer-token';
const managerToken = 'manager-token';

describe('Volunteers API', () => {
  beforeEach(() => {
    pool.query.mockClear();
  });

  describe('POST /apply', () => {
    test('should submit volunteer application', async () => {
      const application = {
        availability_date: '2024-06-01',
        availability_time: '10:00',
        skills: ['animal care', 'cleaning'],
        motivation: 'I love animals'
      };

      const mockResult = { insertId: 1 };
      pool.query.mockResolvedValueOnce([mockResult]);

      const res = await request(app)
        .post('/api/volunteers/apply')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(application);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Volunteer application submitted');
      expect(res.body.id).toBe(mockResult.insertId);
    });

    test('should validate required fields', async () => {
      const invalidApplication = {
        skills: 'not an array',
        motivation: 'I love animals'
      };

      const res = await request(app)
        .post('/api/volunteers/apply')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(invalidApplication);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toContain('Availability date is required');
      expect(res.body.errors).toContain('Availability time is required');
      expect(res.body.errors).toContain('Skills must be an array');
    });

    test('should handle database errors', async () => {
      const application = {
        availability_date: '2024-06-01',
        availability_time: '10:00',
        skills: ['animal care'],
        motivation: 'I love animals'
      };

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/volunteers/apply')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(application);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('GET /matches/:eventId', () => {
    test('should match volunteers with event', async () => {
      const mockEvent = {
        id: 1,
        title: 'Pet Care Day',
        date: '2024-06-01',
        time: '10:00',
        required_skills: 'animal care,cleaning'
      };

      const mockVolunteers = [
        {
          id_user: 1,
          name: 'John Doe',
          email: 'john@example.com',
          user_skills: 'animal care',
          matching_skills: 1
        }
      ];

      const mockAvailability = [
        {
          user_id: 1,
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00'
        }
      ];

      pool.query.mockImplementation((sql, params) => {
        if (sql.includes('SELECT e.*')) {
          return [[mockEvent]];
        }
        if (sql.includes('SELECT DISTINCT u.id_user')) {
          return [mockVolunteers];
        }
        if (sql.includes('user_availability')) {
          return [mockAvailability];
        }
        return [[]];
      });

      const res = await request(app)
        .get('/api/volunteers/matches/1')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('event');
      expect(res.body).toHaveProperty('matched_volunteers');
      expect(res.body.matched_volunteers).toHaveLength(1);
      expect(res.body.matched_volunteers[0].match_percentage).toBe(50);
    });

    test('should handle event not found', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .get('/api/volunteers/matches/999')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Event not found');
    });

    test('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .get('/api/volunteers/matches/1')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('POST /assign/:eventId', () => {
    test('should assign volunteers to event', async () => {
      const mockEvent = {
        id: 1,
        max_volunteers: 5,
        current_volunteers: 2
      };

      pool.query.mockImplementation((sql) => {
        if (sql.includes('SELECT id FROM events')) {
          return [[{ id: 1 }]];
        }
        if (sql.includes('SELECT max_volunteers')) {
          return [[mockEvent]];
        }
        return [[{ insertId: 1 }]];
      });

      const res = await request(app)
        .post('/api/volunteers/assign/1')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ volunteerIds: [1, 2] });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Volunteers assigned successfully');
    });

    test('should require manager role', async () => {
      const res = await request(app)
        .post('/api/volunteers/assign/1')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({ volunteerIds: [1, 2] });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Only managers can assign volunteers');
    });

    test('should validate volunteer IDs', async () => {
      const res = await request(app)
        .post('/api/volunteers/assign/1')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ volunteerIds: 'not-an-array' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Volunteer IDs must be an array');
    });

    test('should handle event not found', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .post('/api/volunteers/assign/999')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ volunteerIds: [1, 2] });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Event not found');
    });

    test('should handle event at capacity', async () => {
      const mockEvent = {
        id: 1,
        max_volunteers: 3,
        current_volunteers: 2
      };

      pool.query.mockImplementation((sql) => {
        if (sql.includes('SELECT id FROM events')) {
          return [[{ id: 1 }]];
        }
        if (sql.includes('SELECT max_volunteers')) {
          return [[mockEvent]];
        }
        return [[]];
      });

      const res = await request(app)
        .post('/api/volunteers/assign/1')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ volunteerIds: [1, 2] });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Too many volunteers for this event');
    });

    test('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/volunteers/assign/1')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ volunteerIds: [1, 2] });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('GET /history/:userId', () => {
    test('should get volunteer history', async () => {
      const mockUser = { id_user: 1 };
      const mockHistory = [{
        id: 1,
        title: 'Adoption Day',
        date: '2024-06-01',
        time: '10:00',
        location: 'Houston',
        registration_date: '2024-05-01',
        status: 'completed',
        required_skills: 'animal care,transport'
      }];

      pool.query.mockImplementation((sql) => {
        if (sql.includes('SELECT id_user FROM users')) {
          return [[mockUser]];
        }
        if (sql.includes('JOIN events e')) {
          return [mockHistory];
        }
        return [[]];
      });

      const res = await request(app)
        .get('/api/volunteers/history/1')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(res.body[0]).toEqual({
        ...mockHistory[0],
        required_skills: ['animal care', 'transport']
      });
    });

    test('should handle non-existent user', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .get('/api/volunteers/history/999')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    test('should handle empty history', async () => {
      pool.query.mockImplementation((sql) => {
        if (sql.includes('SELECT id_user FROM users')) {
          return [[{ id_user: 1 }]];
        }
        return [[]];
      });

      const res = await request(app)
        .get('/api/volunteers/history/1')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .get('/api/volunteers/history/1')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('GET /performance/:userId', () => {
    test('should get volunteer performance metrics', async () => {
      const mockEvents = [
        {
          id: 1,
          title: 'Event 1',
          date: '2024-03-01',
          urgency: 'high',
          registration_type: 'Assigned'
        },
        {
          id: 2,
          title: 'Event 2',
          date: '2024-03-15',
          urgency: 'medium',
          registration_type: 'Self-Registered'
        }
      ];

      const mockSkills = [
        { skill_name: 'grooming', proficiency_level: 'expert' },
        { skill_name: 'handling', proficiency_level: 'intermediate' }
      ];

      pool.query.mockImplementation((sql) => {
        if (sql.includes('JOIN events e')) {
          return [mockEvents];
        }
        if (sql.includes('user_skills')) {
          return [mockSkills];
        }
        return [[]];
      });

      const res = await request(app)
        .get('/api/volunteers/performance/1')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total_events', 2);
      expect(res.body).toHaveProperty('assigned_events', 1);
      expect(res.body).toHaveProperty('self_registered_events', 1);
      expect(res.body).toHaveProperty('reliability_score');
      expect(res.body).toHaveProperty('skills');
      expect(res.body.skills).toHaveLength(2);
    });

    test('should require manager role', async () => {
      const res = await request(app)
        .get('/api/volunteers/performance/1')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Only managers can view performance metrics');
    });

    test('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .get('/api/volunteers/performance/1')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('GET /statistics', () => {
    test('should get volunteer statistics', async () => {
      const mockStats = {
        volunteerCount: [[{ count: 50 }]],
        activeVolunteers: [[{ count: 30 }]],
        monthlyEvents: [[{ count: 20 }]],
        topVolunteers: [[
          {
            id_user: 1,
            name: 'John Doe',
            events_attended: 10,
            assigned_events: 8,
            reliability_score: 80
          },
          {
            id_user: 2,
            name: 'Jane Smith',
            events_attended: 8,
            assigned_events: 6,
            reliability_score: 75
          }
        ]]
      };

      pool.query.mockImplementation((sql) => {
        if (sql.includes('COUNT(*) as count FROM users')) {
          return mockStats.volunteerCount;
        }
        if (sql.includes('DATE_SUB(NOW(), INTERVAL 30 DAY)')) {
          return mockStats.activeVolunteers;
        }
        if (sql.includes('DATE_FORMAT(NOW()')) {
          return mockStats.monthlyEvents;
        }
        if (sql.includes('COUNT(er.event_id) as events_attended')) {
          return mockStats.topVolunteers;
        }
        return [[]];
      });

      const res = await request(app)
        .get('/api/volunteers/statistics')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total_volunteers', 50);
      expect(res.body).toHaveProperty('active_volunteers', 30);
      expect(res.body).toHaveProperty('monthly_events', 20);
      expect(res.body).toHaveProperty('top_performers');
      expect(res.body.top_performers).toHaveLength(2);
      expect(res.body.top_performers[0]).toHaveProperty('reliability_score');
    });

    test('should require manager role', async () => {
      const res = await request(app)
        .get('/api/volunteers/statistics')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Only managers can view statistics');
    });

    test('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .get('/api/volunteers/statistics')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });
}); 
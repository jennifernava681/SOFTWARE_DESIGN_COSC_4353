const request = require('supertest');
const app = require('../app');

// Mock the auth middleware
let mockUserRole = 'manager';
jest.mock('../middleware/auth', () => {
  return (req, res, next) => {
    req.user = {
      id_user: 1,
      role: mockUserRole
    };
    next();
  };
});

// Mock the database pool
jest.mock('../db', () => {
  return {
    query: jest.fn()
  };
});

const pool = require('../db');

describe('Events API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset mock user role
    mockUserRole = 'manager';
  });

  describe('POST /', () => {
    it('should create a new event as manager', async () => {
      pool.query
        .mockResolvedValueOnce([{ insertId: 1 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const eventData = {
        title: 'Adoption Day',
        description: 'Help pets find homes',
        date: '2024-06-01',
        time: '10:00',
        location: 'Houston',
        urgency: 'high',
        required_skills: ['animal care'],
        max_volunteers: 10
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer testtoken')
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Event created successfully');
      expect(response.body).toHaveProperty('event_id');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer testtoken')
        .send({
          title: 'Test Event',
          // Missing other required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body).toHaveProperty('errors');
    });

    it('should require manager role', async () => {
      mockUserRole = 'volunteer';

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer testtoken')
        .send({
          title: 'Test Event',
          description: 'Test',
          date: '2024-06-01',
          time: '10:00',
          location: 'Test',
          urgency: 'high',
          required_skills: ['skill'],
          max_volunteers: 10
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Only managers can create events');
    });
  });

  describe('GET /', () => {
    it('should get all events', async () => {
      const mockEvents = [{
        id: 1,
        title: 'Adoption Day',
        date: '2024-06-01',
        status: 'upcoming',
        required_skills: null // This will be transformed to [] by the route
      }];
      pool.query.mockResolvedValueOnce([mockEvents]);

      const response = await request(app)
        .get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{
        ...mockEvents[0],
        required_skills: []
      }]);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/events');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('GET /:id', () => {
    it('should get event details', async () => {
      const mockEvent = {
        id: 1,
        title: 'Adoption Day',
        description: 'Help pets find homes',
        date: '2024-06-01',
        time: '10:00',
        location: 'Houston',
        urgency: 'high',
        required_skills: null, // This will be transformed to [] by the route
        registered_volunteers: 0
      };
      pool.query.mockResolvedValueOnce([[mockEvent]]);

      const response = await request(app)
        .get('/api/events/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockEvent,
        required_skills: []
      });
    });

    it('should handle non-existent event', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .get('/api/events/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('POST /:id/register', () => {
    it('should register for an event', async () => {
      pool.query
        .mockResolvedValueOnce([[]]) // Check not already registered
        .mockResolvedValueOnce([[{ max_volunteers: 10, current_volunteers: 5 }]]) // Check capacity
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Register

      const response = await request(app)
        .post('/api/events/1/register')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Registered for event successfully');
    });

    it('should handle full event', async () => {
      pool.query
        .mockResolvedValueOnce([[]]) // Check not already registered
        .mockResolvedValueOnce([[{ max_volunteers: 10, current_volunteers: 10 }]]); // Check capacity

      const response = await request(app)
        .post('/api/events/1/register')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Event is full');
    });

    it('should handle already registered', async () => {
      pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // Already registered

      const response = await request(app)
        .post('/api/events/1/register')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Already registered for this event');
    });
  });

  describe('PUT /:id', () => {
    it('should update event details as manager', async () => {
      pool.query
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const updateData = {
        title: 'Updated Event',
        description: 'Updated description',
        date: '2024-06-02',
        time: '11:00',
        location: 'Updated location',
        urgency: 'medium',
        required_skills: ['skill1', 'skill2'],
        max_volunteers: 15
      };

      const response = await request(app)
        .put('/api/events/1')
        .set('Authorization', 'Bearer testtoken')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event updated successfully');
    });

    it('should require manager role for updates', async () => {
      mockUserRole = 'volunteer';

      const response = await request(app)
        .put('/api/events/1')
        .set('Authorization', 'Bearer testtoken')
        .send({
          title: 'Updated Event',
          description: 'Updated description',
          date: '2024-06-02',
          time: '11:00',
          location: 'Updated location',
          urgency: 'medium'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Only managers can update events');
    });
  });

  describe('DELETE /:id', () => {
    it('should delete an event as manager', async () => {
      pool.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // Event exists check
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete skills
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete registrations
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete event

      const response = await request(app)
        .delete('/api/events/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event deleted successfully');
    });

    it('should handle non-existent event', async () => {
      pool.query.mockResolvedValueOnce([[]]); // Event doesn't exist

      const response = await request(app)
        .delete('/api/events/999')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });

    it('should require manager role for deletion', async () => {
      mockUserRole = 'volunteer';

      const response = await request(app)
        .delete('/api/events/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Only managers can delete events');
    });
  });
}); 
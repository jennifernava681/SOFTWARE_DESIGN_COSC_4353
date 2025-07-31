const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());

jest.mock('../db', () => ({ query: jest.fn() }));
jest.mock('../middleware/auth', () => jest.fn());
const pool = require('../db');
const auth = require('../middleware/auth');

// Helper to set user role for each test
function setUserRole(role) {
  auth.mockImplementation((req, res, next) => {
    req.user = { id_user: 1, role };
    next();
  });
}

app.use('/api/events', require('../routes/events'));

describe('Events API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/events', () => {
    it('should return all events', async () => {
      setUserRole('manager');
      const mockEvents = [
        { id: 1, title: 'Event 1', description: 'Description 1', date: '2024-01-01', location: 'Location 1', required_skills: 'dog_handling,first_aid' },
        { id: 2, title: 'Event 2', description: 'Description 2', date: '2024-01-02', location: 'Location 2', required_skills: 'fundraising' }
      ];
      pool.query.mockResolvedValueOnce([mockEvents]);
      const response = await request(app).get('/api/events').set('Authorization', 'Bearer mockToken');
      expect(response.status).toBe(200);
      // The route will split the skills string into an array
      expect(response.body[0].required_skills).toEqual(['dog_handling', 'first_aid']);
      expect(response.body[1].required_skills).toEqual(['fundraising']);
    });
    it('should handle database error', async () => {
      setUserRole('manager');
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      const response = await request(app).get('/api/events').set('Authorization', 'Bearer mockToken');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('POST /api/events', () => {
    it('should create event with valid data', async () => {
      setUserRole('manager');
      const eventData = {
        title: 'New Event',
        description: 'Event description',
        date: '2024-06-01',
        time: '10:00:00',
        location: 'Event Location',
        urgency: 'medium',
        max_volunteers: 10,
        required_skills: ['dog_handling', 'first_aid']
      };
      pool.query
        .mockResolvedValueOnce([{ insertId: 1 }]) // Event insert
        .mockResolvedValueOnce([{ insertId: 1 }]) // Skill 1 insert
        .mockResolvedValueOnce([{ insertId: 2 }]); // Skill 2 insert
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer mockToken')
        .send(eventData);
      expect(response.status).toBe(201);
      expect(response.body.message).toMatch(/Event created/);
    });
    it('should reject invalid event data', async () => {
      setUserRole('manager');
      const invalidEventData = {
        title: '',
        description: 'Description',
        date: 'invalid-date',
        location: ''
      };
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer mockToken')
        .send(invalidEventData);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });
    it('should return 403 if not manager', async () => {
      setUserRole('volunteer');
      const eventData = {
        title: 'New Event',
        description: 'Event description',
        date: '2024-06-01',
        time: '10:00:00',
        location: 'Event Location',
        urgency: 'medium',
        max_volunteers: 10,
        required_skills: ['dog_handling', 'first_aid']
      };
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer mockToken')
        .send(eventData);
      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return specific event', async () => {
      setUserRole('manager');
      const mockEvent = { 
        id: 1, 
        title: 'Event 1', 
        description: 'Description 1', 
        required_skills: 'dog_handling,first_aid',
        registered_volunteers: 5
      };
      pool.query.mockResolvedValueOnce([[mockEvent]]);
      const response = await request(app).get('/api/events/1').set('Authorization', 'Bearer mockToken');
      expect(response.status).toBe(200);
      expect(response.body.required_skills).toEqual(['dog_handling', 'first_aid']);
      expect(response.body.registered_volunteers).toBe(5);
    });
    it('should return 404 for non-existent event', async () => {
      setUserRole('manager');
      pool.query.mockResolvedValueOnce([[]]);
      const response = await request(app).get('/api/events/999').set('Authorization', 'Bearer mockToken');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update event with valid data', async () => {
      setUserRole('manager');
      const eventData = {
        title: 'Updated Event',
        description: 'Updated description',
        date: '2024-06-01',
        time: '10:00:00',
        location: 'Updated Location',
        urgency: 'high',
        required_skills: ['dog_handling', 'first_aid'],
        max_volunteers: 15
      };
      pool.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update event
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete skills
        .mockResolvedValueOnce([{ insertId: 1 }]) // Insert skill 1
        .mockResolvedValueOnce([{ insertId: 2 }]); // Insert skill 2
      const response = await request(app)
        .put('/api/events/1')
        .set('Authorization', 'Bearer mockToken')
        .send(eventData);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event updated successfully');
    });
    it('should return 403 if not manager', async () => {
      setUserRole('volunteer');
      const eventData = {
        title: 'Updated Event',
        description: 'Updated description',
        date: '2024-06-01',
        time: '10:00:00',
        location: 'Updated Location',
        urgency: 'high',
        required_skills: ['dog_handling', 'first_aid'],
        max_volunteers: 15
      };
      const response = await request(app)
        .put('/api/events/1')
        .set('Authorization', 'Bearer mockToken')
        .send(eventData);
      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete event', async () => {
      setUserRole('manager');
      pool.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete skills
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete event
      const response = await request(app)
        .delete('/api/events/1')
        .set('Authorization', 'Bearer mockToken');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event deleted successfully');
    });
    it('should return 403 if not manager', async () => {
      setUserRole('volunteer');
      const response = await request(app)
        .delete('/api/events/1')
        .set('Authorization', 'Bearer mockToken');
      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/events/:id/register', () => {
    it('should register user for event', async () => {
      setUserRole('volunteer');
      // Mock event exists
      pool.query.mockResolvedValueOnce([[{
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-06-01'
      }]]);
      // Mock no existing registration
      pool.query.mockResolvedValueOnce([[]]);
      // Mock task creation
      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
      // Mock volunteer history creation
      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
      const response = await request(app)
        .post('/api/events/1/register')
        .set('Authorization', 'Bearer mockToken');
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Successfully registered for event');
    });
    it('should return 404 if event not found', async () => {
      setUserRole('volunteer');
      pool.query.mockResolvedValueOnce([[]]); // Event not found
      const response = await request(app)
        .post('/api/events/999/register')
        .set('Authorization', 'Bearer mockToken');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });
    it('should return 400 if already registered', async () => {
      setUserRole('volunteer');
      // Mock event exists
      pool.query.mockResolvedValueOnce([[{
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-06-01'
      }]]);
      // Mock existing registration
      pool.query.mockResolvedValueOnce([[{ task_id: 1 }]]);
      const response = await request(app)
        .post('/api/events/1/register')
        .set('Authorization', 'Bearer mockToken');
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Already registered for this event');
    });
  });

  describe('GET /api/events/my/registered', () => {
    it('should return user registered events', async () => {
      setUserRole('volunteer');
      const mockEvents = [
        { id: 1, title: 'Event 1', registration_status: 'registered' },
        { id: 2, title: 'Event 2', registration_status: 'attended' }
      ];
      pool.query.mockResolvedValueOnce([mockEvents]);
      const response = await request(app)
        .get('/api/events/my/registered')
        .set('Authorization', 'Bearer mockToken');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockEvents);
    });
  });
}); 
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

describe('Notifications API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset mock user role
    mockUserRole = 'manager';
  });

  describe('GET /', () => {
    it('should get user notifications', async () => {
      const mockNotifications = [{
        notifications_id: 1,
        message: 'Test notification',
        type: 'general',
        is_read: 0,
        created_at: '2024-01-01T00:00:00Z'
      }];
      pool.query.mockResolvedValueOnce([mockNotifications]);

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNotifications);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('PUT /:id/read', () => {
    it('should mark notification as read', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app)
        .put('/api/notifications/1/read')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Notification marked as read');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .put('/api/notifications/1/read')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('PUT /read-all', () => {
    it('should mark all notifications as read', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 5 }]);

      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('All notifications marked as read');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('POST /event-assignment', () => {
    it('should send event assignment notification', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app)
        .post('/api/notifications/event-assignment')
        .set('Authorization', 'Bearer testtoken')
        .send({
          userId: 2,
          eventId: 1,
          eventTitle: 'Test Event'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event assignment notification sent');
    });

    it('should require manager role', async () => {
      mockUserRole = 'volunteer';

      const response = await request(app)
        .post('/api/notifications/event-assignment')
        .set('Authorization', 'Bearer testtoken')
        .send({
          userId: 2,
          eventId: 1,
          eventTitle: 'Test Event'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Only managers can send notifications');
    });

    it('should handle notification failure', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/notifications/event-assignment')
        .set('Authorization', 'Bearer testtoken')
        .send({
          userId: 2,
          eventId: 1,
          eventTitle: 'Test Event'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to send notification');
    });
  });

  describe('POST /event-reminder/:eventId', () => {
    it('should send event reminders', async () => {
      const mockEvent = {
        title: 'Test Event',
        date: '2024-06-01',
        time: '10:00'
      };
      const mockVolunteers = [
        { id_user: 2, name: 'John' },
        { id_user: 3, name: 'Jane' }
      ];

      pool.query
        .mockResolvedValueOnce([[mockEvent]]) // Get event
        .mockResolvedValueOnce([mockVolunteers]) // Get volunteers
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // First notification
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Second notification

      const response = await request(app)
        .post('/api/notifications/event-reminder/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event reminders sent successfully');
      expect(response.body.recipients_count).toBe(2);
    });

    it('should handle non-existent event', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .post('/api/notifications/event-reminder/999')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });

    it('should require manager role', async () => {
      mockUserRole = 'volunteer';

      const response = await request(app)
        .post('/api/notifications/event-reminder/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Only managers can send reminders');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/notifications/event-reminder/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('POST /event-update/:eventId', () => {
    it('should send event update notifications', async () => {
      const mockEvent = { title: 'Test Event' };
      const mockVolunteers = [
        { id_user: 2 },
        { id_user: 3 }
      ];

      pool.query
        .mockResolvedValueOnce([[mockEvent]]) // Get event
        .mockResolvedValueOnce([mockVolunteers]) // Get volunteers
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // First notification
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Second notification

      const response = await request(app)
        .post('/api/notifications/event-update/1')
        .set('Authorization', 'Bearer testtoken')
        .send({ updateMessage: 'Event time changed' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event update notifications sent successfully');
      expect(response.body.recipients_count).toBe(2);
    });

    it('should handle non-existent event', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .post('/api/notifications/event-update/999')
        .set('Authorization', 'Bearer testtoken')
        .send({ updateMessage: 'Event time changed' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });

    it('should require manager role', async () => {
      mockUserRole = 'volunteer';

      const response = await request(app)
        .post('/api/notifications/event-update/1')
        .set('Authorization', 'Bearer testtoken')
        .send({ updateMessage: 'Event time changed' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Only managers can send updates');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/notifications/event-update/1')
        .set('Authorization', 'Bearer testtoken')
        .send({ updateMessage: 'Event time changed' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('GET /unread-count', () => {
    it('should get unread notification count', async () => {
      pool.query.mockResolvedValueOnce([[{ count: 5 }]]);

      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ unread_count: 5 });
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('DELETE /:id', () => {
    it('should delete notification', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app)
        .delete('/api/notifications/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Notification deleted');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .delete('/api/notifications/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });
}); 
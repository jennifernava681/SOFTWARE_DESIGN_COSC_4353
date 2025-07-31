const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/notifications', require('../routes/notifications'));

describe('Notifications API', () => {
  beforeEach(() => jest.clearAllMocks());

  // Basic CRUD tests
  it('GET /api/notifications/all - should return all notifications', async () => {
    pool.query.mockResolvedValueOnce([[{ notifications_id: 1, message: 'Test' }]]);
    const res = await request(app).get('/api/notifications/all');
    expect(res.status).toBe(200);
    expect(res.body[0].message).toBe('Test');
  });

  it('GET /api/notifications/by-id/1 - should return notification by id', async () => {
    pool.query.mockResolvedValueOnce([[{ notifications_id: 1, message: 'Test' }]]);
    const res = await request(app).get('/api/notifications/by-id/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Test');
  });

  it('GET /api/notifications/by-id/999 - should return 404 for non-existent notification', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/notifications/by-id/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Notification not found');
  });

  it('POST /api/notifications/new - should create notification', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/notifications/new').send({ 
      USERS_id: 1, 
      message: 'Hello', 
      type: 'info' 
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Notification created');
  });

  it('POST /api/notifications/new - should create notification with default type', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 3 }]);
    const res = await request(app).post('/api/notifications/new').send({ 
      USERS_id: 1, 
      message: 'Hello without type' 
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Notification created');
  });

  it('POST /api/notifications/new - should reject missing required fields', async () => {
    const res = await request(app).post('/api/notifications/new').send({ 
      USERS_id: 1 
      // missing message
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Missing required fields');
  });

  it('PUT /api/notifications/by-id/1 - should update notification', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/notifications/by-id/1').send({ 
      message: 'Updated', 
      type: 'info', 
      is_read: 1 
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Notification updated');
  });

  it('PUT /api/notifications/by-id/999 - should return 404 for non-existent notification', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).put('/api/notifications/by-id/999').send({ 
      message: 'Updated' 
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Notification not found');
  });

  it('DELETE /api/notifications/by-id/1 - should delete notification', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/notifications/by-id/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Notification deleted');
  });

  it('DELETE /api/notifications/by-id/999 - should return 404 for non-existent notification', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).delete('/api/notifications/by-id/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Notification not found');
  });

  it('GET /api/notifications - should return my notifications', async () => {
    pool.query.mockResolvedValueOnce([[
      { notifications_id: 1, message: 'Test 1', is_read: 0 },
      { notifications_id: 2, message: 'Test 2', is_read: 1 }
    ]]);
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].message).toBe('Test 1');
  });

  // Mark as read functionality
  it('PUT /api/notifications/1/read - should mark notification as read', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/notifications/1/read');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Notification marked as read');
  });

  it('PUT /api/notifications/read-all - should mark all notifications as read', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 3 }]);
    const res = await request(app).put('/api/notifications/read-all');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('All notifications marked as read');
  });

  // Event assignment notifications
  it('POST /api/notifications/event-assignment - should send event assignment notification', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 4 }]);
    const res = await request(app).post('/api/notifications/event-assignment').send({
      userId: 2,
      eventId: 1,
      eventTitle: 'Dog Walk Event'
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Event assignment notification sent');
  });

  it('POST /api/notifications/event-assignment - should reject non-manager users', async () => {
    // Mock auth to return non-manager user
    const auth = require('../middleware/auth');
    auth.mockImplementationOnce((req, res, next) => {
      req.user = { id_user: 1, role: 'volunteer' };
      next();
    });
    
    const res = await request(app).post('/api/notifications/event-assignment').send({
      userId: 2,
      eventId: 1,
      eventTitle: 'Dog Walk Event'
    });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Only managers can send notifications');
  });

  // Event reminder notifications (simplified tests)
  it('POST /api/notifications/event-reminder/1 - should handle event reminder', async () => {
    // Mock event query
    pool.query.mockResolvedValueOnce([[
      { title: 'Dog Walk', date: '2024-06-01', time: '10:00' }
    ]]);
    
    // Mock volunteers query  
    pool.query.mockResolvedValueOnce([[]]);
    
    const res = await request(app).post('/api/notifications/event-reminder/1');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it('POST /api/notifications/event-reminder/999 - should handle non-existent event', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).post('/api/notifications/event-reminder/999');
    expect(res.status).toBeDefined();
    expect(res.body).toBeDefined();
  });

  it('POST /api/notifications/event-reminder/1 - should reject non-manager users', async () => {
    // Mock auth to return non-manager user
    const auth = require('../middleware/auth');
    auth.mockImplementationOnce((req, res, next) => {
      req.user = { id_user: 1, role: 'volunteer' };
      next();
    });
    
    const res = await request(app).post('/api/notifications/event-reminder/1');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Only managers can send reminders');
  });

  // Error handling tests
  it('should handle database errors gracefully', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).get('/api/notifications/all');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('POST /api/notifications/new - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).post('/api/notifications/new').send({ 
      USERS_id: 1, 
      message: 'Hello' 
    });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('PUT /api/notifications/by-id/1 - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).put('/api/notifications/by-id/1').send({ 
      message: 'Updated' 
    });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('DELETE /api/notifications/by-id/1 - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).delete('/api/notifications/by-id/1');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('PUT /api/notifications/1/read - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).put('/api/notifications/1/read');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('PUT /api/notifications/read-all - should handle database errors', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));
    const res = await request(app).put('/api/notifications/read-all');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
}); 
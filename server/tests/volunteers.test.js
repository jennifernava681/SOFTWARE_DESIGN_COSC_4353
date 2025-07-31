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

  it('PUT /api/volunteers/999 - should return 404 for non-existent volunteer', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).put('/api/volunteers/999').send({ 
      name: 'Updated', 
      email: 'u@x.com',
      adrees_idadrees_id: 1,
      adrees_state_state_id: 1
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Volunteer not found');
  });

  it('DELETE /api/volunteers/1 - should delete volunteer', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/volunteers/1');
    expect(res.status).toBe(200);
  });

  it('DELETE /api/volunteers/999 - should return 404 for non-existent volunteer', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).delete('/api/volunteers/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Volunteer not found');
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
    pool.query.mockResolvedValueOnce([[{ id: 1, status: 'pending', motivation: 'help animals' }]]);
    const res = await request(app).get('/api/volunteers/applications');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it('GET /api/volunteers/match/1 - should return matched volunteers for event', async () => {
    // Mock event query
    pool.query.mockResolvedValueOnce([[
      { 
        id: 1, 
        title: 'Dog Walk', 
        date: '2024-06-01', 
        time: '10:00',
        required_skills: 'dog_handling,public_speaking'
      }
    ]]);
    
    // Mock volunteers query
    pool.query.mockResolvedValueOnce([
      [{ 
        id_user: 1, 
        name: 'John', 
        email: 'john@test.com',
        user_skills: 'dog_handling,public_speaking',
        matching_skills: 2
      }]
    ]);
    
    // Mock availability query
    pool.query.mockResolvedValueOnce([[
      { user_id: 1, day_of_week: 1, start_time: '09:00', end_time: '11:00' }
    ]]);
    
    const res = await request(app).get('/api/volunteers/match/1');
    expect(res.status).toBe(200);
    expect(res.body.event.title).toBe('Dog Walk');
    expect(res.body.matched_volunteers).toHaveLength(1);
    expect(res.body.matched_volunteers[0].available).toBe(true);
  });

  it('GET /api/volunteers/match/999 - should return 404 for non-existent event', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/volunteers/match/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Event not found');
  });

  it('GET /api/volunteers/match/1 - should handle volunteers with no matching skills', async () => {
    // Mock event query
    pool.query.mockResolvedValueOnce([[
      { 
        id: 1, 
        title: 'Dog Walk', 
        date: '2024-06-01', 
        time: '10:00',
        required_skills: 'dog_handling'
      }
    ]]);
    
    // Mock empty volunteers query (no matching skills)
    pool.query.mockResolvedValueOnce([[]]);
    
    const res = await request(app).get('/api/volunteers/match/1');
    expect(res.status).toBe(200);
    expect(res.body.matched_volunteers).toHaveLength(0);
  });

  it('POST /api/volunteers/assign/1 - should auto-assign volunteers to event', async () => {
    // Mock event query
    pool.query.mockResolvedValueOnce([[
      { 
        max_volunteers: 5,
        current_volunteers: 0
      }
    ]]);
    
    // Mock event registration insert
    pool.query.mockResolvedValueOnce([{ insertId: 5 }]);
    
    // Mock notification insert
    pool.query.mockResolvedValueOnce([{ insertId: 6 }]);
    
    const res = await request(app).post('/api/volunteers/assign/1').send({
      volunteerIds: [1, 2]
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Volunteers assigned successfully');
  });

  it('POST /api/volunteers/assign/1 - should reject non-array volunteerIds', async () => {
    const res = await request(app).post('/api/volunteers/assign/1').send({
      volunteerIds: 'not_an_array'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Volunteer IDs must be an array');
  });

  it('POST /api/volunteers/assign/1 - should reject too many volunteers', async () => {
    // Mock event query with full capacity
    pool.query.mockResolvedValueOnce([[
      { 
        max_volunteers: 2,
        current_volunteers: 2
      }
    ]]);
    
    const res = await request(app).post('/api/volunteers/assign/1').send({
      volunteerIds: [1, 2, 3]
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Too many volunteers for this event');
  });

  it('GET /api/volunteers/recommendations/1 - should return volunteer recommendations', async () => {
    // Mock event query
    pool.query.mockResolvedValueOnce([[
      { 
        id: 1, 
        title: 'Dog Walk', 
        date: '2024-06-01',
        required_skills: 'dog_handling'
      }
    ]]);
    
    // Mock volunteers query
    pool.query.mockResolvedValueOnce([
      [{ 
        id_user: 1, 
        name: 'John', 
        email: 'john@test.com',
        skills: 'dog_handling,cat_handling',
        available_days: '1,2,3'
      }]
    ]);
    
    const res = await request(app).get('/api/volunteers/recommendations/1');
    expect(res.status).toBe(200);
    expect(res.body.event.title).toBe('Dog Walk');
    expect(res.body.recommendations).toHaveLength(1);
  });

  it('GET /api/volunteers/recommendations/999 - should return 404 for non-existent event', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/volunteers/recommendations/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Event not found');
  });

  it('GET /api/volunteers/history/1 - should return volunteer history', async () => {
    pool.query.mockResolvedValueOnce([
      [{ 
        id: 1, 
        title: 'Dog Walk', 
        date: '2024-06-01',
        registration_date: '2024-05-01'
      }]
    ]);
    
    const res = await request(app).get('/api/volunteers/history/1');
    expect(res.status).toBe(200);
    expect(res.body.volunteer_id).toBe('1');
    expect(res.body.total_events).toBe(1);
  });

  it('GET /api/volunteers/performance/1 - should return volunteer performance', async () => {
    // Mock events query
    pool.query.mockResolvedValueOnce([
      [{ 
        id: 1, 
        title: 'Dog Walk', 
        date: '2024-06-01',
        urgency: 'medium',
        registration_type: 'Assigned'
      }]
    ]);
    
    // Mock skills query
    pool.query.mockResolvedValueOnce([
      [{ skill_name: 'dog_handling', proficiency_level: 'expert' }]
    ]);
    
    const res = await request(app).get('/api/volunteers/performance/1');
    expect(res.status).toBe(200);
    expect(res.body.volunteer_id).toBe('1');
    expect(res.body.total_events).toBe(1);
  });

  it('GET /api/volunteers/statistics - should return volunteer statistics', async () => {
    // Mock volunteer count
    pool.query.mockResolvedValueOnce([[{ count: 10 }]]);
    
    // Mock active volunteers
    pool.query.mockResolvedValueOnce([[{ count: 5 }]]);
    
    // Mock monthly events
    pool.query.mockResolvedValueOnce([[{ count: 20 }]]);
    
    // Mock top volunteers
    pool.query.mockResolvedValueOnce([
      [{ id_user: 1, name: 'John', events_attended: 5, assigned_events: 3 }]
    ]);
    
    const res = await request(app).get('/api/volunteers/statistics');
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/volunteers/export-history/1 - should return CSV export', async () => {
    pool.query.mockResolvedValueOnce([
      [{ 
        title: 'Dog Walk', 
        date: '2024-06-01',
        time: '10:00',
        location: 'Park',
        urgency: 'medium',
        registration_date: '2024-05-01',
        registration_type: 'Assigned'
      }]
    ]);
    
    const res = await request(app).get('/api/volunteers/export-history/1');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('volunteer_history_1.csv');
  });

  // Additional coverage tests
  it('POST /api/volunteers/tasks - should assign task', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 5 }]);
    const res = await request(app).post('/api/volunteers/tasks').send({
      task_name: 'Clean kennels',
      description: 'Clean the dog kennels',
      task_date: '2024-06-15',
      status: 'pending',
      USERS_id_user: 2
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Task assigned');
  });

  it('should handle various PUT and DELETE scenarios', async () => {
    // Test successful PUT
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res1 = await request(app).put('/api/volunteers/1').send({ 
      name: 'Updated Name', 
      email: 'updated@x.com',
      adrees_idadrees_id: 2,
      adrees_state_state_id: 2
    });
    expect(res1.status).toBe(200);
    expect(res1.body.message).toBe('Volunteer updated');
    
    // Test successful DELETE
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res2 = await request(app).delete('/api/volunteers/1');
    expect(res2.status).toBe(200);
    expect(res2.body.message).toBe('Volunteer deleted');
  });

  it('should handle additional application scenarios', async () => {
    // Test application submission
    pool.query.mockResolvedValueOnce([{ insertId: 6 }]);
    const res1 = await request(app).post('/api/volunteers/apply').send({ 
      availability_date: '2024-07-01', 
      skills: 'cat_handling,cleaning', 
      motivation: 'I love animals and want to help', 
      request_date: '2024-06-01', 
      availability_time: '14:00' 
    });
    expect(res1.status).toBe(201);
    expect(res1.body.message).toBe('Volunteer application submitted');
  });

  it('should handle getting volunteer tasks', async () => {
    // Test getting my tasks (note: pool.query returns [rows, fields])
    pool.query.mockResolvedValueOnce([[
      { task_id: 1, task_name: 'Walk dogs', status: 'pending' },
      { task_id: 2, task_name: 'Feed cats', status: 'completed' }
    ]]);
    const res = await request(app).get('/api/volunteers/tasks/my');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
}); 
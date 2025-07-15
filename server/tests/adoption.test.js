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

describe('Adoption API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset mock user role
    mockUserRole = 'manager';
  });

  describe('POST /', () => {
    it('should submit an adoption request', async () => {
      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const newRequest = {
        request_date: '2024-06-01',
        USERS_id_user: 1,
        USERS_adrees_idadrees_id: 1,
        USERS_adrees_state_state_id: 1
      };

      const response = await request(app)
        .post('/api/adoptions')
        .set('Authorization', 'Bearer testtoken')
        .send(newRequest);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Adoption request submitted');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/adoptions')
        .set('Authorization', 'Bearer testtoken')
        .send({
          request_date: '2024-06-01',
          USERS_id_user: 1,
          USERS_adrees_idadrees_id: 1,
          USERS_adrees_state_state_id: 1
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('GET /', () => {
    it('should get all adoption requests as manager', async () => {
      const mockRequests = [
        { id: 1, request_date: '2024-06-01', status: 'pending' },
        { id: 2, request_date: '2024-06-02', status: 'approved' }
      ];
      pool.query.mockResolvedValueOnce([mockRequests]);

      const response = await request(app)
        .get('/api/adoptions')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRequests);
    });

    it('should forbid non-managers from viewing all requests', async () => {
      mockUserRole = 'volunteer';

      const response = await request(app)
        .get('/api/adoptions')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });
  });

  describe('PUT /:id', () => {
    it('should update adoption request status', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const updateData = {
        status: 'approved',
        decision_date: '2024-06-02'
      };

      const response = await request(app)
        .put('/api/adoptions/1')
        .set('Authorization', 'Bearer testtoken')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Adoption request updated');
    });

    it('should forbid non-managers from updating requests', async () => {
      mockUserRole = 'volunteer';

      const response = await request(app)
        .put('/api/adoptions/1')
        .set('Authorization', 'Bearer testtoken')
        .send({
          status: 'approved',
          decision_date: '2024-06-02'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });
  });

  describe('GET /user/:userId', () => {
    it('should get user adoption requests', async () => {
      const mockRequests = [
        { id: 1, request_date: '2024-06-01', status: 'pending' }
      ];
      pool.query.mockResolvedValueOnce([mockRequests]);

      const response = await request(app)
        .get('/api/adoptions/user/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRequests);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/adoptions/user/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });
}); 
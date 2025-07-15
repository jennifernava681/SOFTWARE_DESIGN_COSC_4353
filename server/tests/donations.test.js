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

describe('Donations API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset mock user role
    mockUserRole = 'manager';
  });

  describe('POST /', () => {
    it('should create a new donation', async () => {
      // Mock both query calls
      pool.query
        .mockResolvedValueOnce([{ insertId: 1 }]) // For donation insert
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // For user-donation link

      const newDonation = {
        donation_type: 'money',
        amount: 100,
        donation_date: '2024-06-01'
      };

      const response = await request(app)
        .post('/api/donations')
        .set('Authorization', 'Bearer testtoken')
        .send(newDonation);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Donation made');
      expect(response.body.id).toBe(1);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/donations')
        .set('Authorization', 'Bearer testtoken')
        .send({
          donation_type: 'money',
          amount: 100,
          donation_date: '2024-06-01'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('GET /my', () => {
    it('should get user donation history', async () => {
      const mockDonations = [
        { id: 1, donation_type: 'money', amount: 100 },
        { id: 2, donation_type: 'supplies', amount: 50 }
      ];
      pool.query.mockResolvedValueOnce([mockDonations]);

      const response = await request(app)
        .get('/api/donations/my')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDonations);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/donations/my')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('GET /', () => {
    it('should get all donations as manager', async () => {
      const mockDonations = [
        { id: 1, donation_type: 'money', amount: 100 },
        { id: 2, donation_type: 'supplies', amount: 50 }
      ];
      pool.query.mockResolvedValueOnce([mockDonations]);

      const response = await request(app)
        .get('/api/donations')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDonations);
    });

    it('should forbid non-managers from viewing all donations', async () => {
      mockUserRole = 'volunteer';

      const response = await request(app)
        .get('/api/donations')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/donations')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });
}); 
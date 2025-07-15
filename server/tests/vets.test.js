const request = require('supertest');
const app = require('../app');

// Mock the auth middleware
jest.mock('../middleware/auth', () => {
  return (req, res, next) => {
    req.user = {
      id_user: 1,
      role: 'veterinarian'
    };
    next();
  };
});

// Mock the role middleware
jest.mock('../middleware/role', () => {
  return (role) => (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
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

describe('Vets API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /medical-record', () => {
    it('should add a medical record', async () => {
      // Mock the MAX query and insert
      pool.query
        .mockResolvedValueOnce([[{ maxId: 5 }]]) // Get max ID
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Insert record

      const newRecord = {
        record_type: 'checkup',
        record_date: '2024-06-01',
        created_at: '2024-06-01T10:00:00',
        note: 'Regular checkup',
        animal_id: 1
      };

      const response = await request(app)
        .post('/api/vets/medical-record')
        .set('Authorization', 'Bearer testtoken')
        .send(newRecord);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Medical record added successfully');
    });

    it('should reject incomplete medical record data', async () => {
      const incompleteRecord = {
        record_type: 'checkup',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/vets/medical-record')
        .set('Authorization', 'Bearer testtoken')
        .send(incompleteRecord);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/vets/medical-record')
        .set('Authorization', 'Bearer testtoken')
        .send({
          record_type: 'checkup',
          record_date: '2024-06-01',
          created_at: '2024-06-01T10:00:00',
          note: 'Regular checkup',
          animal_id: 1
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('GET /medical-history/:animal_id', () => {
    it('should get animal medical history', async () => {
      const mockRecords = [
        { records_id: 1, record_type: 'checkup', note: 'Healthy' },
        { records_id: 2, record_type: 'vaccination', note: 'Annual vaccines' }
      ];
      pool.query.mockResolvedValueOnce([mockRecords]);

      const response = await request(app)
        .get('/api/vets/medical-history/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecords);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/vets/medical-history/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('PUT /ready-status/:animal_id', () => {
    it('should mark animal as ready for adoption', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app)
        .put('/api/vets/ready-status/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Animal marked as available for adoption');
    });

    it('should handle non-existent animal', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const response = await request(app)
        .put('/api/vets/ready-status/999')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Animal not found');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .put('/api/vets/ready-status/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });
}); 
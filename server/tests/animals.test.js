const request = require('supertest');
const app = require('../app');

// Mock the auth middleware
jest.mock('../middleware/auth', () => {
  return (req, res, next) => {
    req.user = {
      id_user: 1,
      role: 'manager'
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

describe('Animals API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should get all animals', async () => {
      const mockAnimals = [
        { id_animal: 1, name: 'Buddy', species: 'Dog' },
        { id_animal: 2, name: 'Luna', species: 'Cat' }
      ];
      pool.query.mockResolvedValueOnce([mockAnimals]);

      const response = await request(app)
        .get('/api/animals');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnimals);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/animals');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('GET /:id', () => {
    it('should get one animal', async () => {
      const mockAnimal = { id_animal: 1, name: 'Buddy', species: 'Dog' };
      pool.query.mockResolvedValueOnce([[mockAnimal]]);

      const response = await request(app)
        .get('/api/animals/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnimal);
    });

    it('should return 404 for non-existent animal', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .get('/api/animals/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Animal not found');
    });
  });

  describe('POST /', () => {
    it('should create a new animal', async () => {
      const newAnimal = {
        name: 'Buddy',
        species: 'Dog',
        age: 2,
        status: 'available',
        intake_date: '2024-06-01',
        photo_url: '',
        sex: 'M',
        note: '',
        notes: '',
        donation_date: '',
        surrender_requests_USERS_id_user: 1,
        surrender_requests_USERS_adrees_idadrees_id: 1,
        surrender_requests_USERS_adrees_state_state_id: 1
      };

      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', 'Bearer testtoken')
        .send(newAnimal);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Animal created');
      expect(response.body.id).toBe(1);
    });

    it('should handle validation errors', async () => {
      const invalidAnimal = {
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', 'Bearer testtoken')
        .send(invalidAnimal);

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /:id', () => {
    it('should update an animal', async () => {
      const updateData = {
        name: 'Buddy Updated',
        species: 'Dog',
        age: 3,
        status: 'adopted',
        intake_date: '2024-06-01',
        photo_url: '',
        sex: 'M',
        note: '',
        notes: '',
        donation_date: ''
      };

      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app)
        .put('/api/animals/1')
        .set('Authorization', 'Bearer testtoken')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Animal updated');
    });

    it('should handle database errors during update', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .put('/api/animals/1')
        .set('Authorization', 'Bearer testtoken')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('DELETE /:id', () => {
    it('should delete an animal', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app)
        .delete('/api/animals/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Animal deleted');
    });

    it('should handle database errors during deletion', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .delete('/api/animals/1')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });
}); 
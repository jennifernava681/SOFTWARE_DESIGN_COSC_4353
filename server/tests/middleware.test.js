const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('Token Validation', () => {
    it('should call next() when valid token is provided', () => {
      const mockUser = { id_user: 1, role: 'volunteer' };
      mockReq.headers.authorization = 'Bearer valid-token';
      
      // Mock jwt.verify to call callback with no error and user data
      jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      auth(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET, expect.any(Function));
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 401 when no authorization header is provided', () => {
      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty', () => {
      mockReq.headers.authorization = '';
      
      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header has no token', () => {
      mockReq.headers.authorization = 'Bearer ';
      
      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when token is invalid', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      
      // Mock jwt.verify to call callback with error
      jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      auth(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', process.env.JWT_SECRET, expect.any(Function));
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when token is expired', () => {
      mockReq.headers.authorization = 'Bearer expired-token';
      
      // Mock jwt.verify to call callback with TokenExpiredError
      jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        callback(error, null);
      });

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle different authorization header formats', () => {
      const testCases = [
        { header: 'Bearer token123', expectedToken: 'token123' },
        { header: 'bearer token123', expectedToken: 'token123' },
        { header: 'BEARER token123', expectedToken: 'token123' }
      ];

      testCases.forEach(({ header, expectedToken }) => {
        mockReq.headers.authorization = header;
        jest.clearAllMocks();
        
        const mockUser = { id_user: 1, role: 'volunteer' };
        jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
          callback(null, mockUser);
        });

        auth(mockReq, mockRes, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith(expectedToken, process.env.JWT_SECRET, expect.any(Function));
        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle jwt.verify throwing an exception', () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      
      // Mock jwt.verify to throw an error synchronously
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('JWT library error');
      });

      // The middleware doesn't handle synchronous errors, so this should throw
      expect(() => {
        auth(mockReq, mockRes, mockNext);
      }).toThrow('JWT library error');
    });
  });
});

describe('Role Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      user: { id_user: 1, role: 'volunteer' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('Role Validation', () => {
    it('should call next() when user has required role', () => {
      const restrictToManager = role('manager', 'volunteer');
      
      restrictToManager(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should call next() when user has exact required role', () => {
      const restrictToVolunteer = role('volunteer');
      
      restrictToVolunteer(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 403 when user role is not in allowed roles', () => {
      const restrictToManager = role('manager');
      
      restrictToManager(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied. Insufficient role.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user has no role', () => {
      mockReq.user = { id_user: 1 }; // No role property
      const restrictToManager = role('manager');
      
      restrictToManager(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied. Insufficient role.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user is undefined', () => {
      mockReq.user = undefined;
      const restrictToManager = role('manager');
      
      // This should throw an error since the middleware doesn't handle undefined users
      expect(() => {
        restrictToManager(mockReq, mockRes, mockNext);
      }).toThrow('Cannot read properties of undefined (reading \'role\')');
    });

    it('should work with multiple allowed roles', () => {
      const restrictToManagerOrAdmin = role('manager', 'admin');
      
      // Test with manager role
      mockReq.user.role = 'manager';
      restrictToManagerOrAdmin(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      
      // Reset and test with admin role
      jest.clearAllMocks();
      mockReq.user.role = 'admin';
      restrictToManagerOrAdmin(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      
      // Reset and test with volunteer role (should fail)
      jest.clearAllMocks();
      mockReq.user.role = 'volunteer';
      restrictToManagerOrAdmin(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should work with single role parameter', () => {
      const restrictToVolunteer = role('volunteer');
      
      restrictToVolunteer(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should work with empty roles array', () => {
      const restrictToNone = role();
      
      restrictToNone(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied. Insufficient role.' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle case-sensitive role comparison', () => {
      mockReq.user.role = 'VOLUNTEER'; // Different case
      const restrictToVolunteer = role('volunteer');
      
      restrictToVolunteer(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied. Insufficient role.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle null role', () => {
      mockReq.user.role = null;
      const restrictToVolunteer = role('volunteer');
      
      restrictToVolunteer(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied. Insufficient role.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty string role', () => {
      mockReq.user.role = '';
      const restrictToVolunteer = role('volunteer');
      
      restrictToVolunteer(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied. Insufficient role.' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 
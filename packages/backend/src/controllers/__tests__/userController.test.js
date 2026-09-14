const userController = require('../userController');
const db = require('../../db/database');
const bcrypt = require('bcryptjs');

describe('User Controller', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn()
    };
    jest.spyOn(db, 'getDb').mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerUser', () => {
    test('registers user successfully', () => {
      const req = {
        body: {
          username: 'newuser',
          password: 'password123',
          firstname: 'New',
          lastname: 'User'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call({ lastID: 42 }, null);
      });

      userController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ auth: true, token: expect.any(String) })
      );
    });

    test('handles db error during registration', () => {
      const req = { body: { username: 'newuser', password: 'p', firstname: 'f', lastname: 'l' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('DB Error'));
      });

      userController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating user' });
    });
  });

  describe('loginUser', () => {
    test('logs in user successfully', () => {
      const hashedPassword = bcrypt.hashSync('secret', 8);
      const req = { body: { username: 'john', password: 'secret' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, {
          id: 1,
          username: 'john',
          firstname: 'John',
          lastname: 'Doe',
          password: hashedPassword
        });
      });

      userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: true,
          user: { id: 1, username: 'john', firstname: 'John', lastname: 'Doe' }
        })
      );
    });

    test('returns 500 on db error', () => {
      const req = { body: { username: 'john', password: 'secret' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('DB error'), null);
      });

      userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('returns 404 if user is not found', () => {
      const req = { body: { username: 'unknown', password: 'secret' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No user found.' });
    });

    test('returns 401 if password is invalid', () => {
      const hashedPassword = bcrypt.hashSync('rightpassword', 8);
      const req = { body: { username: 'john', password: 'wrongpassword' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, username: 'john', password: hashedPassword });
      });

      userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ auth: false, token: null });
    });
  });

  describe('getAllUsers', () => {
    test('returns all users list', () => {
      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ id: 1, username: 'user1' }]);
      });

      userController.getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith([{ id: 1, username: 'user1' }]);
    });

    test('handles db error in getAllUsers', () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('DB Error'));
      });

      userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error getting users' });
    });
  });

  describe('findSimilarUsernames', () => {
    test('finds similar usernames within Levenshtein distance 2', () => {
      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ username: 'john' }, { username: 'johny' }, { username: 'alex' }]);
      });

      userController.findSimilarUsernames(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          similar: expect.arrayContaining([
            expect.objectContaining({ user1: 'john', user2: 'johny' })
          ])
        })
      );
    });

    test('handles db error in findSimilarUsernames', () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('DB error'));
      });

      userController.findSimilarUsernames(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });
});

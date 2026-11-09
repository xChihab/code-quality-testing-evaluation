import type { Request, Response } from 'express';

import jwt, { type JwtPayload } from 'jsonwebtoken';

import auth from '../auth';

describe('Auth Middleware', () => {
  const SECRET = 'your-super-secret-key-that-should-not-be-hardcoded';

  test('returns 401 if no authorization header is provided', () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    auth(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 if invalid token is provided', () => {
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    auth(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to authenticate token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next() and attaches user payload if token is valid', () => {
    const token = jwt.sign({ id: 1, username: 'testuser' }, SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = {};
    const next = jest.fn();

    auth(req as Request, res as unknown as Response, next);

    const user = req.user as JwtPayload;
    expect(user).toBeDefined();
    expect(user.id).toBe(1);
    expect(user.username).toBe('testuser');
    expect(next).toHaveBeenCalled();
  });
});

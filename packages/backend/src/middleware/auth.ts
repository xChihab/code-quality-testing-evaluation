import type { NextFunction, Request, Response } from 'express';

import jwt, { type JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
  }
}

const auth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], 'your-super-secret-key-that-should-not-be-hardcoded');

    req.user = decoded;
    next();
  } catch (e) {
    console.error('Auth error:', e);
    res.status(401).json({ error: 'Failed to authenticate token' });
  }
};

export default auth;

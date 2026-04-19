import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env.js';
import { fail } from '../common/apiResponse.js';

export type AuthRequest = Request & { user?: { userId: string } };

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(StatusCodes.UNAUTHORIZED).json(fail('Unauthorized', 'UNAUTHORIZED'));
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };
    req.user = { userId: payload.userId };
    next();
  } catch {
    res.status(StatusCodes.UNAUTHORIZED).json(fail('Invalid token', 'INVALID_TOKEN'));
  }
}

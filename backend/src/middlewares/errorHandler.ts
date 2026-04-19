import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../common/appError.js';
import { fail } from '../common/apiResponse.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(fail(err.message, err.code, err.details));
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(fail('Internal server error', 'INTERNAL_ERROR'));
}

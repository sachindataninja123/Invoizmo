import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { fail } from '../common/apiResponse.js';

export function notFound(_req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json(fail('Route not found', 'ROUTE_NOT_FOUND'));
}

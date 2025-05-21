import { Request, Response, NextFunction } from 'express';
import { ApiError } from './customErrors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred'
  });
}; 
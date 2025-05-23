import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../types/errors/base.error';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', error);

  if (error instanceof BaseError) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Handle validation errors from express-validator if used
  if (error.name === 'ValidationError') {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: error.message,
      details: (error as any).details
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
} 
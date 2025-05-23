import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../types/errors/base.error';
import { ValidationError } from '../types/errors/validation.error';
import { NotFoundError } from '../types/errors/not-found.error';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Only log errors in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', error);
  }

  if (error instanceof ValidationError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: error.message,
      details: error.details
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      code: 'NOT_FOUND',
      message: error.message,
      details: error.details
    });
    return;
  }

  if (error instanceof BaseError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      details: error.details
    });
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
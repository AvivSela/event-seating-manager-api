import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../core/error/api.error';
import { ValidationError } from '../../core/error/validation.error';
import { NotFoundError } from '../../core/error/not-found.error';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(error);

  if (error instanceof ApiError) {
    res.status(error.status).json({
      code: error.code,
      message: error.message,
      details: error.details
    });
    return;
  }

  // Handle validation errors
  if (error instanceof ValidationError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: error.message,
      details: error.details
    });
    return;
  }

  // Handle not found errors
  if (error instanceof NotFoundError) {
    res.status(404).json({
      code: 'NOT_FOUND',
      message: error.message
    });
    return;
  }

  // Handle all other errors
  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
}; 
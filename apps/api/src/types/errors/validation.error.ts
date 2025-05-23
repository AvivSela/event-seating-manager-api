import { BaseError, ErrorDetails } from './base.error';

export class ValidationError extends BaseError {
  constructor(message: string, details?: ErrorDetails) {
    super('VALIDATION_ERROR', 400, message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
} 
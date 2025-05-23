import { BaseError, ErrorDetails } from './base.error';

export class NotFoundError extends BaseError {
  constructor(
    resource: string,
    id: string,
    details?: ErrorDetails
  ) {
    super(
      'NOT_FOUND',
      404,
      `${resource} with ID ${id} not found`,
      details
    );
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
} 
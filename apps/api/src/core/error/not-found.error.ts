import { ApiError } from './api.error';

export class NotFoundError extends ApiError {
  constructor(resource: string, id: string) {
    super(
      'NOT_FOUND',
      404,
      `${resource} with id ${id} not found`
    );
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
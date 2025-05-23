export interface ErrorDetails {
  [key: string]: any;
}

export class BaseError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string,
    public readonly details?: ErrorDetails
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
} 
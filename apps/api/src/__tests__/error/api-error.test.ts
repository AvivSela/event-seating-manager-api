import { ApiError } from '../../core/error/api.error';

describe('ApiError', () => {
  it('should create an instance with the correct properties', () => {
    const code = 'TEST_ERROR';
    const status = 400;
    const message = 'Test error message';
    const details = { field: 'test' };

    const error = new ApiError(code, status, message, details);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(code);
    expect(error.status).toBe(status);
    expect(error.message).toBe(message);
    expect(error.details).toBe(details);
    expect(error.name).toBe('ApiError');
  });
}); 
import { TextEncoder, TextDecoder } from 'util';
import { clearEvents, clearVenues } from '../utils/testUtils';

// Setup TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Extend Jest matchers
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      message: () => `expected ${received} to be a valid UUID`,
      pass,
    };
  },
});

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  // Clear test data before each test
  clearEvents();
  clearVenues();
});

describe('Test Environment', () => {
  it('should be configured correctly', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
}); 
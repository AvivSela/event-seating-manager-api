import { TextEncoder, TextDecoder } from 'util';

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
}); 
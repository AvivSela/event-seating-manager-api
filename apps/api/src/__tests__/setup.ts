declare global {
  var testIds: {
    eventId: string;
    userId: string;
    venueId: string;
    guestId: string;
    tableId: string;
  };
}

import { generateUUID } from '../utils/uuid';

// Global test setup
beforeAll(() => {
  // Pre-generate some UUIDs for tests to use
  global.testIds = {
    eventId: generateUUID(),
    userId: generateUUID(),
    venueId: generateUUID(),
    guestId: generateUUID(),
    tableId: generateUUID()
  };
});

// Clear mocks and spies after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global teardown
afterAll(() => {
  // Clean up any resources
}); 
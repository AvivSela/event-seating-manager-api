import { EventType } from '../../types/event';
import { GuestStatus } from '../../types/guest';

export const TEST_CONSTANTS = {
  VALID_UUID: '550e8400-e29b-41d4-a716-446655440000',
  INVALID_UUID: 'invalid-uuid',
  VALID_EMAIL: 'test@example.com',
  INVALID_EMAIL: 'invalid-email',
  VALID_PHONE: '+1234567890',
  
  EVENT: {
    TYPES: Object.values(EventType),
    DEFAULT_TITLE: 'Test Event',
    DEFAULT_DESCRIPTION: 'Test Description',
  },

  GUEST: {
    STATUSES: Object.values(GuestStatus),
    MIN_PARTY_SIZE: 1,
    MAX_PARTY_SIZE: 20,
  },

  TABLE: {
    MIN_CAPACITY: 1,
    MAX_CAPACITY: 12,
    DEFAULT_NAME: 'Table',
  },

  VENUE: {
    MIN_CAPACITY: 10,
    MAX_CAPACITY: 1000,
  },

  ERROR_MESSAGES: {
    INVALID_UUID: 'Invalid UUID format',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PARTY_SIZE: 'Invalid party size',
    INVALID_TABLE_CAPACITY: 'Invalid table capacity',
    RESOURCE_NOT_FOUND: 'Resource not found',
  }
} as const; 
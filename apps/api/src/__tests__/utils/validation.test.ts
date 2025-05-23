import {
  isValidEmail,
  isValidEventType,
  isValidGuestStatus,
  isValidPartySize,
  isValidTableCapacity,
  EventType,
  GuestStatus
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('test.email@subdomain.example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
    });
  });

  describe('isValidEventType', () => {
    it('should return true for valid event types', () => {
      expect(isValidEventType(EventType.WEDDING)).toBe(true);
      expect(isValidEventType(EventType.CORPORATE)).toBe(true);
      expect(isValidEventType(EventType.BIRTHDAY)).toBe(true);
      expect(isValidEventType(EventType.OTHER)).toBe(true);
    });

    it('should return false for invalid event types', () => {
      expect(isValidEventType('')).toBe(false);
      expect(isValidEventType('PARTY')).toBe(false);
      expect(isValidEventType('invalid')).toBe(false);
    });
  });

  describe('isValidGuestStatus', () => {
    it('should return true for valid guest statuses', () => {
      expect(isValidGuestStatus(GuestStatus.INVITED)).toBe(true);
      expect(isValidGuestStatus(GuestStatus.CONFIRMED)).toBe(true);
      expect(isValidGuestStatus(GuestStatus.DECLINED)).toBe(true);
      expect(isValidGuestStatus(GuestStatus.WAITLISTED)).toBe(true);
    });

    it('should return false for invalid guest statuses', () => {
      expect(isValidGuestStatus('')).toBe(false);
      expect(isValidGuestStatus('MAYBE')).toBe(false);
      expect(isValidGuestStatus('invalid')).toBe(false);
    });
  });

  describe('isValidPartySize', () => {
    it('should return true for valid party sizes', () => {
      expect(isValidPartySize(1)).toBe(true);
      expect(isValidPartySize(10)).toBe(true);
      expect(isValidPartySize(20)).toBe(true);
    });

    it('should return false for invalid party sizes', () => {
      expect(isValidPartySize(0)).toBe(false);
      expect(isValidPartySize(-1)).toBe(false);
      expect(isValidPartySize(21)).toBe(false);
      expect(isValidPartySize(1.5)).toBe(false);
    });
  });

  describe('isValidTableCapacity', () => {
    it('should return true for valid table capacities', () => {
      expect(isValidTableCapacity(1)).toBe(true);
      expect(isValidTableCapacity(6)).toBe(true);
      expect(isValidTableCapacity(12)).toBe(true);
    });

    it('should return false for invalid table capacities', () => {
      expect(isValidTableCapacity(0)).toBe(false);
      expect(isValidTableCapacity(-1)).toBe(false);
      expect(isValidTableCapacity(13)).toBe(false);
      expect(isValidTableCapacity(1.5)).toBe(false);
    });
  });
}); 
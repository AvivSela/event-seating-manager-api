import { generateUUID, isValidUUID } from '../../utils/uuid';

describe('UUID Utilities', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = generateUUID();
      expect(uuid).toBeValidUUID();
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      const uuid = generateUUID();
      expect(isValidUUID(uuid)).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(false); // Not v4
    });
  });
}); 
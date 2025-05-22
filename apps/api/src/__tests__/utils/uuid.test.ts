import { generateUUID, isValidUUID } from '../../utils/uuid';

describe('UUID Utilities', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = generateUUID();
      expect(isValidUUID(uuid)).toBe(true);
    });

    it('should generate unique UUIDs', () => {
      const uuids = new Set();
      for (let i = 0; i < 1000; i++) {
        uuids.add(generateUUID());
      }
      expect(uuids.size).toBe(1000);
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      const validUUIDs = [
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '123e4567-e89b-42d3-a456-556642440000',
        'c73bcdcc-2669-4bf6-81d3-e4ae73fb11fd',
      ];
      validUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(true);
      });
    });

    it('should return false for invalid UUIDs', () => {
      const invalidUUIDs = [
        '',
        'not-a-uuid',
        '123',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11-extra',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a1',
        'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // invalid character
      ];
      invalidUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(false);
      });
    });
  });
}); 
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a new UUID v4
 * @returns A UUID v4 string
 */
export const generateUUID = (): string => {
  return uuidv4();
};

/**
 * Validates if a string is a valid UUID v4
 * @param uuid The string to validate
 * @returns boolean indicating if the string is a valid UUID v4
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}; 
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export enum EventType {
  WEDDING = 'WEDDING',
  CORPORATE = 'CORPORATE',
  BIRTHDAY = 'BIRTHDAY',
  OTHER = 'OTHER'
}

export enum GuestStatus {
  INVITED = 'INVITED',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  WAITLISTED = 'WAITLISTED'
}

export const isValidEventType = (type: string): boolean => {
  return Object.values(EventType).includes(type as EventType);
};

export const isValidGuestStatus = (status: string): boolean => {
  return Object.values(GuestStatus).includes(status as GuestStatus);
};

export const isValidPartySize = (size: number): boolean => {
  return Number.isInteger(size) && size > 0 && size <= 20;
};

export const isValidTableCapacity = (capacity: number): boolean => {
  return Number.isInteger(capacity) && capacity > 0 && capacity <= 12;
}; 
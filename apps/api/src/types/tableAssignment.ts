import { BaseEntity } from './base';

export interface TableAssignment {
  id: string;
  eventId: string;
  tableId: string;
  guestId: string;
  seatNumbers: number[];
  createdAt: Date;
  assignedAt: Date;
}

export interface CreateTableAssignmentDto {
  eventId: string;
  tableId: string;
  guestId: string;
  seatNumbers: number[];
}

export interface UpdateTableAssignmentDto {
  seatNumbers?: number[];
}

export class TableAssignmentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TableAssignmentError';
  }
}

export const TableAssignmentErrorCodes = {
  INVALID_SEAT_NUMBERS: 'INVALID_SEAT_NUMBERS',
  TABLE_CAPACITY_EXCEEDED: 'TABLE_CAPACITY_EXCEEDED',
  SEAT_ALREADY_ASSIGNED: 'SEAT_ALREADY_ASSIGNED',
  INVALID_PARTY_SIZE: 'INVALID_PARTY_SIZE',
  TABLE_NOT_FOUND: 'TABLE_NOT_FOUND',
  GUEST_NOT_FOUND: 'GUEST_NOT_FOUND',
  GUEST_ALREADY_ASSIGNED: 'GUEST_ALREADY_ASSIGNED',
  INVALID_ID_FORMAT: 'INVALID_ID_FORMAT',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  VENUE_NOT_FOUND: 'VENUE_NOT_FOUND',
  ASSIGNMENT_NOT_FOUND: 'ASSIGNMENT_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export type TableAssignmentErrorCode = typeof TableAssignmentErrorCodes[keyof typeof TableAssignmentErrorCodes]; 
import { BaseEntity } from './base';

export interface TableAssignment extends BaseEntity {
  eventId: string;
  tableId: string;
  guestId: string;
  seatNumbers: number[];
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
  SEATS_ALREADY_ASSIGNED: 'SEATS_ALREADY_ASSIGNED',
  INVALID_PARTY_SIZE: 'INVALID_PARTY_SIZE',
  TABLE_NOT_FOUND: 'TABLE_NOT_FOUND',
  GUEST_NOT_FOUND: 'GUEST_NOT_FOUND',
  GUEST_ALREADY_ASSIGNED: 'GUEST_ALREADY_ASSIGNED'
} as const; 
import { BaseEntity } from './base';

export enum GuestStatus {
  INVITED = 'INVITED',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING'
}

export interface TableAssignment {
  tableId: string;
  seatNumbers: number[];
  assignedAt: Date;
}

export interface Guest extends BaseEntity {
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  status: GuestStatus;
  partySize: number;
  tableAssignment?: TableAssignment;
}

export interface CreateGuestDto {
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  status?: GuestStatus;
  partySize: number;
}

export interface UpdateGuestDto {
  name?: string;
  email?: string;
  phone?: string;
  status?: GuestStatus;
  partySize?: number;
} 
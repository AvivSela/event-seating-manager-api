import { BaseEntity } from './base';

export enum EventType {
  WEDDING = "WEDDING",
  BIRTHDAY = "BIRTHDAY",
  CORPORATE = "CORPORATE",
  OTHER = "OTHER",
}

export interface Event extends BaseEntity {
  userId: string;  // UUID reference to User
  venueId: string;  // UUID reference to Venue
  type: EventType;
  title: string;
  description: string;
  date: Date;
}

export interface CreateEventDto {
  userId: string;  // UUID reference to User
  venueId: string;  // UUID reference to Venue
  type: EventType;
  title: string;
  description?: string;
  date: string;  // ISO date string
  expectedGuests?: number;  // Optional expected number of guests
}

export interface UpdateEventDto {
  type?: EventType;
  title?: string;
  description?: string;
  date?: string;  // ISO date string
  venueId?: string;  // UUID reference to Venue
  expectedGuests?: number;  // Optional expected number of guests
}

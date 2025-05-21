export enum EventType {
  WEDDING = 'WEDDING',
  BIRTHDAY = 'BIRTHDAY',
  CORPORATE = 'CORPORATE',
  OTHER = 'OTHER'
}

export interface Event {
  id: number;
  userId: number;          // Reference to the owner/user
  venueId: number;         // Reference to the venue
  type: EventType;
  title: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateEventDto {
  type: EventType;
  title: string;
  description: string;
  date: string;           // ISO date string
  venueId: number;        // Reference to the venue
}

export interface UpdateEventDto {
  type?: EventType;
  title?: string;
  description?: string;
  date?: string;          // ISO date string
  venueId?: number;       // Reference to the venue
} 
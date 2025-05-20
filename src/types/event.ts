export enum EventType {
  WEDDING = 'WEDDING',
  BIRTHDAY = 'BIRTHDAY',
  CORPORATE = 'CORPORATE',
  OTHER = 'OTHER'
}

export interface Event {
  id: number;
  userId: number;          // Reference to the owner/user
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
}

export interface UpdateEventDto {
  type?: EventType;
  title?: string;
  description?: string;
  date?: string;          // ISO date string
} 
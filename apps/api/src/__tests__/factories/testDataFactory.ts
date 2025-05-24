import { User } from '../../types/user';
import { Event, EventType } from '../../types/event';
import { Guest, GuestStatus } from '../../types/guest';
import { Venue, TableFeature } from '../../types/venue';
import { TableAssignment } from '../../types/tableAssignment';
import { generateUUID } from '../../utils/uuid';

interface Table {
  tableNumber: string;
  eventId: string;
  capacity: number;
  name: string;
  createdAt: Date;
}

export class TestDataFactory {
  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: generateUUID(),
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      ...overrides
    };
  }

  static createEvent(overrides: Partial<Event> = {}): Event {
    return {
      id: generateUUID(),
      userId: generateUUID(),
      venueId: generateUUID(),
      type: EventType.WEDDING,
      title: 'Test Event',
      description: 'Test Description',
      date: new Date(),
      createdAt: new Date(),
      ...overrides
    };
  }

  static createGuest(overrides: Partial<Guest> = {}): Guest {
    return {
      id: generateUUID(),
      eventId: generateUUID(),
      name: 'Test Guest',
      email: 'guest@example.com',
      phone: '+1234567890',
      partySize: 2,
      status: GuestStatus.PENDING,
      createdAt: new Date(),
      ...overrides
    };
  }

  static createVenue(overrides: Partial<Venue> = {}): Venue {
    return {
      id: generateUUID(),
      name: 'Test Venue',
      address: '123 Test St',
      capacity: 100,
      ownerId: generateUUID(),
      createdAt: new Date(),
      ...overrides
    };
  }

  static createTableFeature(overrides: Partial<TableFeature> = {}): TableFeature {
    return {
      type: "table",
      position: { x: 0, y: 0 },
      dimensions: { width: 20, height: 10 },
      numberOfSeats: 8,
      shape: "rectangular",
      tableNumber: generateUUID(),
      ...overrides
    };
  }

  static createTable(overrides: Partial<Table> = {}): Table {
    return {
      tableNumber: generateUUID(),
      eventId: generateUUID(),
      capacity: 8,
      name: 'Test Table',
      createdAt: new Date(),
      ...overrides
    };
  }
} 
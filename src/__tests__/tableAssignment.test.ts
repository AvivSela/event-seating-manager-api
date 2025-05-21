import request from 'supertest';
import app from '../app';
import { TableAssignment } from '../types/tableAssignment';
import { Guest, GuestStatus } from '../types/guest';
import { Event, EventType } from '../types/event';
import { Venue } from '../types/venue';
import { tableAssignments } from '../controllers/tableAssignmentController';
import { guests } from '../controllers/guestController';
import { events } from '../controllers/eventController';
import { venues } from '../controllers/venueController';
import { generateUUID } from '../utils/uuid';
import { TEST_USER_ID, validVenueMap } from './helpers/fixtures';

describe('Table Assignment API Routes', () => {
  let testEvent: Event;
  let testVenue: Venue;
  let testGuest: Guest;
  let testTableId: string;

  beforeEach(() => {
    // Clear all data
    tableAssignments.length = 0;
    guests.length = 0;
    events.length = 0;
    venues.length = 0;

    // Create test venue
    testVenue = {
      id: generateUUID(),
      name: 'Test Venue',
      address: '123 Test St',
      capacity: 100,
      map: validVenueMap,
      createdAt: new Date()
    };
    venues.push(testVenue);

    // Create test event
    testEvent = {
      id: generateUUID(),
      userId: TEST_USER_ID,
      venueId: testVenue.id,
      type: EventType.WEDDING,
      title: 'Test Wedding',
      description: 'A test wedding event',
      date: new Date('2024-12-31'),
      createdAt: new Date()
    };
    events.push(testEvent);

    // Create test guest
    testGuest = {
      id: generateUUID(),
      eventId: testEvent.id,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      status: GuestStatus.CONFIRMED,
      partySize: 2,
      createdAt: new Date()
    };
    guests.push(testGuest);

    // Get the test table ID from the venue map
    const tableFeature = testVenue.map!.features.find(f => f.type === 'table');
    testTableId = tableFeature!.tableNumber;
  });

  describe('POST /api/events/:eventId/tables/:tableId/assignments', () => {
    it('should create a new table assignment', async () => {
      const assignmentData = {
        guestId: testGuest.id,
        seatNumbers: [1, 2]  // Matches party size of 2
      };

      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        eventId: testEvent.id,
        tableId: testTableId,
        guestId: testGuest.id,
        seatNumbers: [1, 2]
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.assignedAt).toBeDefined();
    });

    it('should validate seat numbers against table capacity', async () => {
      const assignmentData = {
        guestId: testGuest.id,
        seatNumbers: [1, 7]  // 7 is greater than table capacity of 6
      };

      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_SEAT_NUMBERS');
    });

    it('should prevent double booking of seats', async () => {
      // First assignment
      await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      // Create another guest
      const anotherGuest: Guest = {
        id: generateUUID(),
        eventId: testEvent.id,
        name: 'Jane Smith',
        status: GuestStatus.CONFIRMED,
        partySize: 2,
        createdAt: new Date()
      };
      guests.push(anotherGuest);

      // Try to assign same seats
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: anotherGuest.id,
          seatNumbers: [1, 3]  // Seat 1 is already taken
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SEATS_ALREADY_ASSIGNED');
    });

    it('should validate party size matches seat numbers', async () => {
      const assignmentData = {
        guestId: testGuest.id,
        seatNumbers: [1, 2, 3]  // 3 seats for party size of 2
      };

      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_PARTY_SIZE');
    });
  });

  describe('GET /api/events/:eventId/tables/:tableId/assignments', () => {
    it('should return all assignments for a table', async () => {
      // Create an assignment first
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: testTableId,
        guestId: testGuest.id,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      const response = await request(app)
        .get(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(assignment.id);
    });
  });

  describe('DELETE /api/events/:eventId/tables/:tableId/assignments/:guestId', () => {
    it('should delete a table assignment', async () => {
      // Create an assignment first
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: testTableId,
        guestId: testGuest.id,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/tables/${testTableId}/assignments/${testGuest.id}`);

      expect(response.status).toBe(204);

      // Verify assignment was deleted
      const getResponse = await request(app)
        .get(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`);
      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 for non-existent assignment', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/tables/${testTableId}/assignments/${generateUUID()}`);

      expect(response.status).toBe(404);
    });
  });
}); 
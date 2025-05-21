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

    it('should handle invalid event ID format', async () => {
      const response = await request(app)
        .post(`/api/events/invalid-uuid/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid event ID format');
    });

    it('should handle non-existent event', async () => {
      const response = await request(app)
        .post(`/api/events/${generateUUID()}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });

    it('should handle missing venue map', async () => {
      // Create venue without map
      const venueWithoutMap: Venue = {
        id: generateUUID(),
        name: 'Venue Without Map',
        address: '123 Test St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(venueWithoutMap);

      // Create event with the mapless venue
      const eventWithoutMap: Event = {
        id: generateUUID(),
        userId: TEST_USER_ID,
        venueId: venueWithoutMap.id,
        type: EventType.WEDDING,
        title: 'Test Wedding',
        description: 'Test event without venue map',
        date: new Date('2024-12-31'),
        createdAt: new Date()
      };
      events.push(eventWithoutMap);

      const response = await request(app)
        .post(`/api/events/${eventWithoutMap.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Venue or venue map not found');
    });

    it('should handle duplicate seat numbers', async () => {
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 1]  // Duplicate seat number
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_SEAT_NUMBERS');
    });

    it('should handle guest already assigned to another table', async () => {
      // First assignment
      await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      // Try to assign same guest to another table
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [3, 4]
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('GUEST_ALREADY_ASSIGNED');
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

    it('should handle invalid event ID format', async () => {
      const response = await request(app)
        .get(`/api/events/invalid-uuid/tables/${testTableId}/assignments`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid event ID format');
    });

    it('should handle non-existent event', async () => {
      const response = await request(app)
        .get(`/api/events/${generateUUID()}/tables/${testTableId}/assignments`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });

    it('should handle missing venue map', async () => {
      // Create venue without map
      const venueWithoutMap: Venue = {
        id: generateUUID(),
        name: 'Venue Without Map',
        address: '123 Test St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(venueWithoutMap);

      // Create event with the mapless venue
      const eventWithoutMap: Event = {
        id: generateUUID(),
        userId: TEST_USER_ID,
        venueId: venueWithoutMap.id,
        type: EventType.WEDDING,
        title: 'Test Wedding',
        description: 'Test event without venue map',
        date: new Date('2024-12-31'),
        createdAt: new Date()
      };
      events.push(eventWithoutMap);

      const response = await request(app)
        .get(`/api/events/${eventWithoutMap.id}/tables/${testTableId}/assignments`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Venue or venue map not found');
    });

    it('should handle non-existent table', async () => {
      const response = await request(app)
        .get(`/api/events/${testEvent.id}/tables/non-existent-table/assignments`);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('TABLE_NOT_FOUND');
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

    it('should handle invalid event/guest ID format', async () => {
      const response = await request(app)
        .delete(`/api/events/invalid-uuid/tables/${testTableId}/assignments/invalid-uuid`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid ID format');
    });

    it('should handle non-existent event', async () => {
      const response = await request(app)
        .delete(`/api/events/${generateUUID()}/tables/${testTableId}/assignments/${testGuest.id}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });

    it('should handle missing venue map', async () => {
      // Create venue without map
      const venueWithoutMap: Venue = {
        id: generateUUID(),
        name: 'Venue Without Map',
        address: '123 Test St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(venueWithoutMap);

      // Create event with the mapless venue
      const eventWithoutMap: Event = {
        id: generateUUID(),
        userId: TEST_USER_ID,
        venueId: venueWithoutMap.id,
        type: EventType.WEDDING,
        title: 'Test Wedding',
        description: 'Test event without venue map',
        date: new Date('2024-12-31'),
        createdAt: new Date()
      };
      events.push(eventWithoutMap);

      const response = await request(app)
        .delete(`/api/events/${eventWithoutMap.id}/tables/${testTableId}/assignments/${testGuest.id}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Venue or venue map not found');
    });

    it('should handle non-existent table', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/tables/non-existent-table/assignments/${testGuest.id}`);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('TABLE_NOT_FOUND');
    });
  });
}); 
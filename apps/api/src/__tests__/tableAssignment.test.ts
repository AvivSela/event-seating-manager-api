import request from 'supertest';
import app from '../app';
import { TableAssignment } from '../types/tableAssignment';
import { Guest, GuestStatus } from '../types/guest';
import { Event, EventType } from '../types/event';
import { Venue, VenueFeature } from '../types/venue';
import { tableAssignments } from '../controllers/tableAssignmentController';
import { guests } from '../controllers/guestController';
import { events } from '../controllers/eventController';
import { venues } from '../controllers/venueController';
import { generateUUID } from '../utils/uuid';
import { TEST_USER_ID, validVenueMap, testEvent } from './helpers/fixtures';
import { createTestUser, createTestVenue } from './helpers/factories';

describe('Table Assignment API Routes', () => {
  let testEvent: Event;
  let testVenue: Venue;
  let testGuest: Guest;
  let testTableId: string;
  const nonExistentId = generateUUID();

  beforeEach(async () => {
    // Clear all data
    tableAssignments.length = 0;
    guests.length = 0;
    events.length = 0;
    venues.length = 0;

    // Setup test data
    const user = await createTestUser();
    testVenue = await createTestVenue({
      name: 'Test Venue',
      address: '123 Test St',
      capacity: 100,
      description: 'A test venue',
      map: {
        dimensions: { width: 1000, height: 800 },
        features: [
          {
            type: 'table' as const,
            tableNumber: '1',
            numberOfSeats: 4,
            shape: 'round' as const,
            position: { x: 0, y: 0 },
            dimensions: { width: 3, height: 3 }
          } as VenueFeature & { type: 'table' }
        ]
      }
    });

    // Create event using the API directly to match CreateEventDto
    const eventResponse = await request(app)
      .post('/api/events')
      .send({
        type: EventType.WEDDING,
        title: 'Test Wedding',
        description: 'A test wedding event',
        date: '2024-12-31T00:00:00.000Z',
        userId: user.id,
        venueId: testVenue.id
      });
    testEvent = eventResponse.body;
    
    testTableId = (testVenue.map?.features[0] as VenueFeature & { type: 'table' }).tableNumber;

    // Create a test guest
    const guestResponse = await request(app)
      .post(`/api/events/${testEvent.id}/guests`)
      .send({
        name: 'Test Guest',
        email: 'test@example.com',
        partySize: 2
      });
    testGuest = guestResponse.body;
  });

  describe('POST /api/events/:eventId/tables/:tableId/assignments', () => {
    it('should create a table assignment', async () => {
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.eventId).toBe(testEvent.id);
      expect(response.body.tableId).toBe(testTableId);
      expect(response.body.guestId).toBe(testGuest.id);
      expect(response.body.seatNumbers).toEqual([1, 2]);
      expect(response.body).toHaveProperty('assignedAt');
    });

    it('should validate party size matches seat numbers', async () => {
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1] // Only one seat for party size of 2
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('must match party size');
    });

    it('should prevent duplicate seat assignments', async () => {
      // First assignment
      await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      // Create another guest
      const guest2Response = await request(app)
        .post(`/api/events/${testEvent.id}/guests`)
        .send({
          name: 'Test Guest 2',
          email: 'test2@example.com',
          partySize: 2
        });

      // Try to assign overlapping seats
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: guest2Response.body.id,
          seatNumbers: [2, 3] // Seat 2 is already taken
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already assigned');
    });

    it('should validate seat numbers against table capacity', async () => {
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 5] // Table only has 4 seats
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid seat numbers');
    });

    it('should prevent assigning already assigned guest', async () => {
      // First assignment
      await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      // Try to assign same guest to different seats
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [3, 4]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already assigned');
    });

    it('should handle invalid event ID', async () => {
      const response = await request(app)
        .post(`/api/events/invalid-uuid/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid event ID format');
    });

    it('should handle non-existent event', async () => {
      const response = await request(app)
        .post(`/api/events/${nonExistentId}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Event not found');
    });

    it('should handle non-existent table', async () => {
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/nonexistent/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Table not found');
    });

    it('should handle non-existent guest', async () => {
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: nonExistentId,
          seatNumbers: [1, 2]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Guest not found');
    });
  });

  describe('GET /api/events/:eventId/tables/:tableId/assignments', () => {
    it('should return all assignments for a table', async () => {
      // Create an assignment first
      await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });

      const response = await request(app)
        .get(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].tableId).toBe(testTableId);
      expect(response.body[0].guestId).toBe(testGuest.id);
    });

    it('should return empty array for table with no assignments', async () => {
      const response = await request(app)
        .get(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('DELETE /api/events/:eventId/tables/:tableId/assignments/:guestId', () => {
    let testAssignment: TableAssignment;

    beforeEach(async () => {
      // Create an assignment to delete
      const response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`)
        .send({
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        });
      testAssignment = response.body;
    });

    it('should delete a table assignment', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/tables/${testTableId}/assignments/${testGuest.id}`);

      expect(response.status).toBe(204);

      // Verify assignment was deleted
      const getResponse = await request(app)
        .get(`/api/events/${testEvent.id}/tables/${testTableId}/assignments`);
      expect(getResponse.body.length).toBe(0);
    });

    it('should handle non-existent assignment', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/tables/${testTableId}/assignments/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Table assignment not found');
    });

    it('should handle invalid guest ID format', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/tables/${testTableId}/assignments/invalid-uuid`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid ID format');
    });
  });
}); 
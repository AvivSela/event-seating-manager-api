import request from 'supertest';
import app from '../../app';
import { Event, EventType } from '../../types/event';
import { Guest, GuestStatus } from '../../types/guest';
import { Venue } from '../../types/venue';
import { generateUUID } from '../../utils/uuid';
import { TEST_USER_ID, validVenueMap } from '../helpers/fixtures';
import { events } from '../../controllers/eventController';
import { guests } from '../../controllers/guestController';
import { venues } from '../../controllers/venueController';
import { tableAssignments } from '../../controllers/tableAssignmentController';

describe('Guest Management Flow Integration Tests', () => {
  let testVenue: Venue;
  let testEvent: Event;
  let testGuest1: Guest;
  let testGuest2: Guest;
  let tableId: string;

  beforeEach(() => {
    // Clear all data
    venues.length = 0;
    events.length = 0;
    guests.length = 0;
    tableAssignments.length = 0;

    // Create test venue
    testVenue = {
      id: generateUUID(),
      name: 'Integration Test Venue',
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
      title: 'Integration Test Wedding',
      description: 'A test wedding event',
      date: new Date('2024-12-31'),
      createdAt: new Date()
    };
    events.push(testEvent);

    // Get a table ID from the venue map
    tableId = testVenue.map!.features.find(f => f.type === 'table')!.tableNumber;
  });

  describe('Complete Guest Management Flow', () => {
    it('should handle the complete flow of guest management and table assignments', async () => {
      // 1. Create first guest
      const createGuest1Response = await request(app)
        .post(`/api/events/${testEvent.id}/guests`)
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          status: GuestStatus.CONFIRMED,
          partySize: 2
        });

      expect(createGuest1Response.status).toBe(201);
      testGuest1 = createGuest1Response.body;

      // 2. Create second guest
      const createGuest2Response = await request(app)
        .post(`/api/events/${testEvent.id}/guests`)
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '098-765-4321',
          status: GuestStatus.CONFIRMED,
          partySize: 2
        });

      expect(createGuest2Response.status).toBe(201);
      testGuest2 = createGuest2Response.body;

      // 3. Verify both guests are unassigned
      const unassignedResponse = await request(app)
        .get(`/api/events/${testEvent.id}/guests?assigned=false`);
      
      expect(unassignedResponse.status).toBe(200);
      expect(unassignedResponse.body).toHaveLength(2);

      // 4. Assign first guest to table
      const assignGuest1Response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${tableId}/assignments`)
        .send({
          guestId: testGuest1.id,
          seatNumbers: [1, 2]
        });

      expect(assignGuest1Response.status).toBe(201);

      // 5. Verify assigned/unassigned counts
      const assignedResponse = await request(app)
        .get(`/api/events/${testEvent.id}/guests?assigned=true`);
      
      expect(assignedResponse.status).toBe(200);
      expect(assignedResponse.body).toHaveLength(1);
      expect(assignedResponse.body[0].id).toBe(testGuest1.id);

      const stillUnassignedResponse = await request(app)
        .get(`/api/events/${testEvent.id}/guests?assigned=false`);
      
      expect(stillUnassignedResponse.status).toBe(200);
      expect(stillUnassignedResponse.body).toHaveLength(1);
      expect(stillUnassignedResponse.body[0].id).toBe(testGuest2.id);

      // 6. Try to assign second guest to same seats (should fail)
      const conflictingAssignmentResponse = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${tableId}/assignments`)
        .send({
          guestId: testGuest2.id,
          seatNumbers: [1, 2]
        });

      expect(conflictingAssignmentResponse.status).toBe(400);
      expect(conflictingAssignmentResponse.body.code).toBe('SEATS_ALREADY_ASSIGNED');

      // 7. Assign second guest to different seats
      const assignGuest2Response = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${tableId}/assignments`)
        .send({
          guestId: testGuest2.id,
          seatNumbers: [3, 4]
        });

      expect(assignGuest2Response.status).toBe(201);

      // 8. Verify all guests are now assigned
      const finalUnassignedResponse = await request(app)
        .get(`/api/events/${testEvent.id}/guests?assigned=false`);
      
      expect(finalUnassignedResponse.status).toBe(200);
      expect(finalUnassignedResponse.body).toHaveLength(0);

      const finalAssignedResponse = await request(app)
        .get(`/api/events/${testEvent.id}/guests?assigned=true`);
      
      expect(finalAssignedResponse.status).toBe(200);
      expect(finalAssignedResponse.body).toHaveLength(2);

      // 9. Remove first guest's assignment
      const removeAssignmentResponse = await request(app)
        .delete(`/api/events/${testEvent.id}/tables/${tableId}/assignments/${testGuest1.id}`);

      expect(removeAssignmentResponse.status).toBe(204);

      // 10. Verify final state
      const finalStateResponse = await request(app)
        .get(`/api/events/${testEvent.id}/guests`);
      
      expect(finalStateResponse.status).toBe(200);
      expect(finalStateResponse.body).toHaveLength(2);
      
      const finalGuest1 = finalStateResponse.body.find((g: Guest) => g.id === testGuest1.id);
      const finalGuest2 = finalStateResponse.body.find((g: Guest) => g.id === testGuest2.id);
      
      expect(finalGuest1.tableAssignment).toBeUndefined();
      expect(finalGuest2.tableAssignment).toBeDefined();
      expect(finalGuest2.tableAssignment.seatNumbers).toEqual([3, 4]);
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle error scenarios and recovery', async () => {
      // 1. Create a guest
      const createGuestResponse = await request(app)
        .post(`/api/events/${testEvent.id}/guests`)
        .send({
          name: 'Recovery Test Guest',
          email: 'recovery@example.com',
          status: GuestStatus.CONFIRMED,
          partySize: 2
        });

      expect(createGuestResponse.status).toBe(201);
      testGuest1 = createGuestResponse.body;

      // 2. Try to assign to non-existent table
      const badTableResponse = await request(app)
        .post(`/api/events/${testEvent.id}/tables/non-existent-table/assignments`)
        .send({
          guestId: testGuest1.id,
          seatNumbers: [1, 2]
        });

      expect(badTableResponse.status).toBe(400);
      expect(badTableResponse.body.code).toBe('TABLE_NOT_FOUND');

      // 3. Try to assign with wrong party size
      const badSizeResponse = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${tableId}/assignments`)
        .send({
          guestId: testGuest1.id,
          seatNumbers: [1, 2, 3] // Party size is 2 but trying to assign 3 seats
        });

      expect(badSizeResponse.status).toBe(400);
      expect(badSizeResponse.body.code).toBe('INVALID_PARTY_SIZE');

      // 4. Successfully assign after errors
      const successResponse = await request(app)
        .post(`/api/events/${testEvent.id}/tables/${tableId}/assignments`)
        .send({
          guestId: testGuest1.id,
          seatNumbers: [1, 2]
        });

      expect(successResponse.status).toBe(201);
      expect(successResponse.body.seatNumbers).toEqual([1, 2]);

      // 5. Verify final state
      const finalResponse = await request(app)
        .get(`/api/events/${testEvent.id}/guests/${testGuest1.id}`);
      
      expect(finalResponse.status).toBe(200);
      expect(finalResponse.body.tableAssignment).toBeDefined();
      expect(finalResponse.body.tableAssignment.seatNumbers).toEqual([1, 2]);
    });
  });
}); 
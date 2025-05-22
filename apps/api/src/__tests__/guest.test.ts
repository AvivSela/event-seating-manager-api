import request from 'supertest';
import app from '../app';
import { Guest, GuestStatus } from '../types/guest';
import { guests } from '../controllers/guestController';
import { events } from '../controllers/eventController';
import { TEST_USER_ID } from './helpers/fixtures';
import { Event, EventType } from '../types/event';
import { generateUUID } from '../utils/uuid';
import { tableAssignments } from '../controllers/tableAssignmentController';
import { TableAssignment } from '../types/tableAssignment';

describe('Guest API Routes', () => {
  let testEvent: Event;
  let testGuest: Guest;

  beforeEach(() => {
    // Clear the arrays
    guests.length = 0;
    events.length = 0;

    // Create a test event
    testEvent = {
      id: generateUUID(),
      userId: TEST_USER_ID,
      venueId: generateUUID(),
      type: EventType.WEDDING,
      title: 'Test Wedding',
      description: 'A test wedding event',
      date: new Date('2024-12-31'),
      createdAt: new Date()
    };
    events.push(testEvent);

    // Create a test guest
    testGuest = {
      id: generateUUID(),
      eventId: testEvent.id,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      status: GuestStatus.INVITED,
      partySize: 2,
      createdAt: new Date()
    };
    guests.push(testGuest);
  });

  describe('POST /api/events/:eventId/guests', () => {
    it('should create a new guest', async () => {
      const newGuest = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '098-765-4321',
        partySize: 3
      };

      const response = await request(app)
        .post(`/api/events/${testEvent.id}/guests`)
        .send(newGuest);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...newGuest,
        eventId: testEvent.id,
        status: GuestStatus.INVITED
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should validate party size', async () => {
      const invalidGuest = {
        name: 'Invalid Guest',
        partySize: 0
      };

      const response = await request(app)
        .post(`/api/events/${testEvent.id}/guests`)
        .send(invalidGuest);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Party size must be at least 1');
    });

    it('should handle invalid event ID format', async () => {
      const response = await request(app)
        .post('/api/events/invalid-uuid/guests')
        .send({ name: 'Test Guest', partySize: 1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid event ID format');
    });

    it('should handle non-existent event', async () => {
      const response = await request(app)
        .post(`/api/events/${generateUUID()}/guests`)
        .send({ name: 'Test Guest', partySize: 1 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('GET /api/events/:eventId/guests', () => {
    it('should return all guests for an event', async () => {
      const response = await request(app)
        .get(`/api/events/${testEvent.id}/guests`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(testGuest.id);
    });

    it('should handle invalid event ID format', async () => {
      const response = await request(app)
        .get('/api/events/invalid-uuid/guests');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid event ID format');
    });
  });

  describe('GET /api/events/:eventId/guests/:guestId', () => {
    it('should return a specific guest', async () => {
      const response = await request(app)
        .get(`/api/events/${testEvent.id}/guests/${testGuest.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testGuest.id);
      expect(response.body.name).toBe(testGuest.name);
    });

    it('should return 404 for non-existent guest', async () => {
      const response = await request(app)
        .get(`/api/events/${testEvent.id}/guests/${generateUUID()}`);

      expect(response.status).toBe(404);
    });

    it('should handle invalid guest ID format', async () => {
      const response = await request(app)
        .get(`/api/events/${testEvent.id}/guests/invalid-uuid`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid ID format');
    });
  });

  describe('PUT /api/events/:eventId/guests/:guestId', () => {
    it('should update a guest', async () => {
      const updateData = {
        name: 'John Doe Updated',
        status: GuestStatus.CONFIRMED
      };

      const response = await request(app)
        .put(`/api/events/${testEvent.id}/guests/${testGuest.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should handle invalid status value', async () => {
      const response = await request(app)
        .put(`/api/events/${testEvent.id}/guests/${testGuest.id}`)
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid guest status');
    });

    it('should handle invalid guest ID format', async () => {
      const response = await request(app)
        .put(`/api/events/${testEvent.id}/guests/invalid-uuid`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid ID format');
    });
  });

  describe('DELETE /api/events/:eventId/guests/:guestId', () => {
    it('should delete a guest', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/guests/${testGuest.id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app)
        .get(`/api/events/${testEvent.id}/guests/${testGuest.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should handle invalid guest ID format', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/guests/invalid-uuid`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid ID format');
    });
  });

  describe('GET /api/events/:eventId/guests with filtering', () => {
    it('should filter assigned guests', async () => {
      // Create another guest
      const anotherGuest: Guest = {
        id: generateUUID(),
        eventId: testEvent.id,
        name: 'Jane Smith',
        status: GuestStatus.CONFIRMED,
        partySize: 1,
        createdAt: new Date()
      };
      guests.push(anotherGuest);

      // Create a table assignment for the first guest
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: generateUUID(),
        guestId: testGuest.id,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      // Get assigned guests
      const assignedResponse = await request(app)
        .get(`/api/events/${testEvent.id}/guests?assigned=true`);

      expect(assignedResponse.status).toBe(200);
      expect(assignedResponse.body).toHaveLength(1);
      expect(assignedResponse.body[0].id).toBe(testGuest.id);
      expect(assignedResponse.body[0].tableAssignment).toBeDefined();
      expect(assignedResponse.body[0].tableAssignment.tableId).toBe(assignment.tableId);

      // Get unassigned guests
      const unassignedResponse = await request(app)
        .get(`/api/events/${testEvent.id}/guests?assigned=false`);

      expect(unassignedResponse.status).toBe(200);
      expect(unassignedResponse.body).toHaveLength(1);
      expect(unassignedResponse.body[0].id).toBe(anotherGuest.id);
      expect(unassignedResponse.body[0].tableAssignment).toBeUndefined();
    });

    it('should return all guests when no filter is applied', async () => {
      // Create another guest
      const anotherGuest: Guest = {
        id: generateUUID(),
        eventId: testEvent.id,
        name: 'Jane Smith',
        status: GuestStatus.CONFIRMED,
        partySize: 1,
        createdAt: new Date()
      };
      guests.push(anotherGuest);

      // Create a table assignment for the first guest
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: generateUUID(),
        guestId: testGuest.id,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      const response = await request(app)
        .get(`/api/events/${testEvent.id}/guests`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      
      const assignedGuest = response.body.find((g: Guest) => g.id === testGuest.id);
      expect(assignedGuest.tableAssignment).toBeDefined();
      expect(assignedGuest.tableAssignment.tableId).toBe(assignment.tableId);

      const unassignedGuest = response.body.find((g: Guest) => g.id === anotherGuest.id);
      expect(unassignedGuest.tableAssignment).toBeUndefined();
    });
  });
}); 
import request from 'supertest';
import app from '../../app';
import { events } from '../../controllers/eventController';
import { venues } from '../../controllers/venueController';
import { users } from '../../controllers/userController';
import { EventType } from '../../types/event';
import { isValidUUID } from '../../utils/uuid';

describe('Event Routes', () => {
  // Test data
  const testUser = {
    id: '123e4567-e89b-4456-a456-426614174000',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  const testVenue = {
    id: '123e4567-e89b-4456-a456-426614174001',
    name: 'Test Venue',
    address: '123 Test St, Test City, TS 12345',
    capacity: 100,
    createdAt: new Date(),
  };

  beforeEach(() => {
    // Clear arrays before each test
    events.length = 0;
    venues.length = 0;
    users.length = 0;

    // Add test user and venue
    users.push(testUser);
    venues.push(testVenue);
  });

  describe('GET /', () => {
    it('should return empty array when no events exist', async () => {
      const response = await request(app).get('/api/events');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all events', async () => {
      // Create test events
      const event1 = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'Test Event 1',
          date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        });

      const event2 = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.BIRTHDAY,
          title: 'Test Event 2',
          date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        });

      const response = await request(app).get('/api/events');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Event 1',
            type: EventType.WEDDING,
          }),
          expect.objectContaining({
            title: 'Test Event 2',
            type: EventType.BIRTHDAY,
          }),
        ])
      );
    });
  });

  describe('GET /:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app).get('/api/events/invalid-uuid');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid event ID format' });
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app).get('/api/events/123e4567-e89b-4456-a456-426614174002');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Event not found' });
    });

    it('should return event for valid ID', async () => {
      const createResponse = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'Test Event',
          date: new Date(Date.now() + 86400000).toISOString(),
        });

      const response = await request(app).get(`/api/events/${createResponse.body.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: createResponse.body.id,
        title: 'Test Event',
        type: EventType.WEDDING,
      }));
    });
  });

  describe('POST /', () => {
    it('should create new event with valid data', async () => {
      const eventDate = new Date(Date.now() + 86400000).toISOString();
      const response = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'New Event',
          description: 'Test Description',
          date: eventDate,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining({
        title: 'New Event',
        type: EventType.WEDDING,
        description: 'Test Description',
      }));
      expect(isValidUUID(response.body.id)).toBe(true);
      expect(response.body.createdAt).toBeDefined();
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          type: EventType.WEDDING,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Type, title, date, userId, and venueId are required',
      });
    });

    it('should return 400 when user ID is invalid', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          userId: 'invalid-uuid',
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'Test Event',
          date: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid user ID format' });
    });

    it('should return 400 when venue ID is invalid', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: 'invalid-uuid',
          type: EventType.WEDDING,
          title: 'Test Event',
          date: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid venue ID format' });
    });

    it('should return 400 when venue does not exist', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: '123e4567-e89b-4456-a456-426614174999',
          type: EventType.WEDDING,
          title: 'Test Event',
          date: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Venue not found' });
    });

    it('should return 400 when date is in the past', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'Test Event',
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Event date must be in the future' });
    });

    it('should return 400 when expected guests exceed venue capacity', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'Test Event',
          date: new Date(Date.now() + 86400000).toISOString(),
          expectedGuests: testVenue.capacity + 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Expected guests exceed venue capacity' });
    });

    it('should return 400 when venue is already booked for the date', async () => {
      const eventDate = new Date(Date.now() + 86400000).toISOString();
      
      // Create first event
      await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'First Event',
          date: eventDate,
        });

      // Try to create second event on same date
      const response = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.BIRTHDAY,
          title: 'Second Event',
          date: eventDate,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Venue is already booked for this date' });
    });
  });

  describe('PUT /:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .put('/api/events/invalid-uuid')
        .send({ title: 'Updated Event' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid event ID format' });
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .put('/api/events/123e4567-e89b-4456-a456-426614174002')
        .send({ title: 'Updated Event' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Event not found' });
    });

    it('should update event with valid data', async () => {
      // Create an event first
      const createResponse = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'Original Event',
          date: new Date(Date.now() + 86400000).toISOString(),
        });

      const updateResponse = await request(app)
        .put(`/api/events/${createResponse.body.id}`)
        .send({
          title: 'Updated Event',
          type: EventType.BIRTHDAY,
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toEqual(expect.objectContaining({
        id: createResponse.body.id,
        title: 'Updated Event',
        type: EventType.BIRTHDAY,
      }));
      expect(updateResponse.body.updatedAt).toBeDefined();
    });

    it('should return 400 when updating to invalid venue ID', async () => {
      const createResponse = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'Test Event',
          date: new Date(Date.now() + 86400000).toISOString(),
        });

      const response = await request(app)
        .put(`/api/events/${createResponse.body.id}`)
        .send({ venueId: 'invalid-uuid' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid venue ID format' });
    });

    it('should return 400 when updating to non-existent venue', async () => {
      const createResponse = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'Test Event',
          date: new Date(Date.now() + 86400000).toISOString(),
        });

      const response = await request(app)
        .put(`/api/events/${createResponse.body.id}`)
        .send({ venueId: '123e4567-e89b-4456-a456-426614174999' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Venue not found' });
    });

    it('should return 400 when updating to past date', async () => {
      const createResponse = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'Test Event',
          date: new Date(Date.now() + 86400000).toISOString(),
        });

      const response = await request(app)
        .put(`/api/events/${createResponse.body.id}`)
        .send({ date: new Date(Date.now() - 86400000).toISOString() });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Event date must be in the future' });
    });
  });

  describe('DELETE /:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app).delete('/api/events/invalid-uuid');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid event ID format' });
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app).delete('/api/events/123e4567-e89b-4456-a456-426614174002');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Event not found' });
    });

    it('should delete existing event', async () => {
      // Create an event first
      const createResponse = await request(app)
        .post('/api/events')
        .send({
          userId: testUser.id,
          venueId: testVenue.id,
          type: EventType.WEDDING,
          title: 'Test Event',
          date: new Date(Date.now() + 86400000).toISOString(),
        });

      const deleteResponse = await request(app).delete(`/api/events/${createResponse.body.id}`);
      expect(deleteResponse.status).toBe(204);

      // Verify event is deleted
      const getResponse = await request(app).get(`/api/events/${createResponse.body.id}`);
      expect(getResponse.status).toBe(404);
    });
  });
}); 
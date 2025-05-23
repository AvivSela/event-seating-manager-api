import { Request, Response } from 'express';
import {
  getAllEvents,
  getEventsByUserId,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  events
} from '../../controllers/eventController';
import { venues } from '../../controllers/venueController';
import { Event, CreateEventDto, UpdateEventDto, EventType } from '../../types/event';
import { generateUUID } from '../../utils/uuid';

// Mock response object
const mockResponse = () => {
  const res: Partial<Response> = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  };
  return res as Response;
};

// Mock request object with proper typing
const mockRequest = <P = any, B = any>(params: P = {} as P, body: B = {} as B): Request<P, any, B> => {
  return {
    params,
    body
  } as Request<P, any, B>;
};

describe('Event Controller', () => {
  const mockVenue = {
    id: generateUUID(),
    name: 'Test Venue',
    address: '123 Test St, Test City',
    capacity: 100,
    createdAt: new Date()
  };

  const mockUserId = generateUUID();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7); // 7 days in the future

  beforeEach(() => {
    // Clear events array and reset mocks
    events.length = 0;
    venues.length = 0;
    venues.push(mockVenue);
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getAllEvents', () => {
    it('should return all events', () => {
      const testEvents: Event[] = [
        {
          id: generateUUID(),
          userId: mockUserId,
          venueId: mockVenue.id,
          type: EventType.WEDDING,
          title: 'Test Event 1',
          description: 'Description 1',
          date: futureDate,
          createdAt: new Date()
        },
        {
          id: generateUUID(),
          userId: mockUserId,
          venueId: mockVenue.id,
          type: EventType.CORPORATE,
          title: 'Test Event 2',
          description: 'Description 2',
          date: futureDate,
          createdAt: new Date()
        }
      ];
      events.push(...testEvents);

      const req = mockRequest();
      const res = mockResponse();

      getAllEvents(req, res);

      expect(res.json).toHaveBeenCalledWith(testEvents);
    });

    it('should return empty array when no events exist', () => {
      const req = mockRequest();
      const res = mockResponse();

      getAllEvents(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors gracefully', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      // Mock events array to throw error when accessed
      jest.spyOn(events, 'slice').mockImplementation(() => {
        throw new Error('Test error');
      });

      getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to retrieve events' });
    });
  });

  describe('getEventsByUserId', () => {
    it('should return events for valid user ID', () => {
      const testEvent: Event = {
        id: generateUUID(),
        userId: mockUserId,
        venueId: mockVenue.id,
        type: EventType.WEDDING,
        title: 'Test Event',
        description: 'Description',
        date: futureDate,
        createdAt: new Date()
      };
      events.push(testEvent);

      const req = mockRequest<{ userId: string }>({ userId: mockUserId });
      const res = mockResponse();

      getEventsByUserId(req, res);

      expect(res.json).toHaveBeenCalledWith([testEvent]);
    });

    it('should return empty array when user has no events', () => {
      const req = mockRequest<{ userId: string }>({ userId: mockUserId });
      const res = mockResponse();

      getEventsByUserId(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 400 when invalid UUID is provided', () => {
      const req = mockRequest<{ userId: string }>({ userId: 'invalid-uuid' });
      const res = mockResponse();

      getEventsByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });
  });

  describe('getEventById', () => {
    it('should return event when valid ID is provided', () => {
      const testEvent: Event = {
        id: generateUUID(),
        userId: mockUserId,
        venueId: mockVenue.id,
        type: EventType.WEDDING,
        title: 'Test Event',
        description: 'Description',
        date: futureDate,
        createdAt: new Date()
      };
      events.push(testEvent);

      const req = mockRequest<{ id: string }>({ id: testEvent.id });
      const res = mockResponse();

      getEventById(req, res);

      expect(res.json).toHaveBeenCalledWith(testEvent);
    });

    it('should return 404 when event is not found', () => {
      const req = mockRequest<{ id: string }>({ id: generateUUID() });
      const res = mockResponse();

      getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
    });

    it('should return 400 when invalid UUID is provided', () => {
      const req = mockRequest<{ id: string }>({ id: 'invalid-uuid' });
      const res = mockResponse();

      getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid event ID format' });
    });
  });

  describe('createEvent', () => {
    const validEventData: CreateEventDto = {
      userId: mockUserId,
      venueId: mockVenue.id,
      type: EventType.WEDDING,
      title: 'New Event',
      description: 'Event Description',
      date: futureDate.toISOString(),
      expectedGuests: 50
    };

    it('should create a new event with valid data', () => {
      const req = mockRequest<{}, CreateEventDto>({}, validEventData);
      const res = mockResponse();

      createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        userId: validEventData.userId,
        venueId: validEventData.venueId,
        type: validEventData.type,
        title: validEventData.title,
        description: validEventData.description,
        id: expect.any(String),
        createdAt: expect.any(Date)
      }));
      expect(events).toHaveLength(1);
    });

    it('should return 400 when required fields are missing', () => {
      const invalidData = { ...validEventData };
      delete (invalidData as any).title;
      
      const req = mockRequest<{}, CreateEventDto>({}, invalidData as CreateEventDto);
      const res = mockResponse();

      createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Type, title, date, userId, and venueId are required' 
      });
    });

    it('should return 400 when venue does not exist', () => {
      const invalidData = { ...validEventData, venueId: generateUUID() };
      
      const req = mockRequest<{}, CreateEventDto>({}, invalidData);
      const res = mockResponse();

      createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Venue not found' });
    });

    it('should return 400 when event date is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const invalidData = { ...validEventData, date: pastDate.toISOString() };
      const req = mockRequest<{}, CreateEventDto>({}, invalidData);
      const res = mockResponse();

      createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event date must be in the future' });
    });

    it('should return 400 when expected guests exceed venue capacity', () => {
      const invalidData = { ...validEventData, expectedGuests: mockVenue.capacity + 1 };
      const req = mockRequest<{}, CreateEventDto>({}, invalidData);
      const res = mockResponse();

      createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Expected guests exceed venue capacity' });
    });

    it('should return 400 when venue is already booked for the date', () => {
      // Create first event
      events.push({
        id: generateUUID(),
        userId: mockUserId,
        venueId: mockVenue.id,
        type: EventType.WEDDING,
        title: 'Existing Event',
        description: 'Description',
        date: futureDate,
        createdAt: new Date()
      });

      // Try to create second event on same date
      const req = mockRequest<{}, CreateEventDto>({}, validEventData);
      const res = mockResponse();

      createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Venue is already booked for this date' });
    });

    it('should return 400 when invalid user ID format is provided', () => {
      const invalidData = { ...validEventData, userId: 'invalid-uuid' };
      const req = mockRequest<{}, CreateEventDto>({}, invalidData);
      const res = mockResponse();

      createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });

    it('should handle unexpected errors', () => {
      const req = mockRequest<{}, CreateEventDto>({}, validEventData);
      const res = mockResponse();
      
      // Force an error by making venues undefined
      jest.spyOn(venues, 'find').mockImplementation(() => {
        throw new Error('Test error');
      });

      createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create event' });
    });
  });

  describe('updateEvent', () => {
    let testEvent: Event;

    beforeEach(() => {
      testEvent = {
        id: generateUUID(),
        userId: mockUserId,
        venueId: mockVenue.id,
        type: EventType.WEDDING,
        title: 'Original Event',
        description: 'Original Description',
        date: futureDate,
        createdAt: new Date()
      };
      events.push(testEvent);
    });

    it('should update event with new venue and date', () => {
      const newVenue = {
        id: generateUUID(),
        name: 'New Venue',
        address: '456 New St',
        capacity: 200,
        createdAt: new Date()
      };
      venues.push(newVenue);
      
      const newDate = new Date(futureDate);
      newDate.setDate(newDate.getDate() + 1);
      
      const updateData: UpdateEventDto = {
        venueId: newVenue.id,
        date: newDate.toISOString()
      };
      
      const req = mockRequest<{ id: string }, UpdateEventDto>({ id: testEvent.id }, updateData);
      const res = mockResponse();

      updateEvent(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...testEvent,
        venueId: newVenue.id,
        date: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
    });

    it('should update event with all fields', () => {
      const updateData: UpdateEventDto = {
        type: EventType.CORPORATE,
        title: 'Completely Updated Event',
        description: 'New Description',
        date: futureDate.toISOString(),
        venueId: mockVenue.id
      };
      
      const req = mockRequest<{ id: string }, UpdateEventDto>({ id: testEvent.id }, updateData);
      const res = mockResponse();

      updateEvent(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...testEvent,
        ...updateData,
        date: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
    });

    it('should handle unexpected errors', () => {
      const req = mockRequest<{ id: string }, UpdateEventDto>(
        { id: testEvent.id },
        { title: 'Updated Event' }
      );
      const res = mockResponse();
      
      // Force an error
      jest.spyOn(events, 'findIndex').mockImplementation(() => {
        throw new Error('Test error');
      });

      updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to update event' });
    });

    it('should return 404 when event is not found', () => {
      const req = mockRequest<{ id: string }, UpdateEventDto>(
        { id: generateUUID() },
        { title: 'Updated Event' }
      );
      const res = mockResponse();

      updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
    });

    it('should return 400 when invalid venue ID is provided', () => {
      const req = mockRequest<{ id: string }, UpdateEventDto>(
        { id: testEvent.id },
        { venueId: 'invalid-uuid' }
      );
      const res = mockResponse();

      updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid venue ID format' });
    });

    it('should return 400 when new venue does not exist', () => {
      const req = mockRequest<{ id: string }, UpdateEventDto>(
        { id: testEvent.id },
        { venueId: generateUUID() }
      );
      const res = mockResponse();

      updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Venue not found' });
    });

    it('should return 400 when updated date is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const req = mockRequest<{ id: string }, UpdateEventDto>(
        { id: testEvent.id },
        { date: pastDate.toISOString() }
      );
      const res = mockResponse();

      updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event date must be in the future' });
    });

    it('should return 400 when venue is already booked for new date', () => {
      // Create another event
      const otherEvent: Event = {
        id: generateUUID(),
        userId: mockUserId,
        venueId: mockVenue.id,
        type: EventType.CORPORATE,
        title: 'Other Event',
        description: 'Description',
        date: new Date(futureDate),
        createdAt: new Date()
      };
      events.push(otherEvent);

      // Try to update first event to the same date
      const req = mockRequest<{ id: string }, UpdateEventDto>(
        { id: testEvent.id },
        { date: futureDate.toISOString() }
      );
      const res = mockResponse();

      updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Venue is already booked for this date' });
    });

    it('should return 400 when new venue cannot accommodate existing guests', () => {
      const newVenue = {
        id: generateUUID(),
        name: 'Small Venue',
        address: '456 Small St',
        capacity: 10,
        createdAt: new Date()
      };
      venues.push(newVenue);

      // Mock global guests array
      (global as any).guests = [
        { eventId: testEvent.id, partySize: 20 },
        { eventId: testEvent.id, partySize: 30 }
      ];

      const req = mockRequest<{ id: string }, UpdateEventDto>(
        { id: testEvent.id },
        { venueId: newVenue.id }
      );
      const res = mockResponse();

      updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'New venue capacity cannot accommodate existing guests' 
      });

      // Clean up
      delete (global as any).guests;
    });
  });

  describe('deleteEvent', () => {
    let testEvent: Event;

    beforeEach(() => {
      testEvent = {
        id: generateUUID(),
        userId: mockUserId,
        venueId: mockVenue.id,
        type: EventType.WEDDING,
        title: 'Test Event',
        description: 'Description',
        date: futureDate,
        createdAt: new Date()
      };
      events.push(testEvent);
    });

    it('should delete existing event', () => {
      const req = mockRequest<{ id: string }>({ id: testEvent.id });
      const res = mockResponse();

      deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(events).toHaveLength(0);
    });

    it('should return 404 when event is not found', () => {
      const req = mockRequest<{ id: string }>({ id: generateUUID() });
      const res = mockResponse();

      deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
    });

    it('should return 400 when invalid UUID is provided', () => {
      const req = mockRequest<{ id: string }>({ id: 'invalid-uuid' });
      const res = mockResponse();

      deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid event ID format' });
    });

    it('should handle unexpected errors', () => {
      const req = mockRequest<{ id: string }>({ id: testEvent.id });
      const res = mockResponse();

      // Force an error by making events.filter throw
      jest.spyOn(events, 'filter').mockImplementation(() => {
        throw new Error('Test error');
      });

      deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to delete event' });
    });
  });
}); 
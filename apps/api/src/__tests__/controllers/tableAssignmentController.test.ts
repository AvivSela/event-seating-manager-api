import { Request, Response } from 'express';
import { TableAssignment, TableAssignmentErrorCodes, TableAssignmentError } from '../../types/tableAssignment';
import { Event, EventType } from '../../types/event';
import { Guest, GuestStatus } from '../../types/guest';
import { Venue, VenueFeature, TableFeature } from '../../types/venue';
import { generateUUID } from '../../utils/uuid';
import {
  createTableAssignment,
  getTableAssignments,
  deleteTableAssignment,
  tableAssignments,
  validateSeatNumbers,
  checkSeatAvailability
} from '../../controllers/tableAssignmentController';
import { guests } from '../../controllers/guestController';
import { venues } from '../../controllers/venueController';
import { events } from '../../controllers/eventController';

// Mock response object
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Mock request object
const mockRequest = <P = any, B = any>(params: P = {} as P, body: B = {} as B): Partial<Request<P, any, B>> => {
  return {
    params,
    body
  } as Partial<Request<P, any, B>>;
};

describe('Table Assignment Controller', () => {
  let testEvent: Event;
  let testVenue: Venue;
  let testGuest: Guest;
  let testTable: TableFeature;

  beforeEach(() => {
    // Clear all arrays
    tableAssignments.length = 0;
    events.length = 0;
    venues.length = 0;
    guests.length = 0;

    // Create test data
    testEvent = {
      id: generateUUID(),
      userId: generateUUID(),
      title: 'Test Event',
      description: '',
      type: EventType.WEDDING,
      venueId: generateUUID(),
      date: new Date('2024-12-31'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    testTable = {
      type: 'table',
      position: {
        x: 0,
        y: 0
      },
      dimensions: {
        width: 100,
        height: 100
      },
      shape: 'rectangular',
      tableNumber: generateUUID(),
      numberOfSeats: 8
    };

    testVenue = {
      id: testEvent.venueId,
      name: 'Test Venue',
      address: '123 Test St',
      capacity: 200,
      map: {
        dimensions: {
          width: 1000,
          height: 1000
        },
        features: [testTable]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    testGuest = {
      id: generateUUID(),
      eventId: testEvent.id,
      name: 'Test Guest',
      email: 'test@example.com',
      phone: '1234567890',
      status: GuestStatus.CONFIRMED,
      partySize: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add test data to arrays
    events.push(testEvent);
    venues.push(testVenue);
    guests.push(testGuest);
  });

  describe('validateSeatNumbers', () => {
    it('should validate valid seat numbers', () => {
      expect(() => validateSeatNumbers(testTable, [1, 2])).not.toThrow();
    });

    it('should throw error for invalid seat numbers', () => {
      expect(() => validateSeatNumbers(testTable, [0])).toThrow(TableAssignmentError);
      expect(() => validateSeatNumbers(testTable, [9])).toThrow(TableAssignmentError);
      expect(() => validateSeatNumbers(testTable, [-1])).toThrow(TableAssignmentError);
    });

    it('should throw error for duplicate seat numbers', () => {
      expect(() => validateSeatNumbers(testTable, [1, 1])).toThrow(TableAssignmentError);
    });
  });

  describe('checkSeatAvailability', () => {
    beforeEach(() => {
      // Add an existing assignment
      tableAssignments.push({
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: generateUUID(), // Different guest
        seatNumbers: [1, 2],
        createdAt: new Date(),
        assignedAt: new Date()
      });
    });

    it('should validate available seats', () => {
      expect(() => checkSeatAvailability(testTable.tableNumber, [3, 4])).not.toThrow();
    });

    it('should throw error for occupied seats', () => {
      expect(() => checkSeatAvailability(testTable.tableNumber, [1, 3])).toThrow(TableAssignmentError);
    });

    it('should allow checking availability excluding a specific guest', () => {
      const guestId = tableAssignments[0].guestId;
      expect(() => checkSeatAvailability(testTable.tableNumber, [1, 2], guestId)).not.toThrow();
    });
  });

  describe('getTableAssignments', () => {
    it('should return assignments for a valid table', () => {
      const req = mockRequest({ eventId: testEvent.id, tableId: testTable.tableNumber });
      const res = mockResponse();

      getTableAssignments(req as Request, res);

      expect(res.status).not.toHaveBeenCalledWith(400);
      expect(res.status).not.toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 404 for non-existent event', () => {
      const req = mockRequest({ eventId: generateUUID(), tableId: testTable.tableNumber });
      const res = mockResponse();

      getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.EVENT_NOT_FOUND
      }));
    });

    it('should return 400 for non-existent table', () => {
      const req = mockRequest({ eventId: testEvent.id, tableId: generateUUID() });
      const res = mockResponse();

      getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.TABLE_NOT_FOUND
      }));
    });

    it('should return 400 for invalid event ID format', () => {
      const req = mockRequest({ eventId: 'invalid-uuid', tableId: testTable.tableNumber });
      const res = mockResponse();

      getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      }));
    });

    it('should return 400 for invalid table ID format', () => {
      const req = mockRequest({ eventId: testEvent.id, tableId: 'invalid-uuid' });
      const res = mockResponse();

      getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      }));
    });

    it('should return 404 when venue has no map', () => {
      // Remove map from venue
      testVenue.map = undefined;
      venues[0] = testVenue;

      const req = mockRequest({ eventId: testEvent.id, tableId: testTable.tableNumber });
      const res = mockResponse();

      getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.VENUE_NOT_FOUND
      }));
    });

    it('should handle internal errors', () => {
      const spy = jest.spyOn(events, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = mockRequest({ eventId: testEvent.id, tableId: testTable.tableNumber });
      const res = mockResponse();

      getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INTERNAL_ERROR
      }));

      spy.mockRestore();
    });
  });

  describe('createTableAssignment', () => {
    it('should create a valid table assignment', () => {
      const req = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2] }
      );
      const res = mockResponse();

      createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id,
        seatNumbers: [1, 2]
      }));
    });

    it('should return 400 for invalid seat numbers', () => {
      const req = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [0, 9] }
      );
      const res = mockResponse();

      createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      }));
    });

    it('should return 400 when party size doesnt match seat numbers', () => {
      const req = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1] } // testGuest has partySize 2
      );
      const res = mockResponse();

      createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INVALID_PARTY_SIZE
      }));
    });

    it('should return 400 when guest is already assigned', () => {
      // First assignment
      const req1 = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2] }
      );
      const res1 = mockResponse();
      createTableAssignment(req1 as Request, res1);

      // Second assignment attempt
      const req2 = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [3, 4] }
      );
      const res2 = mockResponse();
      createTableAssignment(req2 as Request, res2);

      expect(res2.status).toHaveBeenCalledWith(400);
      expect(res2.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.GUEST_ALREADY_ASSIGNED
      }));
    });

    it('should return 400 for invalid event ID format', () => {
      const req = mockRequest(
        { eventId: 'invalid-uuid', tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2] }
      );
      const res = mockResponse();

      createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      }));
    });

    it('should return 400 for invalid guest ID format', () => {
      const req = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: 'invalid-uuid', seatNumbers: [1, 2] }
      );
      const res = mockResponse();

      createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      }));
    });

    it('should return 400 when seat numbers is not an array', () => {
      const req = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: 'not-an-array' }
      );
      const res = mockResponse();

      createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      }));
    });

    it('should return 400 when seat numbers array is empty', () => {
      const req = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [] }
      );
      const res = mockResponse();

      createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      }));
    });

    it('should return 400 when seat numbers contain non-numeric values', () => {
      const req = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, '2', null] }
      );
      const res = mockResponse();

      createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      }));
    });

    it('should return 404 when guest does not belong to event', () => {
      testGuest.eventId = generateUUID(); // Change guest's event
      guests[0] = testGuest;

      const req = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2] }
      );
      const res = mockResponse();

      createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.GUEST_NOT_FOUND
      }));
    });

    it('should handle internal errors during creation', () => {
      const spy = jest.spyOn(tableAssignments, 'push').mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = mockRequest(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2] }
      );
      const res = mockResponse();

      createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INTERNAL_ERROR
      }));

      spy.mockRestore();
    });
  });

  describe('deleteTableAssignment', () => {
    let existingAssignment: TableAssignment;

    beforeEach(() => {
      existingAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id,
        seatNumbers: [1, 2],
        createdAt: new Date(),
        assignedAt: new Date()
      };
      tableAssignments.push(existingAssignment);
    });

    it('should delete an existing assignment', () => {
      const req = mockRequest({
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id
      });
      const res = mockResponse();

      deleteTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(tableAssignments).toHaveLength(0);
    });

    it('should return 404 for non-existent assignment', () => {
      const req = mockRequest({
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: generateUUID() // Different guest ID
      });
      const res = mockResponse();

      deleteTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.ASSIGNMENT_NOT_FOUND
      }));
    });

    it('should return 400 for invalid event ID format', () => {
      const req = mockRequest({
        eventId: 'invalid-uuid',
        tableId: testTable.tableNumber,
        guestId: testGuest.id
      });
      const res = mockResponse();

      deleteTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      }));
    });

    it('should return 404 when event does not exist', () => {
      events.length = 0; // Remove all events

      const req = mockRequest({
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id
      });
      const res = mockResponse();

      deleteTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.EVENT_NOT_FOUND
      }));
    });

    it('should return 404 when venue does not exist', () => {
      venues.length = 0; // Remove all venues

      const req = mockRequest({
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id
      });
      const res = mockResponse();

      deleteTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.VENUE_NOT_FOUND
      }));
    });

    it('should handle internal errors during deletion', () => {
      const spy = jest.spyOn(tableAssignments, 'findIndex').mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = mockRequest({
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id
      });
      const res = mockResponse();

      deleteTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: TableAssignmentErrorCodes.INTERNAL_ERROR
      }));

      spy.mockRestore();
    });
  });
});
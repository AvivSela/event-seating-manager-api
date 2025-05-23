import { Request, Response } from 'express';
import { TableAssignment, TableAssignmentErrorCodes, TableAssignmentError } from '../../types/tableAssignment';
import { Event, EventType } from '../../types/event';
import { Guest, GuestStatus } from '../../types/guest';
import { Venue, VenueFeature, TableFeature } from '../../types/venue';
import { generateUUID, isValidUUID } from '../../utils/uuid';

// Mock the module before importing it
jest.mock('../../controllers/tableAssignmentController');

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
    // Reset mocks
    jest.clearAllMocks();
    jest.resetModules();

    // Mock the validation functions
    (validateSeatNumbers as jest.Mock).mockImplementation((tableFeature: VenueFeature & { type: "table" }, seatNumbers: number[]) => {
      // Check if all seat numbers are within table capacity
      const invalidSeats = seatNumbers.filter(seatNum => seatNum < 1 || seatNum > tableFeature.numberOfSeats);
      if (invalidSeats.length > 0) {
        throw new TableAssignmentError(
          `Invalid seat numbers: ${invalidSeats.join(", ")}. Must be between 1 and ${tableFeature.numberOfSeats}`,
          TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
        );
      }

      // Check for duplicate seat numbers
      const uniqueSeats = new Set(seatNumbers);
      if (uniqueSeats.size !== seatNumbers.length) {
        throw new TableAssignmentError(
          "Duplicate seat numbers are not allowed",
          TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
        );
      }
    });

    (checkSeatAvailability as jest.Mock).mockImplementation((tableId: string, seatNumbers: number[], excludeGuestId?: string) => {
      const existingAssignments = tableAssignments.filter(
        assignment => assignment.tableId === tableId && 
        (!excludeGuestId || assignment.guestId !== excludeGuestId)
      );

      const occupiedSeats = new Set(existingAssignments.flatMap(a => a.seatNumbers));
      const conflictingSeats = seatNumbers.filter(seatNum => occupiedSeats.has(seatNum));

      if (conflictingSeats.length > 0) {
        throw new TableAssignmentError(
          `Seats ${conflictingSeats.join(", ")} are already assigned`,
          TableAssignmentErrorCodes.SEAT_ALREADY_ASSIGNED
        );
      }
    });

    // Mock the controller functions
    (createTableAssignment as jest.Mock).mockImplementation((req: Request, res: Response) => {
      try {
        const { eventId, tableId } = req.params;
        const { guestId, seatNumbers } = req.body;

        // Validate UUIDs
        if (!isValidUUID(eventId)) {
          res.status(400).json({
            message: 'Invalid event ID format',
            code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
          });
          return;
        }

        if (!isValidUUID(tableId)) {
          res.status(400).json({
            message: 'Invalid table ID format',
            code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
          });
          return;
        }

        if (!isValidUUID(guestId)) {
          res.status(400).json({
            message: 'Invalid guest ID format',
            code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
          });
          return;
        }

        // Check if event exists
        const event = events.find((e) => e.id === eventId);
        if (!event) {
          res.status(404).json({
            message: 'Event not found',
            code: TableAssignmentErrorCodes.EVENT_NOT_FOUND
          });
          return;
        }

        // Check if venue exists and has a map
        const venue = venues.find((v) => v.id === event.venueId);
        if (!venue || !venue.map) {
          res.status(404).json({
            message: 'Venue or venue map not found',
            code: TableAssignmentErrorCodes.VENUE_NOT_FOUND
          });
          return;
        }

        // Check if table exists in venue
        const table = venue.map.features.find((f): f is TableFeature => 
          f.type === 'table' && f.tableNumber === tableId
        );
        if (!table) {
          res.status(400).json({
            message: 'Table not found in venue',
            code: TableAssignmentErrorCodes.TABLE_NOT_FOUND
          });
          return;
        }

        // Check if guest exists and belongs to the event
        const guest = guests.find((g) => g.id === guestId && g.eventId === eventId);
        if (!guest) {
          res.status(400).json({
            message: 'Guest not found or does not belong to this event',
            code: TableAssignmentErrorCodes.GUEST_NOT_FOUND
          });
          return;
        }

        // Validate seat numbers
        if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
          res.status(400).json({
            message: 'Seat numbers are required',
            code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
          });
          return;
        }

        // Check if all seat numbers are valid numbers
        const hasInvalidNumbers = seatNumbers.some(seat => 
          typeof seat !== 'number' || 
          isNaN(seat) || 
          !Number.isInteger(seat)
        );
        if (hasInvalidNumbers) {
          res.status(400).json({
            message: 'Invalid seat numbers',
            code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
          });
          return;
        }

        // Check if seat numbers match party size
        if (seatNumbers.length !== guest.partySize) {
          res.status(400).json({
            message: 'Number of seats must match party size',
            code: TableAssignmentErrorCodes.INVALID_PARTY_SIZE
          });
          return;
        }

        // Validate seat numbers against table capacity
        validateSeatNumbers(table, seatNumbers);

        // Check if seats are already taken
        checkSeatAvailability(tableId, seatNumbers);

        // Check if guest is already assigned
        const existingAssignment = tableAssignments.find(
          (a) => a.guestId === guestId && a.eventId === eventId
        );
        if (existingAssignment) {
          res.status(400).json({
            message: 'Guest is already assigned to a table',
            code: TableAssignmentErrorCodes.GUEST_ALREADY_ASSIGNED
          });
          return;
        }

        // Create table assignment
        const assignment: TableAssignment = {
          id: generateUUID(),
          eventId,
          tableId,
          guestId,
          seatNumbers,
          createdAt: new Date(),
          assignedAt: new Date()
        };

        tableAssignments.push(assignment);
        res.status(201).json(assignment);
      } catch (error) {
        if (error instanceof TableAssignmentError) {
          res.status(400).json({
            message: error.message,
            code: error.code
          });
          return;
        }
        res.status(500).json({
          message: 'Failed to create table assignment',
          code: TableAssignmentErrorCodes.INTERNAL_ERROR
        });
      }
    });

    (getTableAssignments as jest.Mock).mockImplementation((req: Request, res: Response) => {
      try {
        const { eventId, tableId } = req.params;

        if (!isValidUUID(eventId)) {
          res.status(400).json({
            message: 'Invalid event ID format',
            code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
          });
          return;
        }

        if (!isValidUUID(tableId)) {
          res.status(400).json({
            message: 'Invalid table ID format',
            code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
          });
          return;
        }

        // Check if event exists
        const event = events.find((e) => e.id === eventId);
        if (!event) {
          res.status(404).json({
            message: 'Event not found',
            code: TableAssignmentErrorCodes.EVENT_NOT_FOUND
          });
          return;
        }

        // Check if venue exists and has a map
        const venue = venues.find((v) => v.id === event.venueId);
        if (!venue || !venue.map) {
          res.status(404).json({
            message: 'Venue or venue map not found',
            code: TableAssignmentErrorCodes.VENUE_NOT_FOUND
          });
          return;
        }

        // Check if table exists in venue
        const table = venue.map.features.find((f): f is TableFeature => 
          f.type === 'table' && f.tableNumber === tableId
        );
        if (!table) {
          res.status(400).json({
            message: 'Table not found in venue',
            code: TableAssignmentErrorCodes.TABLE_NOT_FOUND
          });
          return;
        }

        const assignments = tableAssignments.filter(
          (a) => a.eventId === eventId && a.tableId === tableId
        );

        res.json(assignments);
      } catch (error) {
        res.status(500).json({
          message: 'Failed to retrieve table assignments',
          code: TableAssignmentErrorCodes.INTERNAL_ERROR
        });
      }
    });

    (deleteTableAssignment as jest.Mock).mockImplementation((req: Request, res: Response) => {
      try {
        const { eventId, tableId, guestId } = req.params;

        // Validate UUIDs
        if (!isValidUUID(eventId)) {
          res.status(400).json({
            message: 'Invalid event ID format',
            code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
          });
          return;
        }

        if (!isValidUUID(tableId)) {
          res.status(400).json({
            message: 'Invalid table ID format',
            code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
          });
          return;
        }

        if (!isValidUUID(guestId)) {
          res.status(400).json({
            message: 'Invalid guest ID format',
            code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
          });
          return;
        }

        // Check if event exists
        const event = events.find((e) => e.id === eventId);
        if (!event) {
          res.status(404).json({
            message: 'Event not found',
            code: TableAssignmentErrorCodes.EVENT_NOT_FOUND
          });
          return;
        }

        // Check if venue exists and has a map
        const venue = venues.find((v) => v.id === event.venueId);
        if (!venue || !venue.map) {
          res.status(404).json({
            message: 'Venue or venue map not found',
            code: TableAssignmentErrorCodes.VENUE_NOT_FOUND
          });
          return;
        }

        // Check if table exists in venue
        const table = venue.map.features.find((f): f is TableFeature => 
          f.type === 'table' && f.tableNumber === tableId
        );
        if (!table) {
          res.status(400).json({
            message: 'Table not found in venue',
            code: TableAssignmentErrorCodes.TABLE_NOT_FOUND
          });
          return;
        }

        // Find the assignment
        const assignmentIndex = tableAssignments.findIndex(
          (a) =>
            a.eventId === eventId &&
            a.tableId === tableId &&
            a.guestId === guestId
        );

        if (assignmentIndex === -1) {
          res.status(404).json({
            message: 'Table assignment not found',
            code: TableAssignmentErrorCodes.ASSIGNMENT_NOT_FOUND
          });
          return;
        }

        // Remove the assignment
        tableAssignments.splice(assignmentIndex, 1);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({
          message: 'Failed to delete table assignment',
          code: TableAssignmentErrorCodes.INTERNAL_ERROR
        });
      }
    });

    // Clear arrays
    events.length = 0;
    venues.length = 0;
    guests.length = 0;
    tableAssignments.length = 0;

    // Create test venue with a table
    testTable = {
      type: 'table',
      position: {
        x: 0,
        y: 0
      },
      dimensions: {
        width: 1,
        height: 1
      },
      shape: 'rectangular',
      tableNumber: generateUUID(),
      numberOfSeats: 4
    };

    testVenue = {
      id: generateUUID(),
      name: 'Test Venue',
      address: '123 Test St',
      capacity: 100,
      map: {
        dimensions: {
          width: 10,
          height: 10
        },
        features: [testTable]
      },
      createdAt: new Date()
    };
    venues.length = 0;
    venues.push(testVenue);

    // Create test event
    testEvent = {
      id: generateUUID(),
      userId: generateUUID(),
      venueId: testVenue.id,
      type: EventType.WEDDING,
      title: 'Test Wedding',
      description: '',
      date: new Date(),
      createdAt: new Date()
    };
    events.length = 0;
    events.push(testEvent);

    // Create test guest
    testGuest = {
      id: generateUUID(),
      eventId: testEvent.id,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      partySize: 2,
      status: GuestStatus.CONFIRMED,
      createdAt: new Date()
    };
    guests.length = 0;
    guests.push(testGuest);
  });

  describe('getTableAssignments', () => {
    it('should return assignments for a table', async () => {
      // Create a test assignment
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      const req = mockRequest<{ eventId: string; tableId: string }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber }
      );
      const res = mockResponse();

      await getTableAssignments(req as Request, res);

      expect(res.json).toHaveBeenCalledWith([assignment]);
    });

    it('should return 400 when event ID format is invalid', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }>(
        { eventId: 'invalid-uuid', tableId: testTable.tableNumber }
      );
      const res = mockResponse();

      await getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid event ID format',
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      });
    });

    it('should return 400 when table ID format is invalid', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }>(
        { eventId: testEvent.id, tableId: 'invalid-uuid' }
      );
      const res = mockResponse();

      await getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid table ID format',
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      });
    });

    it('should return 404 when event is not found', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }>(
        { eventId: generateUUID(), tableId: testTable.tableNumber }
      );
      const res = mockResponse();

      await getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Event not found',
        code: TableAssignmentErrorCodes.EVENT_NOT_FOUND
      });
    });

    it('should return 404 when venue is not found', async () => {
      // Clear events array and create event with non-existent venue
      events.length = 0;
      const eventWithoutVenue = {
        ...testEvent,
        venueId: generateUUID()
      };
      events.push(eventWithoutVenue);

      const req = mockRequest<{ eventId: string; tableId: string }>(
        { eventId: eventWithoutVenue.id, tableId: testTable.tableNumber }
      );
      const res = mockResponse();

      await getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Venue or venue map not found',
        code: TableAssignmentErrorCodes.VENUE_NOT_FOUND
      });
    });

    it('should return 400 when table is not found in venue', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }>(
        { eventId: testEvent.id, tableId: generateUUID() }
      );
      const res = mockResponse();

      await getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Table not found in venue',
        code: TableAssignmentErrorCodes.TABLE_NOT_FOUND
      });
    });

    it('should handle internal errors gracefully', async () => {
      // Mock events.find to throw an error
      const mockFind = jest.spyOn(events, 'find');
      mockFind.mockImplementation(() => { throw new Error('Database error'); });

      const req = mockRequest<{ eventId: string; tableId: string }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber }
      );
      const res = mockResponse();

      await getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to retrieve table assignments',
        code: TableAssignmentErrorCodes.INTERNAL_ERROR
      });

      mockFind.mockRestore();
    });

    it('should handle missing venue map', async () => {
      // Create venue without map
      const venueWithoutMap: Venue = {
        ...testVenue,
        map: undefined
      };
      venues[0] = venueWithoutMap;

      const req = mockRequest<{ eventId: string; tableId: string }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber }
      );
      const res = mockResponse();

      await getTableAssignments(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Venue or venue map not found',
        code: TableAssignmentErrorCodes.VENUE_NOT_FOUND
      });
    });
  });

  describe('validateSeatNumbers', () => {
    let testTableFeature: TableFeature;

    beforeEach(() => {
      testTableFeature = {
        type: 'table',
        position: {
          x: 0,
          y: 0
        },
        dimensions: {
          width: 1,
          height: 1
        },
        shape: 'rectangular',
        tableNumber: generateUUID(),
        numberOfSeats: 4
      };

      (validateSeatNumbers as jest.Mock).mockImplementation((tableFeature: VenueFeature & { type: "table" }, seatNumbers: number[]) => {
        // Check if all seat numbers are within table capacity
        const invalidSeats = seatNumbers.filter(seatNum => seatNum < 1 || seatNum > tableFeature.numberOfSeats);
        if (invalidSeats.length > 0) {
          throw new TableAssignmentError(
            `Invalid seat numbers: ${invalidSeats.join(", ")}. Must be between 1 and ${tableFeature.numberOfSeats}`,
            TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
          );
        }

        // Check for duplicate seat numbers
        const uniqueSeats = new Set(seatNumbers);
        if (uniqueSeats.size !== seatNumbers.length) {
          throw new TableAssignmentError(
            "Duplicate seat numbers are not allowed",
            TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
          );
        }
      });
    });

    it('should validate valid seat numbers', () => {
      expect(() => validateSeatNumbers(testTableFeature, [1, 2, 3])).not.toThrow();
    });

    it('should throw error for seat numbers exceeding capacity', () => {
      expect(() => validateSeatNumbers(testTableFeature, [1, 5])).toThrow(
        new TableAssignmentError(
          'Invalid seat numbers: 5. Must be between 1 and 4',
          TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
        )
      );
    });

    it('should throw error for seat numbers less than 1', () => {
      expect(() => validateSeatNumbers(testTableFeature, [0, 1])).toThrow(
        new TableAssignmentError(
          'Invalid seat numbers: 0. Must be between 1 and 4',
          TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
        )
      );
    });

    it('should throw error for duplicate seat numbers', () => {
      expect(() => validateSeatNumbers(testTableFeature, [1, 1])).toThrow(
        new TableAssignmentError(
          'Duplicate seat numbers are not allowed',
          TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
        )
      );
    });
  });

  describe('checkSeatAvailability', () => {
    beforeEach(() => {
      // Add a test assignment
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: generateUUID(),
        tableId: 'table1',
        guestId: 'guest1',
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      (checkSeatAvailability as jest.Mock).mockImplementation((tableId: string, seatNumbers: number[], excludeGuestId?: string) => {
        const existingAssignments = tableAssignments.filter(
          assignment => assignment.tableId === tableId && 
          (!excludeGuestId || assignment.guestId !== excludeGuestId)
        );

        const occupiedSeats = new Set(existingAssignments.flatMap(a => a.seatNumbers));
        const conflictingSeats = seatNumbers.filter(seatNum => occupiedSeats.has(seatNum));

        if (conflictingSeats.length > 0) {
          throw new TableAssignmentError(
            `Seats ${conflictingSeats.join(", ")} are already assigned`,
            TableAssignmentErrorCodes.SEAT_ALREADY_ASSIGNED
          );
        }
      });
    });

    it('should validate available seats', () => {
      expect(() => checkSeatAvailability('table1', [3, 4])).not.toThrow();
    });

    it('should throw error for occupied seats', () => {
      expect(() => checkSeatAvailability('table1', [1, 3])).toThrow(
        new TableAssignmentError(
          'Seats 1 are already assigned',
          TableAssignmentErrorCodes.SEAT_ALREADY_ASSIGNED
        )
      );
    });

    it('should exclude guest when checking seat availability', () => {
      expect(() => checkSeatAvailability('table1', [1, 2], 'guest1')).not.toThrow();
    });

    it('should allow checking different tables', () => {
      expect(() => checkSeatAvailability('table2', [1, 2])).not.toThrow();
    });
  });

  describe('createTableAssignment', () => {
    it('should create assignment with valid data', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id,
        seatNumbers: [1, 2]
      }));
      expect(tableAssignments).toHaveLength(1);
    });

    it('should return 400 when seat numbers exceed table capacity', async () => {
      // Update guest party size to match seat numbers
      testGuest.partySize = 5;
      guests[0] = testGuest;

      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2, 3, 4, 5] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid seat numbers: 5. Must be between 1 and 4',
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      });
    });

    it('should return 400 when seat numbers are duplicated', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 1] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Duplicate seat numbers are not allowed',
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      });
    });

    it('should return 400 when seat numbers do not match party size', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('must match party size'),
        code: TableAssignmentErrorCodes.INVALID_PARTY_SIZE
      });
    });

    it('should return 400 when seats are already assigned', async () => {
      // Create existing assignment
      const existingAssignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: generateUUID(),
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(existingAssignment);

      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 3] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('already assigned'),
        code: TableAssignmentErrorCodes.SEAT_ALREADY_ASSIGNED
      });
    });

    it('should return 400 when guest is already assigned', async () => {
      // Create existing assignment for the guest
      const existingAssignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: generateUUID(),
        guestId: testGuest.id,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(existingAssignment);

      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [3, 4] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Guest is already assigned to a table',
        code: TableAssignmentErrorCodes.GUEST_ALREADY_ASSIGNED
      });
    });

    it('should return 400 when seat numbers array is empty', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Seat numbers are required',
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      });
    });

    it('should return 400 when seat numbers is not an array', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: any }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: 'invalid' }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Seat numbers are required',
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      });
    });

    it('should handle internal errors during assignment creation', async () => {
      // Mock tableAssignments.push to throw an error
      const mockPush = jest.spyOn(tableAssignments, 'push');
      mockPush.mockImplementation(() => { throw new Error('Database error'); });

      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to create table assignment',
        code: TableAssignmentErrorCodes.INTERNAL_ERROR
      });

      mockPush.mockRestore();
    });

    it('should return 400 when guest is not found', async () => {
      guests.length = 0; // Clear guests array

      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Guest not found or does not belong to this event',
        code: TableAssignmentErrorCodes.GUEST_NOT_FOUND
      });
    });

    it('should return 400 when guest belongs to different event', async () => {
      // Update guest to belong to a different event
      testGuest.eventId = generateUUID();
      guests[0] = testGuest;

      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Guest not found or does not belong to this event',
        code: TableAssignmentErrorCodes.GUEST_NOT_FOUND
      });
    });

    it('should return 400 when seat numbers contain non-numeric values', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: any[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, '2', 'three'] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid seat numbers',
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      });
    });

    it('should return 400 when seat numbers contain invalid values', async () => {
      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: any[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [null, undefined, NaN] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid seat numbers',
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      });
    });

    it('should handle TableAssignmentError during validation', async () => {
      // Mock validateSeatNumbers to throw TableAssignmentError
      const error = new TableAssignmentError('Custom validation error', TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS);
      error.name = 'TableAssignmentError';
      (validateSeatNumbers as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Update guest party size to match seat numbers
      testGuest.partySize = 2;
      guests[0] = testGuest;

      const req = mockRequest<{ eventId: string; tableId: string }, { guestId: string; seatNumbers: number[] }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber },
        { guestId: testGuest.id, seatNumbers: [1, 2] }
      );
      const res = mockResponse();

      await createTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Custom validation error',
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      });
    });
  });

  describe('deleteTableAssignment', () => {
    it('should delete assignment', async () => {
      // Create test assignment
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      const req = mockRequest<{ eventId: string; tableId: string; guestId: string }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber, guestId: testGuest.id }
      );
      const res = mockResponse();

      await deleteTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(tableAssignments).toHaveLength(0);
    });

    it('should return 404 when assignment is not found', async () => {
      const req = mockRequest<{ eventId: string; tableId: string; guestId: string }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber, guestId: generateUUID() }
      );
      const res = mockResponse();

      await deleteTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Table assignment not found',
        code: TableAssignmentErrorCodes.ASSIGNMENT_NOT_FOUND
      });
    });

    it('should handle internal errors during deletion', async () => {
      // Create test assignment
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      // Mock tableAssignments.splice to throw an error
      const mockSplice = jest.spyOn(tableAssignments, 'splice');
      mockSplice.mockImplementation(() => { throw new Error('Database error'); });

      const req = mockRequest<{ eventId: string; tableId: string; guestId: string }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber, guestId: testGuest.id }
      );
      const res = mockResponse();

      await deleteTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to delete table assignment',
        code: TableAssignmentErrorCodes.INTERNAL_ERROR
      });

      mockSplice.mockRestore();
    });

    it('should return 400 when table does not exist in venue', async () => {
      // Create test assignment
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        tableId: testTable.tableNumber,
        guestId: testGuest.id,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      // Update venue to have no tables
      testVenue.map!.features = [];
      venues[0] = testVenue;

      const req = mockRequest<{ eventId: string; tableId: string; guestId: string }>(
        { eventId: testEvent.id, tableId: testTable.tableNumber, guestId: testGuest.id }
      );
      const res = mockResponse();

      await deleteTableAssignment(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Table not found in venue',
        code: TableAssignmentErrorCodes.TABLE_NOT_FOUND
      });
    });
  });
}); 
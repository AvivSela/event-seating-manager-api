import { Request, Response } from 'express';
import {
  createGuest,
  getEventGuests,
  getGuest,
  updateGuest,
  deleteGuest,
  guests,
  validateGuest
} from '../../controllers/guestController';
import { events } from '../../controllers/eventController';
import { tableAssignments } from '../../controllers/tableAssignmentController';
import { Guest, CreateGuestDto, UpdateGuestDto, GuestStatus } from '../../types/guest';
import { generateUUID } from '../../utils/uuid';
import { EventType } from '../../types/event';
import { TableAssignment } from '../../types/tableAssignment';
import { ParsedQs } from 'qs';

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
const mockRequest = <P = any, B = any, Q = any>(params: P = {} as P, body: B = {} as B, query: Q = {} as Q): Partial<Request<P, any, B>> => {
  return {
    params,
    body,
    query
  } as Partial<Request<P, any, B>>;
};

describe('Guest Controller', () => {
  const testEvent = {
    id: generateUUID(),
    userId: generateUUID(),
    venueId: generateUUID(),
    type: EventType.WEDDING,
    title: 'Test Wedding',
    description: '',
    date: new Date(),
    createdAt: new Date()
  };

  const validGuestData: CreateGuestDto = {
    eventId: testEvent.id,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    partySize: 2,
    status: GuestStatus.PENDING
  };

  beforeEach(() => {
    // Clear arrays and reset mocks
    guests.length = 0;
    events.length = 0;
    tableAssignments.length = 0;
    events.push(testEvent);
    jest.clearAllMocks();
  });

  describe('validateGuest', () => {
    it('should throw error when party size is invalid', () => {
      expect(() => validateGuest({ partySize: 0 } as UpdateGuestDto)).toThrow('Party size must be at least 1');
    });

    it('should throw error when status is invalid', () => {
      expect(() => validateGuest({ status: 'INVALID_STATUS' as any } as UpdateGuestDto)).toThrow('Invalid guest status');
    });

    it('should not throw error for valid data', () => {
      expect(() => validateGuest({
        partySize: 2,
        status: GuestStatus.PENDING
      } as UpdateGuestDto)).not.toThrow();
    });
  });

  describe('createGuest', () => {
    it('should create guest with valid data', async () => {
      const req = mockRequest<{ eventId: string }, CreateGuestDto>(
        { eventId: testEvent.id },
        validGuestData
      );
      const res = mockResponse();

      await createGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: validGuestData.name,
        email: validGuestData.email,
        phone: validGuestData.phone,
        partySize: validGuestData.partySize,
        status: validGuestData.status,
        id: expect.any(String),
        eventId: testEvent.id,
        createdAt: expect.any(Date)
      }));
      expect(guests).toHaveLength(1);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidData = { ...validGuestData } as Partial<CreateGuestDto>;
      invalidData.name = undefined;

      const req = mockRequest<{ eventId: string }, CreateGuestDto>(
        { eventId: testEvent.id },
        invalidData as CreateGuestDto
      );
      const res = mockResponse();

      await createGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Missing required fields' 
      });
    });

    it('should return 400 when party size is invalid', async () => {
      const req = mockRequest<{ eventId: string }, CreateGuestDto>(
        { eventId: testEvent.id },
        {
          eventId: testEvent.id,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          partySize: 0,
          status: GuestStatus.PENDING
        }
      );
      const res = mockResponse();

      await createGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Party size must be at least 1' 
      });
    });

    it('should return 400 when email format is invalid', async () => {
      const req = mockRequest<{ eventId: string }, CreateGuestDto>(
        { eventId: testEvent.id },
        { ...validGuestData, email: 'invalid-email' }
      );
      const res = mockResponse();

      await createGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid email format' 
      });
    });

    it('should return 400 when phone format is invalid', async () => {
      const req = mockRequest<{ eventId: string }, CreateGuestDto>(
        { eventId: testEvent.id },
        { ...validGuestData, phone: 'invalid-phone' }
      );
      const res = mockResponse();

      await createGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid phone format' 
      });
    });

    it('should return 400 when guest status is invalid', async () => {
      const req = mockRequest<{ eventId: string }, CreateGuestDto>(
        { eventId: testEvent.id },
        { ...validGuestData, status: 'INVALID_STATUS' as any }
      );
      const res = mockResponse();

      await createGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid guest status' 
      });
    });

    it('should return 404 when event does not exist', async () => {
      const req = mockRequest<{ eventId: string }, CreateGuestDto>(
        { eventId: generateUUID() },
        validGuestData
      );
      const res = mockResponse();

      await createGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Event not found' 
      });
    });

    it('should return 400 when event ID format is invalid', async () => {
      const req = mockRequest<{ eventId: string }, CreateGuestDto>(
        { eventId: 'invalid-uuid' },
        validGuestData
      );
      const res = mockResponse();

      await createGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid event ID format' 
      });
    });

    it('should handle unexpected errors during creation', async () => {
      const mockPush = jest.spyOn(guests, 'push');
      const error = new Error('Database error');
      mockPush.mockImplementation(() => { throw error; });

      const req = mockRequest<{ eventId: string }, CreateGuestDto>(
        { eventId: testEvent.id },
        validGuestData
      );
      const res = mockResponse();

      await createGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Database error'
      });

      mockPush.mockRestore();
    });
  });

  describe('getEventGuests', () => {
    let testGuest: Guest;

    beforeEach(() => {
      testGuest = {
        id: generateUUID(),
        eventId: testEvent.id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        partySize: 2,
        status: GuestStatus.PENDING,
        createdAt: new Date()
      };
      guests.push(testGuest);
    });

    it('should return all guests for an event', async () => {
      const req = mockRequest<{ eventId: string }>(
        { eventId: testEvent.id }
      );
      const res = mockResponse();

      await getEventGuests(req as Request, res);

      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          id: testGuest.id,
          name: testGuest.name
        })
      ]);
    });

    it('should filter guests by assignment status', async () => {
      // Add a table assignment for the test guest
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        guestId: testGuest.id,
        tableId: generateUUID(),
        seatNumbers: [1],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      const req = mockRequest<{ eventId: string }, any, { assigned: string }>(
        { eventId: testEvent.id },
        {},
        { assigned: 'true' }
      );
      const res = mockResponse();

      await getEventGuests(req as Request, res);

      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          id: testGuest.id,
          tableAssignment: expect.objectContaining({
            tableId: expect.any(String),
            seatNumbers: expect.any(Array)
          })
        })
      ]);
    });

    it('should return 400 when event ID format is invalid', async () => {
      const req = mockRequest<{ eventId: string }>(
        { eventId: 'invalid-uuid' }
      );
      const res = mockResponse();

      await getEventGuests(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid event ID format' 
      });
    });

    it('should handle errors when filtering guests', async () => {
      const mockFilter = jest.spyOn(guests, 'filter');
      mockFilter.mockImplementation(() => { throw new Error('Filter error'); });

      const req = mockRequest<{ eventId: string }>(
        { eventId: testEvent.id }
      );
      const res = mockResponse();

      await getEventGuests(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Failed to retrieve guests' 
      });

      mockFilter.mockRestore();
    });

    it('should handle errors when mapping assignments', async () => {
      const mockFind = jest.spyOn(tableAssignments, 'find');
      mockFind.mockImplementation(() => { throw new Error('Assignment error'); });

      const req = mockRequest<{ eventId: string }>(
        { eventId: testEvent.id }
      );
      const res = mockResponse();

      await getEventGuests(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Failed to retrieve guests' 
      });

      mockFind.mockRestore();
    });
  });

  describe('getGuest', () => {
    let testGuest: Guest;

    beforeEach(() => {
      testGuest = {
        id: generateUUID(),
        eventId: testEvent.id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        partySize: 2,
        status: GuestStatus.PENDING,
        createdAt: new Date()
      };
      guests.push(testGuest);
    });

    it('should return guest with assignment information', async () => {
      // Add a table assignment
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        guestId: testGuest.id,
        tableId: generateUUID(),
        seatNumbers: [1],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      const req = mockRequest<{ eventId: string; guestId: string }>(
        { eventId: testEvent.id, guestId: testGuest.id }
      );
      const res = mockResponse();

      await getGuest(req as Request, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: testGuest.id,
        tableAssignment: expect.objectContaining({
          tableId: assignment.tableId,
          seatNumbers: assignment.seatNumbers
        })
      }));
    });

    it('should handle errors when retrieving guest assignment', async () => {
      const mockFind = jest.spyOn(tableAssignments, 'find');
      mockFind.mockImplementation(() => { throw new Error('Assignment error'); });

      const req = mockRequest<{ eventId: string; guestId: string }>(
        { eventId: testEvent.id, guestId: testGuest.id }
      );
      const res = mockResponse();

      await getGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Failed to retrieve guest' 
      });

      mockFind.mockRestore();
    });

    it('should return 400 when guest ID format is invalid', async () => {
      const req = mockRequest<{ eventId: string; guestId: string }>(
        { eventId: testEvent.id, guestId: 'invalid-uuid' }
      );
      const res = mockResponse();

      await getGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid guest ID format' 
      });
    });
  });

  describe('updateGuest', () => {
    let testGuest: Guest;

    beforeEach(() => {
      testGuest = {
        id: generateUUID(),
        eventId: testEvent.id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        partySize: 2,
        status: GuestStatus.PENDING,
        createdAt: new Date()
      };
      guests.push(testGuest);
    });

    it('should update guest with valid data', async () => {
      const updateData: UpdateGuestDto = {
        name: 'Jane Doe',
        status: GuestStatus.CONFIRMED
      };

      const req = mockRequest<{ eventId: string; guestId: string }, UpdateGuestDto>(
        { eventId: testEvent.id, guestId: testGuest.id },
        updateData
      );
      const res = mockResponse();

      await updateGuest(req as Request, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...testGuest,
        ...updateData,
        updatedAt: expect.any(Date)
      }));
    });

    it('should return 400 when party size is invalid', async () => {
      const req = mockRequest<{ eventId: string; guestId: string }, UpdateGuestDto>(
        { eventId: testEvent.id, guestId: testGuest.id },
        { partySize: 0 }
      );
      const res = mockResponse();

      await updateGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Party size must be at least 1' 
      });
    });

    it('should return 400 when status is invalid', async () => {
      const req = mockRequest<{ eventId: string; guestId: string }, UpdateGuestDto>(
        { eventId: testEvent.id, guestId: testGuest.id },
        { status: 'INVALID_STATUS' as any }
      );
      const res = mockResponse();

      await updateGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid guest status' 
      });
    });

    it('should return 404 when guest is not found', async () => {
      const req = mockRequest<{ eventId: string; guestId: string }, UpdateGuestDto>(
        { eventId: testEvent.id, guestId: generateUUID() },
        { name: 'Jane Doe' }
      );
      const res = mockResponse();

      await updateGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Guest not found' 
      });
    });
  });

  describe('deleteGuest', () => {
    let testGuest: Guest;

    beforeEach(() => {
      testGuest = {
        id: generateUUID(),
        eventId: testEvent.id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        partySize: 2,
        status: GuestStatus.PENDING,
        createdAt: new Date()
      };
      guests.push(testGuest);
    });

    it('should delete guest and associated table assignments', async () => {
      // Add a table assignment for the test guest
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEvent.id,
        guestId: testGuest.id,
        tableId: generateUUID(),
        seatNumbers: [1],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      const req = mockRequest<{ eventId: string; guestId: string }>(
        { eventId: testEvent.id, guestId: testGuest.id }
      );
      const res = mockResponse();

      await deleteGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(guests).toHaveLength(0);
      expect(tableAssignments).toHaveLength(0);
    });

    it('should return 404 when guest is not found', async () => {
      const req = mockRequest<{ eventId: string; guestId: string }>(
        { eventId: testEvent.id, guestId: generateUUID() }
      );
      const res = mockResponse();

      await deleteGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Guest not found' 
      });
    });

    it('should return 400 when ID format is invalid', async () => {
      const req = mockRequest<{ eventId: string; guestId: string }>(
        { eventId: 'invalid-uuid', guestId: testGuest.id }
      );
      const res = mockResponse();

      await deleteGuest(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid ID format' 
      });
    });
  });
}); 
import { Request, Response } from 'express';
import {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  venues
} from '../../controllers/venueController';
import { events } from '../../controllers/eventController';
import { Venue, CreateVenueDto, UpdateVenueDto, VenueMap } from '../../types/venue';
import { generateUUID } from '../../utils/uuid';
import { EventType } from '../../types/event';

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

describe('Venue Controller', () => {
  const validVenueMap: VenueMap = {
    dimensions: {
      width: 1000,
      height: 800
    },
    features: [
      {
        type: "table" as const,
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 100 },
        numberOfSeats: 8,
        shape: "round" as const,
        tableNumber: "T1"
      },
      {
        type: "stage" as const,
        position: { x: 500, y: 50 },
        dimensions: { width: 200, height: 100 }
      }
    ]
  };

  const validVenueData: CreateVenueDto = {
    name: 'Test Venue',
    address: '123 Test St',
    capacity: 200,
    description: 'A test venue',
    map: validVenueMap
  };

  beforeEach(() => {
    // Clear arrays and reset mocks
    venues.length = 0;
    events.length = 0;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getAllVenues', () => {
    it('should return all venues', () => {
      const testVenues: Venue[] = [
        {
          id: generateUUID(),
          name: 'Venue 1',
          address: '123 St',
          capacity: 100,
          createdAt: new Date()
        },
        {
          id: generateUUID(),
          name: 'Venue 2',
          address: '456 St',
          capacity: 200,
          createdAt: new Date()
        }
      ];
      venues.push(...testVenues);

      const req = mockRequest();
      const res = mockResponse();

      getAllVenues(req, res);

      expect(res.json).toHaveBeenCalledWith(testVenues);
    });

    it('should return empty array when no venues exist', () => {
      const req = mockRequest();
      const res = mockResponse();

      getAllVenues(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('getVenueById', () => {
    it('should return venue when valid ID is provided', () => {
      const testVenue: Venue = {
        id: generateUUID(),
        name: 'Test Venue',
        address: '123 St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(testVenue);

      const req = mockRequest<{ id: string }>({ id: testVenue.id });
      const res = mockResponse();

      getVenueById(req, res);

      expect(res.json).toHaveBeenCalledWith(testVenue);
    });

    it('should return 404 when venue is not found', () => {
      const req = mockRequest<{ id: string }>({ id: generateUUID() });
      const res = mockResponse();

      getVenueById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Venue not found' });
    });

    it('should return 400 when invalid UUID is provided', () => {
      const req = mockRequest<{ id: string }>({ id: 'invalid-uuid' });
      const res = mockResponse();

      getVenueById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid venue ID format' });
    });

    it('should handle unexpected errors', () => {
      const req = mockRequest<{ id: string }>({ id: generateUUID() });
      const res = mockResponse();

      // Mock venues.find to throw an error
      jest.spyOn(venues, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });

      getVenueById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to retrieve venue' });
    });

    it('should handle errors when venues array is not accessible', () => {
      const req = mockRequest<{ id: string }>({ id: generateUUID() });
      const res = mockResponse();

      // Mock venues.find to throw an error
      const originalFind = venues.find;
      venues.find = () => { throw new Error('Cannot access venues'); };

      getVenueById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to retrieve venue' });

      // Restore venues.find
      venues.find = originalFind;
    });
  });

  describe('createVenue', () => {
    it('should create venue with valid data', () => {
      const req = mockRequest<{}, CreateVenueDto>({}, validVenueData);
      const res = mockResponse();

      createVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: validVenueData.name,
        address: validVenueData.address,
        capacity: validVenueData.capacity,
        description: validVenueData.description,
        map: validVenueData.map,
        id: expect.any(String),
        createdAt: expect.any(Date)
      }));
    });

    it('should return 400 when required fields are missing', () => {
      const invalidData = { ...validVenueData };
      delete (invalidData as any).name;

      const req = mockRequest<{}, CreateVenueDto>({}, invalidData);
      const res = mockResponse();

      createVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Name, address, and capacity are required' 
      });
    });

    it('should validate map dimensions', () => {
      const invalidMap = { ...validVenueMap };
      delete (invalidMap.dimensions as any).width;

      const req = mockRequest<{}, CreateVenueDto>({}, {
        ...validVenueData,
        map: invalidMap
      });
      const res = mockResponse();

      createVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Map dimensions must include width and height' 
      });
    });

    it('should validate table configuration', () => {
      const invalidMap: VenueMap = {
        dimensions: {
          width: 1000,
          height: 800
        },
        features: [
          {
            type: "table" as const,
            position: { x: 100, y: 100 },
            dimensions: { width: 100, height: 100 },
            numberOfSeats: 0, // Invalid number of seats
            shape: "round" as const,
            tableNumber: "T1"
          }
        ]
      };

      const req = mockRequest<{}, CreateVenueDto>({}, {
        ...validVenueData,
        map: invalidMap
      });
      const res = mockResponse();

      createVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Table features must specify numberOfSeats' 
      });
    });

    it('should validate guest seat numbers', () => {
      const invalidMap: VenueMap = {
        dimensions: {
          width: 1000,
          height: 800
        },
        features: [
          {
            type: "table" as const,
            position: { x: 100, y: 100 },
            dimensions: { width: 100, height: 100 },
            numberOfSeats: 4,
            shape: "round" as const,
            tableNumber: "T1",
            guests: [
              { id: "1", name: "Guest 1", seatNumber: 5 } // Invalid seat number
            ]
          }
        ]
      };

      const req = mockRequest<{}, CreateVenueDto>({}, {
        ...validVenueData,
        map: invalidMap
      });
      const res = mockResponse();

      createVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Guest seat number must be between 1 and numberOfSeats' 
      });
    });

    it('should validate feature position', () => {
      const invalidMap: VenueMap = {
        dimensions: {
          width: 1000,
          height: 800
        },
        features: [
          {
            type: "table" as const,
            position: { x: null as any, y: 100 }, // Invalid position
            dimensions: { width: 100, height: 100 },
            numberOfSeats: 8,
            shape: "round" as const,
            tableNumber: "T1"
          }
        ]
      };

      const req = mockRequest<{}, CreateVenueDto>({}, {
        ...validVenueData,
        map: invalidMap
      });
      const res = mockResponse();

      createVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Each feature must have a valid type and position' 
      });
    });

    it('should validate map features array', () => {
      const invalidMap = {
        dimensions: {
          width: 1000,
          height: 800
        },
        features: null // Invalid features array
      };

      const req = mockRequest<{}, CreateVenueDto>({}, {
        ...validVenueData,
        map: invalidMap as any
      });
      const res = mockResponse();

      createVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Map features must be an array' 
      });
    });
  });

  describe('updateVenue', () => {
    let testVenue: Venue;

    beforeEach(() => {
      testVenue = {
        id: generateUUID(),
        name: 'Original Venue',
        address: '123 Original St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(testVenue);
    });

    it('should update venue with valid data', () => {
      const updateData: UpdateVenueDto = {
        name: 'Updated Venue',
        capacity: 150,
        map: {
          dimensions: {
            width: 1000,
            height: 800
          },
          features: [
            {
              type: "table" as const,
              position: { x: 100, y: 100 },
              dimensions: { width: 100, height: 100 },
              numberOfSeats: 8,
              shape: "round" as const,
              tableNumber: "T1"
            },
            {
              type: "stage" as const,
              position: { x: 500, y: 50 },
              dimensions: { width: 200, height: 100 }
            }
          ]
        }
      };

      const req = mockRequest<{ id: string }, UpdateVenueDto>(
        { id: testVenue.id },
        updateData
      );
      const res = mockResponse();

      updateVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...testVenue,
        ...updateData,
        updatedAt: expect.any(Date)
      }));
    });

    it('should return 404 when venue is not found', () => {
      const req = mockRequest<{ id: string }, UpdateVenueDto>(
        { id: generateUUID() },
        { name: 'Updated Venue' }
      );
      const res = mockResponse();

      updateVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Venue not found' });
    });

    it('should validate updated map data', () => {
      const invalidMap = { ...validVenueMap };
      delete (invalidMap.dimensions as any).width;

      const req = mockRequest<{ id: string }, UpdateVenueDto>(
        { id: testVenue.id },
        { map: invalidMap }
      );
      const res = mockResponse();

      updateVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Map dimensions must include width and height' 
      });
    });

    it('should handle unexpected errors', () => {
      const req = mockRequest<{ id: string }, UpdateVenueDto>(
        { id: testVenue.id },
        { name: 'Updated Venue' }
      );
      const res = mockResponse();

      // Mock venues.findIndex to throw a non-Error object
      jest.spyOn(venues, 'findIndex').mockImplementation(() => {
        throw 'Database error'; // Not an Error instance
      });

      updateVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong!' });
    });
  });

  describe('deleteVenue', () => {
    let testVenue: Venue;

    beforeEach(() => {
      testVenue = {
        id: generateUUID(),
        name: 'Test Venue',
        address: '123 Test St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(testVenue);
    });

    it('should delete venue when no events exist', () => {
      const req = mockRequest<{ id: string }>({ id: testVenue.id });
      const res = mockResponse();

      deleteVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(venues).toHaveLength(0);
    });

    it('should return 400 when venue has associated events', () => {
      // Create an event associated with the venue
      events.push({
        id: generateUUID(),
        userId: generateUUID(),
        venueId: testVenue.id,
        type: EventType.WEDDING,
        title: "Test Event",
        description: "",
        date: new Date(),
        createdAt: new Date()
      });

      const req = mockRequest<{ id: string }>({ id: testVenue.id });
      const res = mockResponse();

      deleteVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Cannot delete venue with existing events' 
      });
      expect(venues).toHaveLength(1);
    });

    it('should return 400 when invalid UUID is provided', () => {
      const req = mockRequest<{ id: string }>({ id: 'invalid-uuid' });
      const res = mockResponse();

      deleteVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid venue ID format' });
    });

    it('should handle unexpected errors', () => {
      const req = mockRequest<{ id: string }>({ id: testVenue.id });
      const res = mockResponse();

      // Mock events.some to throw an error
      jest.spyOn(events, 'some').mockImplementation(() => {
        throw new Error('Database error');
      });

      deleteVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to delete venue' });
    });
  });
}); 
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
import { mockRequest, mockResponse } from "../../utils/testUtils";
import { ValidationError } from "../../types/errors/validation.error";
import { NotFoundError } from "../../types/errors/not-found.error";
import { BaseError } from "../../types/errors/base.error";

// Mock response object
const mockResponseObject = () => {
  const res: Partial<Response> = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  };
  return res as Response;
};

// Mock request object with proper typing
const mockRequestObject = <P = any, B = any>(params: P = {} as P, body: B = {} as B): Request<P, any, B> => {
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
      const testDate = new Date();
      const testVenues: Venue[] = [
        {
          id: generateUUID(),
          name: 'Venue 1',
          address: '123 St',
          capacity: 100,
          createdAt: testDate
        },
        {
          id: generateUUID(),
          name: 'Venue 2',
          address: '456 St',
          capacity: 200,
          createdAt: testDate
        }
      ];
      venues.push(...testVenues);

      const req = mockRequest();
      const res = mockResponse();

      getAllVenues(req, res);

      const expectedVenues = testVenues.map(venue => ({
        id: venue.id,
        name: venue.name,
        address: venue.address,
        capacity: venue.capacity,
        createdAt: venue.createdAt
      }));

      expect(res.json).toHaveBeenCalledWith(expectedVenues);
    });

    it('should return empty array when no venues exist', () => {
      const req = mockRequest();
      const res = mockResponse();

      getAllVenues(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors gracefully', () => {
      const req = mockRequest();
      const res = mockResponse();

      // Mock res.json to throw error
      res.json = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      expect(() => getAllVenues(req, res)).toThrow(BaseError);
    });
  });

  describe('getVenueById', () => {
    it('should return venue by ID', () => {
      const testVenue: Venue = {
        id: generateUUID(),
        name: 'Test Venue',
        address: '123 St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(testVenue);

      const req = mockRequest({
        params: { id: testVenue.id }
      });
      const res = mockResponse();

      getVenueById(req, res);

      expect(res.json).toHaveBeenCalledWith(testVenue);
    });

    it('should return 404 when venue is not found', () => {
      const req = mockRequest({
        params: { id: generateUUID() }
      });
      const res = mockResponse();

      expect(() => getVenueById(req, res)).toThrow(NotFoundError);
    });

    it('should return 400 when invalid UUID is provided', () => {
      const req = mockRequest({
        params: { id: 'invalid-uuid' }
      });
      const res = mockResponse();

      expect(() => getVenueById(req, res)).toThrow(ValidationError);
    });

    it('should handle unexpected errors', () => {
      const req = mockRequest({
        params: { id: generateUUID() }
      });
      const res = mockResponse();

      // Mock venues.find to throw error
      jest.spyOn(venues, 'find').mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(() => getVenueById(req, res)).toThrow(BaseError);
    });
  });

  describe('createVenue', () => {
    it('should create venue with valid data', () => {
      const req = mockRequest({
        body: validVenueData
      });
      const res = mockResponse();

      createVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...validVenueData,
        id: expect.any(String),
        createdAt: expect.any(Date)
      }));
    });

    it('should validate required fields', () => {
      const invalidData = {
        address: '123 St',
        capacity: 100
      };

      const req = mockRequest({
        body: invalidData
      });
      const res = mockResponse();

      expect(() => createVenue(req, res)).toThrow(ValidationError);
    });

    it('should validate map dimensions', () => {
      const req = mockRequest({
        body: {
          ...validVenueData,
          map: {
            dimensions: {
              width: 'invalid'
            },
            features: []
          }
        }
      });
      const res = mockResponse();

      expect(() => createVenue(req, res)).toThrow(ValidationError);
    });

    it('should validate map features', () => {
      const req = mockRequest({
        body: {
          ...validVenueData,
          map: {
            dimensions: {
              width: 1000,
              height: 800
            },
            features: [
              {
                type: 'table',
                position: { x: 100, y: 100 },
                dimensions: { width: 100, height: 100 },
                shape: 'round',
                tableNumber: 'T1'
                // Missing numberOfSeats
              }
            ]
          }
        }
      });
      const res = mockResponse();

      expect(() => createVenue(req, res)).toThrow(ValidationError);
    });
  });

  describe('updateVenue', () => {
    it('should update venue with valid data', () => {
      const testVenue: Venue = {
        id: generateUUID(),
        name: 'Original Venue',
        address: '123 St',
        capacity: 100,
        createdAt: new Date(),
        map: validVenueMap
      };
      venues.push(testVenue);

      const updateData: UpdateVenueDto = {
        name: 'Updated Venue',
        capacity: 150
      };

      const req = mockRequest({
        params: { id: testVenue.id },
        body: updateData
      });
      const res = mockResponse();

      updateVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...testVenue,
        ...updateData
      }));
    });

    it('should return 404 when venue is not found', () => {
      const req = mockRequest({
        params: { id: generateUUID() },
        body: { name: 'Updated Venue' }
      });
      const res = mockResponse();

      expect(() => updateVenue(req, res)).toThrow(NotFoundError);
    });

    it('should validate updated map data', () => {
      const testVenue = {
        id: generateUUID(),
        name: 'Test Venue',
        address: '123 St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(testVenue);

      const req = mockRequest({
        params: { id: testVenue.id },
        body: {
          map: {
            dimensions: { width: 'invalid' }
          }
        }
      });
      const res = mockResponse();

      expect(() => updateVenue(req, res)).toThrow(ValidationError);
    });

    it('should handle unexpected errors', () => {
      const testVenue = {
        id: generateUUID(),
        name: 'Test Venue',
        address: '123 St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(testVenue);

      const req = mockRequest({
        params: { id: testVenue.id },
        body: {}
      });
      const res = mockResponse();

      // Mock array index assignment to throw error
      const originalVenues = [...venues];
      const venueIndex = venues.findIndex(v => v.id === testVenue.id);
      Object.defineProperty(venues, venueIndex, {
        set: () => {
          throw new Error('Test error');
        }
      });

      expect(() => updateVenue(req, res)).toThrow(BaseError);

      // Restore original array
      Object.defineProperty(venues, venueIndex, {
        value: originalVenues[venueIndex],
        writable: true,
        configurable: true
      });
    });
  });

  describe('deleteVenue', () => {
    it('should delete venue when no events are associated', () => {
      const testVenue = {
        id: generateUUID(),
        name: 'Test Venue',
        address: '123 St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(testVenue);

      const req = mockRequest({
        params: { id: testVenue.id }
      });
      const res = mockResponse();

      deleteVenue(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(venues).toHaveLength(0);
    });

    it('should return 400 when venue has associated events', () => {
      const testVenue = {
        id: generateUUID(),
        name: 'Test Venue',
        address: '123 St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(testVenue);

      events.push({
        id: generateUUID(),
        title: 'Test Event',
        date: new Date(),
        type: EventType.WEDDING,
        venueId: testVenue.id,
        createdAt: new Date(),
        userId: generateUUID(),
        description: 'Test event description'
      });

      const req = mockRequest({
        params: { id: testVenue.id }
      });
      const res = mockResponse();

      expect(() => deleteVenue(req, res)).toThrow(ValidationError);
    });

    it('should return 400 when invalid UUID is provided', () => {
      const req = mockRequest({
        params: { id: 'invalid-uuid' }
      });
      const res = mockResponse();

      expect(() => deleteVenue(req, res)).toThrow(ValidationError);
    });

    it('should handle unexpected errors', () => {
      const testVenue = {
        id: generateUUID(),
        name: 'Test Venue',
        address: '123 St',
        capacity: 100,
        createdAt: new Date()
      };
      venues.push(testVenue);

      const req = mockRequest({
        params: { id: testVenue.id }
      });
      const res = mockResponse();

      // Mock venues array to throw error
      jest.spyOn(venues, 'splice').mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(() => deleteVenue(req, res)).toThrow(BaseError);
    });
  });
}); 
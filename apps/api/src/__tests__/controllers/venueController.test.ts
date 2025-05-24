import { Request, Response } from 'express';
import {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  venues,
  validateVenueMap
} from '../../controllers/venueController';
import { events } from '../../controllers/eventController';
import { Venue, CreateVenueDto, UpdateVenueDto, VenueMap, VenueFeature, TableFeature } from '../../types/venue';
import { generateUUID } from '../../utils/uuid';
import { EventType } from '../../types/event';
import { mockRequest, mockResponse } from "../../utils/testUtils";
import { ValidationError } from "../../types/errors/validation.error";
import { NotFoundError } from "../../types/errors/not-found.error";
import { BaseError } from "../../types/errors/base.error";
import { BaseTestSetup } from '../helpers/BaseTestSetup';
import { TEST_CONSTANTS } from '../constants/testConstants';
import { TestDataFactory } from '../factories/testDataFactory';

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

class VenueControllerTest extends BaseTestSetup {
  beforeEach(): void {
    super.beforeEach();
  }

  afterEach(): void {
    super.afterEach();
  }

  testValidateVenue(): void {
    describe('validateVenueMap', () => {
      it('should throw error when map dimensions are invalid', () => {
        // Arrange
        const invalidMap = {
          dimensions: { width: undefined, height: 100 },
          features: []
        } as unknown as VenueMap;

        // Act & Assert
        expect(() => validateVenueMap(invalidMap))
          .toThrow('Map dimensions must include width and height');
      });

      it('should throw error when features is not an array', () => {
        // Arrange
        const invalidMap = {
          dimensions: { width: 100, height: 100 },
          features: 'not an array'
        } as unknown as VenueMap;

        // Act & Assert
        expect(() => validateVenueMap(invalidMap))
          .toThrow('Map features must be an array');
      });

      it('should throw error when feature position is invalid', () => {
        // Arrange
        const invalidMap = {
          dimensions: { width: 100, height: 100 },
          features: [{
            type: 'table',
            position: { x: 'invalid' },
            dimensions: { width: 20, height: 10 }
          }]
        } as unknown as VenueMap;

        // Act & Assert
        expect(() => validateVenueMap(invalidMap))
          .toThrow('Each feature must have a valid type and position');
      });

      it('should throw error when table feature is missing numberOfSeats', () => {
        // Arrange
        const invalidMap = {
          dimensions: { width: 100, height: 100 },
          features: [{
            type: 'table',
            position: { x: 10, y: 10 },
            dimensions: { width: 20, height: 10 }
          }]
        } as unknown as VenueMap;

        // Act & Assert
        expect(() => validateVenueMap(invalidMap))
          .toThrow('Table features must specify numberOfSeats');
      });

      it('should throw error when guest seat number is invalid', () => {
        // Arrange
        const invalidMap = {
          dimensions: { width: 100, height: 100 },
          features: [{
            type: 'table',
            position: { x: 10, y: 10 },
            dimensions: { width: 20, height: 10 },
            numberOfSeats: 4,
            shape: 'rectangular',
            tableNumber: 'T1',
            guests: [{ id: '1', name: 'Test Guest', seatNumber: 5 }]
          }]
        } as unknown as VenueMap;

        // Act & Assert
        expect(() => validateVenueMap(invalidMap))
          .toThrow('Guest seat number must be between 1 and numberOfSeats');
      });

      it('should not throw error for valid map data', () => {
        // Arrange
        const validMap = {
          dimensions: { width: 100, height: 100 },
          features: [{
            type: 'table',
            position: { x: 10, y: 10 },
            dimensions: { width: 20, height: 10 },
            numberOfSeats: 4,
            shape: 'rectangular',
            tableNumber: 'T1',
            guests: [{ id: '1', name: 'Test Guest', seatNumber: 1 }]
          }]
        } as VenueMap;

        // Act & Assert
        expect(() => validateVenueMap(validMap)).not.toThrow();
      });
    });
  }

  testGetAllVenues(): void {
    describe('getAllVenues', () => {
      let testUser: any;

      beforeEach(() => {
        testUser = TestDataFactory.createUser();
      });

      it('should return all venues for a user', () => {
        // Arrange
        const testVenues = [
          TestDataFactory.createVenue({ ownerId: testUser.id }),
          TestDataFactory.createVenue({ ownerId: testUser.id, name: 'Venue 2' })
        ];
        venues.push(...testVenues);

        const { req, res } = this.testRequest<{ ownerId: string }>({
          params: { ownerId: testUser.id }
        });

        // Act
        getAllVenues(req as Request<{ ownerId: string }>, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith(testVenues);
      });

      it('should return empty array when no venues exist', () => {
        // Arrange
        const { req, res } = this.testRequest<{ ownerId: string }>({
          params: { ownerId: testUser.id }
        });

        // Act
        getAllVenues(req as Request<{ ownerId: string }>, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith([]);
      });

      it('should return 400 for invalid user ID format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ ownerId: string }>({
          params: { ownerId: TEST_CONSTANTS.INVALID_UUID }
        });

        // Act
        getAllVenues(req as Request<{ ownerId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }

  testGetVenueById(): void {
    describe('getVenueById', () => {
      let testUser: any;

      beforeEach(() => {
        testUser = TestDataFactory.createUser();
      });

      it('should return venue by ID', () => {
        // Arrange
        const testVenue = TestDataFactory.createVenue({ ownerId: testUser.id });
        venues.push(testVenue);

        const { req, res } = this.testRequest<{ ownerId: string; venueId: string }>({
          params: { ownerId: testUser.id, venueId: testVenue.id }
        });

        // Act
        getVenueById(req as Request<{ ownerId: string; venueId: string }>, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith(testVenue);
      });

      it('should return 404 when venue is not found', () => {
        // Arrange
        const { req, res } = this.testRequest<{ ownerId: string; venueId: string }>({
          params: { ownerId: testUser.id, venueId: TEST_CONSTANTS.VALID_UUID }
        });

        // Act
        getVenueById(req as Request<{ ownerId: string; venueId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
      });

      it('should return 400 for invalid venue ID format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ ownerId: string; venueId: string }>({
          params: { ownerId: testUser.id, venueId: TEST_CONSTANTS.INVALID_UUID }
        });

        // Act
        getVenueById(req as Request<{ ownerId: string; venueId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }

  testCreateVenue(): void {
    describe('createVenue', () => {
      let testUser: any;

      beforeEach(() => {
        testUser = TestDataFactory.createUser();
      });

      it('should create venue with valid data', () => {
        // Arrange
        const venueData = {
          name: 'Test Venue',
          address: '123 Test St',
          capacity: 100,
          description: 'Test Description',
          map: {
            dimensions: { width: 100, height: 100 },
            features: [{
              type: 'table',
              position: { x: 10, y: 10 },
              dimensions: { width: 20, height: 10 },
              numberOfSeats: 4,
              shape: 'rectangular',
              tableNumber: 'T1'
            }]
          }
        };

        const { req, res } = this.testRequest<{ userId: string }, typeof venueData>({
          params: { userId: testUser.id },
          body: venueData
        });

        // Act
        createVenue(req as Request<{ userId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          ...venueData,
          id: expect.any(String),
          createdAt: expect.any(Date)
        }));
      });

      it('should return 400 for missing required fields', () => {
        // Arrange
        const { req, res } = this.testRequest<{ userId: string }, any>({
          params: { userId: testUser.id },
          body: {
            description: 'Test Description'
          }
        });

        // Act
        createVenue(req as Request<{ userId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Name, address, and capacity are required',
          details: {
            name: 'missing',
            address: 'missing',
            capacity: 'missing'
          }
        });
      });
    });
  }

  testUpdateVenue(): void {
    describe('updateVenue', () => {
      let testUser: any;
      let testVenue: Venue;

      beforeEach(() => {
        testUser = TestDataFactory.createUser();
        testVenue = TestDataFactory.createVenue({ ownerId: testUser.id });
        venues.push(testVenue);
      });

      it('should update venue with valid data', () => {
        // Arrange
        const updateData = {
          name: 'Updated Venue',
          description: 'Updated Description',
          map: {
            dimensions: { width: 100, height: 100 },
            features: [{
              type: 'table',
              position: { x: 10, y: 10 },
              dimensions: { width: 20, height: 10 },
              numberOfSeats: 4,
              shape: 'rectangular',
              tableNumber: 'T1'
            }]
          }
        };

        const { req, res } = this.testRequest<{ userId: string; venueId: string }, typeof updateData>({
          params: { userId: testUser.id, venueId: testVenue.id },
          body: updateData
        });

        // Act
        updateVenue(req as Request<{ userId: string; venueId: string }>, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          ...testVenue,
          ...updateData
        }));
      });

      it('should return 404 when updating non-existent venue', () => {
        // Arrange
        const { req, res } = this.testRequest<{ userId: string; venueId: string }, any>({
          params: { userId: testUser.id, venueId: TEST_CONSTANTS.VALID_UUID },
          body: { name: 'New Name' }
        });

        // Act
        updateVenue(req as Request<{ userId: string; venueId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
      });

      it('should return 400 for invalid venue ID format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ userId: string; venueId: string }, any>({
          params: { userId: testUser.id, venueId: TEST_CONSTANTS.INVALID_UUID },
          body: { name: 'New Name' }
        });

        // Act
        updateVenue(req as Request<{ userId: string; venueId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }

  testDeleteVenue(): void {
    describe('deleteVenue', () => {
      let testUser: any;
      let testVenue: Venue;

      beforeEach(() => {
        testUser = TestDataFactory.createUser();
        testVenue = TestDataFactory.createVenue({ ownerId: testUser.id });
        venues.push(testVenue);
      });

      it('should delete existing venue', () => {
        // Arrange
        const { req, res } = this.testRequest<{ userId: string; venueId: string }>({
          params: { userId: testUser.id, venueId: testVenue.id }
        });

        // Act
        deleteVenue(req as Request<{ userId: string; venueId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(204);
        expect(venues).toHaveLength(0);
      });

      it('should return 404 when deleting non-existent venue', () => {
        // Arrange
        const { req, res } = this.testRequest<{ userId: string; venueId: string }>({
          params: { userId: testUser.id, venueId: TEST_CONSTANTS.VALID_UUID }
        });

        // Act
        deleteVenue(req as Request<{ userId: string; venueId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
      });

      it('should return 400 for invalid venue ID format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ userId: string; venueId: string }>({
          params: { userId: testUser.id, venueId: TEST_CONSTANTS.INVALID_UUID }
        });

        // Act
        deleteVenue(req as Request<{ userId: string; venueId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }
}

describe('Venue Controller', () => {
  let testSetup: VenueControllerTest;

  beforeAll(() => {
    testSetup = new VenueControllerTest();
  });

  beforeEach(() => {
    testSetup.beforeEach();
  });

  afterEach(() => {
    testSetup.afterEach();
  });

  it('runs all test suites', () => {
    testSetup.testValidateVenue();
    testSetup.testGetAllVenues();
    testSetup.testGetVenueById();
    testSetup.testCreateVenue();
    testSetup.testUpdateVenue();
    testSetup.testDeleteVenue();
  });
}); 
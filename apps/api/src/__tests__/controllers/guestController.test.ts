import { BaseTestSetup } from '../helpers/BaseTestSetup';
import { TEST_CONSTANTS } from '../constants/testConstants';
import { TestDataFactory } from '../factories/testDataFactory';
import { Request, Response } from 'express';
import {
  createGuest,
  updateGuest,
  deleteGuest,
  getGuest,
  getEventGuests,
  validateGuest,
  guests
} from '../../controllers/guestController';
import { Guest, GuestStatus } from '../../types/guest';

interface CreateGuestDto {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  status: GuestStatus;
}

interface UpdateGuestDto {
  name?: string;
  email?: string;
  phone?: string;
  partySize?: number;
  status?: GuestStatus;
}

class GuestControllerTest extends BaseTestSetup {
  beforeEach(): void {
    super.beforeEach();
  }

  afterEach(): void {
    super.afterEach();
  }

  testValidateGuest(): void {
    describe('validateGuest', () => {
      it('should throw error when party size is invalid', () => {
        expect(() => validateGuest({ partySize: 0 } as UpdateGuestDto))
          .toThrow(TEST_CONSTANTS.ERROR_MESSAGES.INVALID_PARTY_SIZE);
        expect(() => validateGuest({ partySize: TEST_CONSTANTS.GUEST.MAX_PARTY_SIZE + 1 } as UpdateGuestDto))
          .toThrow(TEST_CONSTANTS.ERROR_MESSAGES.INVALID_PARTY_SIZE);
      });

      it('should throw error when status is invalid', () => {
        expect(() => validateGuest({ status: 'INVALID_STATUS' as GuestStatus } as UpdateGuestDto))
          .toThrow('Invalid guest status');
      });

      it('should not throw error for valid data', () => {
        expect(() => validateGuest({
          partySize: 2,
          status: GuestStatus.PENDING
        } as UpdateGuestDto)).not.toThrow();
      });
    });
  }

  testGetEventGuests(): void {
    describe('getEventGuests', () => {
      let testEvent: any;

      beforeEach(() => {
        testEvent = TestDataFactory.createEvent();
      });

      it('should return all guests for an event', () => {
        // Arrange
        const testGuests = [
          TestDataFactory.createGuest({ eventId: testEvent.id }),
          TestDataFactory.createGuest({ eventId: testEvent.id, name: 'Guest 2' })
        ];
        guests.push(...testGuests);

        const { req, res } = this.testRequest<{ eventId: string }>({
          params: { eventId: testEvent.id }
        });

        // Act
        getEventGuests(req as Request<{ eventId: string }>, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith(testGuests);
      });

      it('should return empty array when no guests exist', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string }>({
          params: { eventId: testEvent.id }
        });

        // Act
        getEventGuests(req as Request<{ eventId: string }>, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith([]);
      });

      it('should return 400 for invalid event ID format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string }>({
          params: { eventId: TEST_CONSTANTS.INVALID_UUID }
        });

        // Act
        getEventGuests(req as Request<{ eventId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }

  testGetGuest(): void {
    describe('getGuest', () => {
      let testEvent: any;

      beforeEach(() => {
        testEvent = TestDataFactory.createEvent();
      });

      it('should return guest by ID', () => {
        // Arrange
        const testGuest = TestDataFactory.createGuest({ eventId: testEvent.id });
        guests.push(testGuest);

        const { req, res } = this.testRequest<{ eventId: string; guestId: string }>({
          params: { eventId: testEvent.id, guestId: testGuest.id }
        });

        // Act
        getGuest(req as Request<{ eventId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith(testGuest);
      });

      it('should return 404 when guest is not found', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; guestId: string }>({
          params: { eventId: testEvent.id, guestId: TEST_CONSTANTS.VALID_UUID }
        });

        // Act
        getGuest(req as Request<{ eventId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
      });

      it('should return 400 for invalid guest ID format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; guestId: string }>({
          params: { eventId: testEvent.id, guestId: TEST_CONSTANTS.INVALID_UUID }
        });

        // Act
        getGuest(req as Request<{ eventId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }

  testCreateGuest(): void {
    describe('createGuest', () => {
      let testEvent: any;

      beforeEach(() => {
        testEvent = TestDataFactory.createEvent();
      });

      it('should create guest with valid data', () => {
        // Arrange
        const guestData: CreateGuestDto = {
          eventId: testEvent.id,
          name: 'Test Guest',
          email: TEST_CONSTANTS.VALID_EMAIL,
          phone: TEST_CONSTANTS.VALID_PHONE,
          partySize: 2,
          status: GuestStatus.PENDING
        };

        const { req, res } = this.testRequest<{ eventId: string }, CreateGuestDto>({
          params: { eventId: testEvent.id },
          body: guestData
        });

        // Act
        createGuest(req as Request<{ eventId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          ...guestData,
          id: expect.any(String),
          createdAt: expect.any(Date)
        }));
      });

      it('should return 400 for invalid email format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string }, CreateGuestDto>({
          params: { eventId: testEvent.id },
          body: {
            eventId: testEvent.id,
            name: 'Test Guest',
            email: TEST_CONSTANTS.INVALID_EMAIL,
            phone: TEST_CONSTANTS.VALID_PHONE,
            partySize: 2,
            status: GuestStatus.PENDING
          }
        });

        // Act
        createGuest(req as Request<{ eventId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_EMAIL });
      });

      it('should return 400 for invalid party size', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string }, CreateGuestDto>({
          params: { eventId: testEvent.id },
          body: {
            eventId: testEvent.id,
            name: 'Test Guest',
            email: TEST_CONSTANTS.VALID_EMAIL,
            phone: TEST_CONSTANTS.VALID_PHONE,
            partySize: 0,
            status: GuestStatus.PENDING
          }
        });

        // Act
        createGuest(req as Request<{ eventId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_PARTY_SIZE });
      });
    });
  }

  testUpdateGuest(): void {
    describe('updateGuest', () => {
      let testEvent: any;
      let testGuest: Guest;

      beforeEach(() => {
        testEvent = TestDataFactory.createEvent();
        testGuest = TestDataFactory.createGuest({ eventId: testEvent.id });
        guests.push(testGuest);
      });

      it('should update guest with valid data', () => {
        // Arrange
        const updateData: UpdateGuestDto = {
          name: 'Updated Name',
          email: 'updated@example.com',
          status: GuestStatus.CONFIRMED
        };

        const { req, res } = this.testRequest<{ eventId: string; guestId: string }, UpdateGuestDto>({
          params: { eventId: testEvent.id, guestId: testGuest.id },
          body: updateData
        });

        // Act
        updateGuest(req as Request<{ eventId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          ...testGuest,
          ...updateData,
          updatedAt: expect.any(Date)
        }));
      });

      it('should return 404 when updating non-existent guest', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; guestId: string }, UpdateGuestDto>({
          params: { eventId: testEvent.id, guestId: TEST_CONSTANTS.VALID_UUID },
          body: { name: 'New Name' }
        });

        // Act
        updateGuest(req as Request<{ eventId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
      });

      it('should return 400 for invalid guest ID format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; guestId: string }, UpdateGuestDto>({
          params: { eventId: testEvent.id, guestId: TEST_CONSTANTS.INVALID_UUID },
          body: { name: 'New Name' }
        });

        // Act
        updateGuest(req as Request<{ eventId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }

  testDeleteGuest(): void {
    describe('deleteGuest', () => {
      let testEvent: any;
      let testGuest: Guest;

      beforeEach(() => {
        testEvent = TestDataFactory.createEvent();
        testGuest = TestDataFactory.createGuest({ eventId: testEvent.id });
        guests.push(testGuest);
      });

      it('should delete existing guest', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; guestId: string }>({
          params: { eventId: testEvent.id, guestId: testGuest.id }
        });

        // Act
        deleteGuest(req as Request<{ eventId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(204);
        expect(guests).toHaveLength(0);
      });

      it('should return 404 when deleting non-existent guest', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; guestId: string }>({
          params: { eventId: testEvent.id, guestId: TEST_CONSTANTS.VALID_UUID }
        });

        // Act
        deleteGuest(req as Request<{ eventId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
      });

      it('should return 400 for invalid guest ID format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; guestId: string }>({
          params: { eventId: testEvent.id, guestId: TEST_CONSTANTS.INVALID_UUID }
        });

        // Act
        deleteGuest(req as Request<{ eventId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }
}

describe('Guest Controller', () => {
  let testSetup: GuestControllerTest;

  beforeAll(() => {
    testSetup = new GuestControllerTest();
  });

  beforeEach(() => {
    testSetup.beforeEach();
  });

  afterEach(() => {
    testSetup.afterEach();
  });

  it('runs all test suites', () => {
    testSetup.testValidateGuest();
    testSetup.testGetEventGuests();
    testSetup.testGetGuest();
    testSetup.testCreateGuest();
    testSetup.testUpdateGuest();
    testSetup.testDeleteGuest();
  });
}); 
import { BaseTestSetup } from '../helpers/BaseTestSetup';
import { TEST_CONSTANTS } from '../constants/testConstants';
import { TestDataFactory } from '../factories/testDataFactory';
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

interface CreateTableAssignmentDto {
  guestId: string;
  seatNumbers: number[];
}

class TableAssignmentControllerTest extends BaseTestSetup {
  beforeEach(): void {
    super.beforeEach();
  }

  afterEach(): void {
    super.afterEach();
  }

  testValidateSeatNumbers(): void {
    describe('validateSeatNumbers', () => {
      it('should validate valid seat numbers', () => {
        // Arrange
        const testTable = TestDataFactory.createTableFeature();

        // Act & Assert
        expect(() => validateSeatNumbers(testTable, [1, 2])).not.toThrow();
      });

      it('should throw error for invalid seat numbers', () => {
        // Arrange
        const testTable = TestDataFactory.createTableFeature();

        // Act & Assert
        expect(() => validateSeatNumbers(testTable, [0])).toThrow(TableAssignmentError);
        expect(() => validateSeatNumbers(testTable, [9])).toThrow(TableAssignmentError);
        expect(() => validateSeatNumbers(testTable, [-1])).toThrow(TableAssignmentError);
      });

      it('should throw error for duplicate seat numbers', () => {
        // Arrange
        const testTable = TestDataFactory.createTableFeature();

        // Act & Assert
        expect(() => validateSeatNumbers(testTable, [1, 1])).toThrow(TableAssignmentError);
      });
    });
  }

  testCheckSeatAvailability(): void {
    describe('checkSeatAvailability', () => {
      let testEvent: any;
      let testTable: any;

      beforeEach(() => {
        testEvent = TestDataFactory.createEvent();
        testTable = TestDataFactory.createTable({ eventId: testEvent.id });

        // Add an existing assignment
        tableAssignments.push({
          id: TEST_CONSTANTS.VALID_UUID,
          eventId: testEvent.id,
          tableId: testTable.tableNumber,
          guestId: TEST_CONSTANTS.VALID_UUID,
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
  }

  testGetTableAssignments(): void {
    describe('getTableAssignments', () => {
      let testEvent: any;
      let testTable: any;

      beforeEach(() => {
        testEvent = TestDataFactory.createEvent();
        testTable = TestDataFactory.createTable({ eventId: testEvent.id });
      });

      it('should return assignments for a valid table', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; tableId: string }>({
          params: { eventId: testEvent.id, tableId: testTable.tableNumber }
        });

        // Act
        getTableAssignments(req as Request<{ eventId: string; tableId: string }>, res as Response);

        // Assert
        expect(res.status).not.toHaveBeenCalledWith(400);
        expect(res.status).not.toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith([]);
      });

      it('should return 404 for non-existent event', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; tableId: string }>({
          params: { eventId: TEST_CONSTANTS.VALID_UUID, tableId: testTable.tableNumber }
        });

        // Act
        getTableAssignments(req as Request<{ eventId: string; tableId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          code: TableAssignmentErrorCodes.EVENT_NOT_FOUND
        }));
      });

      it('should return 400 for non-existent table', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; tableId: string }>({
          params: { eventId: testEvent.id, tableId: TEST_CONSTANTS.VALID_UUID }
        });

        // Act
        getTableAssignments(req as Request<{ eventId: string; tableId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          code: TableAssignmentErrorCodes.TABLE_NOT_FOUND
        }));
      });

      it('should return 400 for invalid event ID format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; tableId: string }>({
          params: { eventId: TEST_CONSTANTS.INVALID_UUID, tableId: testTable.tableNumber }
        });

        // Act
        getTableAssignments(req as Request<{ eventId: string; tableId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
        }));
      });
    });
  }

  testCreateTableAssignment(): void {
    describe('createTableAssignment', () => {
      let testEvent: any;
      let testTable: any;
      let testGuest: any;

      beforeEach(() => {
        testEvent = TestDataFactory.createEvent();
        testTable = TestDataFactory.createTable({ eventId: testEvent.id });
        testGuest = TestDataFactory.createGuest({ 
          eventId: testEvent.id,
          partySize: 2
        });
      });

      it('should create a valid table assignment', () => {
        // Arrange
        const { req, res } = this.testRequest<
          { eventId: string; tableId: string },
          CreateTableAssignmentDto
        >({
          params: { eventId: testEvent.id, tableId: testTable.tableNumber },
          body: { guestId: testGuest.id, seatNumbers: [1, 2] }
        });

        // Act
        createTableAssignment(req as Request<{ eventId: string; tableId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          eventId: testEvent.id,
          tableId: testTable.tableNumber,
          guestId: testGuest.id,
          seatNumbers: [1, 2]
        }));
      });

      it('should return 400 for invalid seat numbers', () => {
        // Arrange
        const { req, res } = this.testRequest<
          { eventId: string; tableId: string },
          CreateTableAssignmentDto
        >({
          params: { eventId: testEvent.id, tableId: testTable.tableNumber },
          body: { guestId: testGuest.id, seatNumbers: [0, 9] }
        });

        // Act
        createTableAssignment(req as Request<{ eventId: string; tableId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
        }));
      });

      it('should return 400 when party size doesnt match seat numbers', () => {
        // Arrange
        const { req, res } = this.testRequest<
          { eventId: string; tableId: string },
          CreateTableAssignmentDto
        >({
          params: { eventId: testEvent.id, tableId: testTable.tableNumber },
          body: { guestId: testGuest.id, seatNumbers: [1] }
        });

        // Act
        createTableAssignment(req as Request<{ eventId: string; tableId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          code: TableAssignmentErrorCodes.INVALID_PARTY_SIZE
        }));
      });
    });
  }

  testDeleteTableAssignment(): void {
    describe('deleteTableAssignment', () => {
      let testEvent: any;
      let testTable: any;
      let testGuest: any;
      let existingAssignment: TableAssignment;

      beforeEach(() => {
        testEvent = TestDataFactory.createEvent();
        testTable = TestDataFactory.createTable({ eventId: testEvent.id });
        testGuest = TestDataFactory.createGuest({ eventId: testEvent.id });

        existingAssignment = {
          id: TEST_CONSTANTS.VALID_UUID,
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
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; tableId: string; guestId: string }>({
          params: {
            eventId: testEvent.id,
            tableId: testTable.tableNumber,
            guestId: testGuest.id
          }
        });

        // Act
        deleteTableAssignment(req as Request<{ eventId: string; tableId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(204);
        expect(tableAssignments).toHaveLength(0);
      });

      it('should return 404 for non-existent assignment', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; tableId: string; guestId: string }>({
          params: {
            eventId: testEvent.id,
            tableId: testTable.tableNumber,
            guestId: TEST_CONSTANTS.VALID_UUID
          }
        });

        // Act
        deleteTableAssignment(req as Request<{ eventId: string; tableId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          code: TableAssignmentErrorCodes.ASSIGNMENT_NOT_FOUND
        }));
      });

      it('should return 400 for invalid event ID format', () => {
        // Arrange
        const { req, res } = this.testRequest<{ eventId: string; tableId: string; guestId: string }>({
          params: {
            eventId: TEST_CONSTANTS.INVALID_UUID,
            tableId: testTable.tableNumber,
            guestId: testGuest.id
          }
        });

        // Act
        deleteTableAssignment(req as Request<{ eventId: string; tableId: string; guestId: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
        }));
      });
    });
  }
}

describe('Table Assignment Controller', () => {
  let testSetup: TableAssignmentControllerTest;

  beforeAll(() => {
    testSetup = new TableAssignmentControllerTest();
  });

  beforeEach(() => {
    testSetup.beforeEach();
  });

  afterEach(() => {
    testSetup.afterEach();
  });

  it('runs all test suites', () => {
    testSetup.testValidateSeatNumbers();
    testSetup.testCheckSeatAvailability();
    testSetup.testGetTableAssignments();
    testSetup.testCreateTableAssignment();
    testSetup.testDeleteTableAssignment();
  });
});
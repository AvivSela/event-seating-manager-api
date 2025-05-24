import { TestDataFactory } from '../factories/testDataFactory';
import { createTestRequest } from './testRequestHelper';
import { users } from '../../controllers/userController';
import { events } from '../../controllers/eventController';
import { guests } from '../../controllers/guestController';
import { venues } from '../../controllers/venueController';
import { tableAssignments } from '../../controllers/tableAssignmentController';

export class BaseTestSetup {
  protected testData: TestDataFactory;
  protected testRequest = createTestRequest;

  constructor() {
    this.testData = new TestDataFactory();
  }

  protected clearAllData() {
    users.length = 0;
    events.length = 0;
    guests.length = 0;
    venues.length = 0;
    tableAssignments.length = 0;
  }

  protected beforeEach() {
    this.clearAllData();
    jest.clearAllMocks();
  }

  protected afterEach() {
    this.clearAllData();
    jest.restoreAllMocks();
  }
} 
import { BaseTestSetup } from '../helpers/BaseTestSetup';
import { TEST_CONSTANTS } from '../constants/testConstants';
import { users } from '../../controllers/userController';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../../controllers/userController';
import { User } from '../../types/user';
import { Request, Response } from 'express';
import { TestDataFactory } from '../factories/testDataFactory';

interface CreateUserDto {
  name: string;
  email: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
}

class UserControllerTest extends BaseTestSetup {
  beforeEach(): void {
    super.beforeEach();
  }

  afterEach(): void {
    super.afterEach();
  }

  testGetAllUsers(): void {
    describe('getAllUsers', () => {
      it('should return all users', () => {
        // Arrange
        const testUsers = [
          TestDataFactory.createUser(),
          TestDataFactory.createUser({ name: 'Test User 2', email: 'test2@example.com' })
        ];
        users.push(...testUsers);

        // Act
        const { req, res } = this.testRequest();
        getAllUsers(req as Request, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith(testUsers);
      });

      it('should return empty array when no users exist', () => {
        const { req, res } = this.testRequest();
        getAllUsers(req as Request, res as Response);
        expect(res.json).toHaveBeenCalledWith([]);
      });
    });
  }

  testGetUserById(): void {
    describe('getUserById', () => {
      it('should return user when valid ID is provided', () => {
        // Arrange
        const testUser = TestDataFactory.createUser();
        users.push(testUser);

        // Act
        const { req, res } = this.testRequest<{ id: string }>({
          params: { id: testUser.id }
        });
        getUserById(req as Request<{ id: string }>, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith(testUser);
      });

      it('should return 404 when user is not found', () => {
        const { req, res } = this.testRequest<{ id: string }>({
          params: { id: TEST_CONSTANTS.VALID_UUID }
        });
        getUserById(req as Request<{ id: string }>, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
      });

      it('should return 400 when invalid UUID is provided', () => {
        const { req, res } = this.testRequest<{ id: string }>({
          params: { id: TEST_CONSTANTS.INVALID_UUID }
        });
        getUserById(req as Request<{ id: string }>, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }

  testCreateUser(): void {
    describe('createUser', () => {
      it('should create a new user with valid data', () => {
        // Arrange
        const userData: CreateUserDto = {
          name: 'New User',
          email: TEST_CONSTANTS.VALID_EMAIL
        };

        // Act
        const { req, res } = this.testRequest<{}, CreateUserDto>({
          body: userData
        });
        createUser(req as Request, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          name: userData.name,
          email: userData.email,
          id: expect.any(String),
          createdAt: expect.any(Date)
        }));
        expect(users).toHaveLength(1);
      });

      it('should return 400 when required fields are missing', () => {
        const { req, res } = this.testRequest<{}, Partial<CreateUserDto>>({
          body: { name: 'Test User' }
        });
        createUser(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Name and email are required' });
        expect(users).toHaveLength(0);
      });
    });
  }

  testUpdateUser(): void {
    describe('updateUser', () => {
      it('should update user with valid data', () => {
        // Arrange
        const testUser = TestDataFactory.createUser();
        users.push(testUser);

        const updateData: UpdateUserDto = {
          name: 'Updated Name',
          email: 'updated@example.com'
        };

        // Act
        const { req, res } = this.testRequest<{ id: string }, UpdateUserDto>({
          params: { id: testUser.id },
          body: updateData
        });
        updateUser(req as Request<{ id: string }>, res as Response);

        // Assert
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          ...testUser,
          ...updateData,
          updatedAt: expect.any(Date)
        }));
      });

      it('should return 404 when updating non-existent user', () => {
        const { req, res } = this.testRequest<{ id: string }, UpdateUserDto>({
          params: { id: TEST_CONSTANTS.VALID_UUID },
          body: { name: 'New Name' }
        });
        updateUser(req as Request<{ id: string }>, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
      });

      it('should return 400 when invalid UUID is provided', () => {
        const { req, res } = this.testRequest<{ id: string }, UpdateUserDto>({
          params: { id: TEST_CONSTANTS.INVALID_UUID },
          body: { name: 'New Name' }
        });
        updateUser(req as Request<{ id: string }>, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }

  testDeleteUser(): void {
    describe('deleteUser', () => {
      it('should delete existing user', () => {
        // Arrange
        const testUser = TestDataFactory.createUser();
        users.push(testUser);

        // Act
        const { req, res } = this.testRequest<{ id: string }>({
          params: { id: testUser.id }
        });
        deleteUser(req as Request<{ id: string }>, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
        expect(users).toHaveLength(0);
      });

      it('should return 404 when deleting non-existent user', () => {
        const { req, res } = this.testRequest<{ id: string }>({
          params: { id: TEST_CONSTANTS.VALID_UUID }
        });
        deleteUser(req as Request<{ id: string }>, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
      });

      it('should return 400 when invalid UUID is provided', () => {
        const { req, res } = this.testRequest<{ id: string }>({
          params: { id: TEST_CONSTANTS.INVALID_UUID }
        });
        deleteUser(req as Request<{ id: string }>, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: TEST_CONSTANTS.ERROR_MESSAGES.INVALID_UUID });
      });
    });
  }
}

describe('User Controller', () => {
  let testSetup: UserControllerTest;

  beforeAll(() => {
    testSetup = new UserControllerTest();
  });

  beforeEach(() => {
    testSetup.beforeEach();
  });

  afterEach(() => {
    testSetup.afterEach();
  });

  it('runs all test suites', () => {
    testSetup.testGetAllUsers();
    testSetup.testGetUserById();
    testSetup.testCreateUser();
    testSetup.testUpdateUser();
    testSetup.testDeleteUser();
  });
}); 
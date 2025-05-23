import { Request, Response } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  users
} from '../../controllers/userController';
import { User, CreateUserDto, UpdateUserDto } from '../../types/user';
import { generateUUID } from '../../utils/uuid';

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

describe('User Controller', () => {
  beforeEach(() => {
    // Clear users array before each test
    users.length = 0;
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', () => {
      const testUsers: User[] = [
        {
          id: generateUUID(),
          name: 'Test User 1',
          email: 'test1@example.com',
          createdAt: new Date()
        },
        {
          id: generateUUID(),
          name: 'Test User 2',
          email: 'test2@example.com',
          createdAt: new Date()
        }
      ];
      users.push(...testUsers);

      const req = mockRequest();
      const res = mockResponse();

      getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(testUsers);
    });

    it('should return empty array when no users exist', () => {
      const req = mockRequest();
      const res = mockResponse();

      getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('getUserById', () => {
    it('should return user when valid ID is provided', () => {
      const testUser: User = {
        id: generateUUID(),
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date()
      };
      users.push(testUser);

      const req = mockRequest<{ id: string }>({ id: testUser.id });
      const res = mockResponse();

      getUserById(req, res);

      expect(res.json).toHaveBeenCalledWith(testUser);
    });

    it('should return 404 when user is not found', () => {
      const req = mockRequest<{ id: string }>({ id: generateUUID() });
      const res = mockResponse();

      getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 when invalid UUID is provided', () => {
      const req = mockRequest<{ id: string }>({ id: 'invalid-uuid' });
      const res = mockResponse();

      getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });
  });

  describe('createUser', () => {
    it('should create a new user with valid data', () => {
      const userData: CreateUserDto = {
        name: 'New User',
        email: 'new@example.com'
      };
      const req = mockRequest<{}, CreateUserDto>({}, userData);
      const res = mockResponse();

      createUser(req, res);

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
      const req = mockRequest<{}, CreateUserDto>({}, { name: 'Test User' } as CreateUserDto);
      const res = mockResponse();

      createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name and email are required' });
      expect(users).toHaveLength(0);
    });
  });

  describe('updateUser', () => {
    it('should update user with valid data', () => {
      const testUser: User = {
        id: generateUUID(),
        name: 'Original Name',
        email: 'original@example.com',
        createdAt: new Date()
      };
      users.push(testUser);

      const updateData: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };
      const req = mockRequest<{ id: string }, UpdateUserDto>({ id: testUser.id }, updateData);
      const res = mockResponse();

      updateUser(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...testUser,
        ...updateData,
        updatedAt: expect.any(Date)
      }));
    });

    it('should return 404 when updating non-existent user', () => {
      const req = mockRequest<{ id: string }, UpdateUserDto>({ id: generateUUID() }, { name: 'New Name' });
      const res = mockResponse();

      updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 when invalid UUID is provided', () => {
      const req = mockRequest<{ id: string }, UpdateUserDto>({ id: 'invalid-uuid' }, { name: 'New Name' });
      const res = mockResponse();

      updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });

    it('should only update provided fields', () => {
      const testUser: User = {
        id: generateUUID(),
        name: 'Original Name',
        email: 'original@example.com',
        createdAt: new Date()
      };
      users.push(testUser);

      const req = mockRequest<{ id: string }, UpdateUserDto>({ id: testUser.id }, { name: 'Updated Name' });
      const res = mockResponse();

      updateUser(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...testUser,
        name: 'Updated Name',
        email: 'original@example.com',
        updatedAt: expect.any(Date)
      }));
    });

    it('should handle empty update data', () => {
      const testUser: User = {
        id: generateUUID(),
        name: 'Original Name',
        email: 'original@example.com',
        createdAt: new Date()
      };
      users.push(testUser);

      const req = mockRequest<{ id: string }, UpdateUserDto>({ id: testUser.id }, {});
      const res = mockResponse();

      updateUser(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...testUser,
        name: 'Original Name',
        email: 'original@example.com',
        updatedAt: expect.any(Date)
      }));
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user', () => {
      const testUser: User = {
        id: generateUUID(),
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date()
      };
      users.push(testUser);

      const req = mockRequest<{ id: string }>({ id: testUser.id });
      const res = mockResponse();

      deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(users).toHaveLength(0);
    });

    it('should return 404 when deleting non-existent user', () => {
      const req = mockRequest<{ id: string }>({ id: generateUUID() });
      const res = mockResponse();

      deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 when invalid UUID is provided', () => {
      const req = mockRequest<{ id: string }>({ id: 'invalid-uuid' });
      const res = mockResponse();

      deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });
  });
}); 
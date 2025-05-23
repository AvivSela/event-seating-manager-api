import request from 'supertest';
import app from '../../app';
import { users } from '../../controllers/userController';
import { User } from '../../types/user';
import { isValidUUID } from '../../utils/uuid';

describe('User Routes', () => {
  beforeEach(() => {
    // Clear users array before each test
    users.length = 0;
  });

  describe('GET /', () => {
    it('should return empty array when no users exist', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all users', async () => {
      // Create test users
      const testUser1 = await request(app)
        .post('/api/users')
        .send({ name: 'Test User 1', email: 'test1@example.com' });
      const testUser2 = await request(app)
        .post('/api/users')
        .send({ name: 'Test User 2', email: 'test2@example.com' });

      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Test User 1',
            email: 'test1@example.com',
          }),
          expect.objectContaining({
            name: 'Test User 2',
            email: 'test2@example.com',
          }),
        ])
      );
    });
  });

  describe('GET /:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app).get('/api/users/invalid-uuid');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid user ID format' });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/123e4567-e89b-4456-a456-426614174000');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should return user for valid ID', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({ name: 'Test User', email: 'test@example.com' });

      const response = await request(app).get(`/api/users/${createResponse.body.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: createResponse.body.id,
        name: 'Test User',
        email: 'test@example.com',
      }));
    });
  });

  describe('POST /', () => {
    it('should create new user with valid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'New User', email: 'new@example.com' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining({
        name: 'New User',
        email: 'new@example.com',
      }));
      expect(isValidUUID(response.body.id)).toBe(true);
      expect(response.body.createdAt).toBeDefined();
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Name and email are required' });
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Test User' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Name and email are required' });
    });
  });

  describe('PUT /:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .put('/api/users/invalid-uuid')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid user ID format' });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/123e4567-e89b-4456-a456-426614174000')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should update user with valid data', async () => {
      // Create a user first
      const createResponse = await request(app)
        .post('/api/users')
        .send({ name: 'Original Name', email: 'original@example.com' });

      const updateResponse = await request(app)
        .put(`/api/users/${createResponse.body.id}`)
        .send({ name: 'Updated Name', email: 'updated@example.com' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toEqual(expect.objectContaining({
        id: createResponse.body.id,
        name: 'Updated Name',
        email: 'updated@example.com',
      }));
      expect(updateResponse.body.updatedAt).toBeDefined();
    });

    it('should partially update user with only name', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({ name: 'Original Name', email: 'original@example.com' });

      const updateResponse = await request(app)
        .put(`/api/users/${createResponse.body.id}`)
        .send({ name: 'Updated Name' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toEqual(expect.objectContaining({
        id: createResponse.body.id,
        name: 'Updated Name',
        email: 'original@example.com',
      }));
    });
  });

  describe('DELETE /:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app).delete('/api/users/invalid-uuid');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid user ID format' });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).delete('/api/users/123e4567-e89b-4456-a456-426614174000');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should delete existing user', async () => {
      // Create a user first
      const createResponse = await request(app)
        .post('/api/users')
        .send({ name: 'Test User', email: 'test@example.com' });

      const deleteResponse = await request(app).delete(`/api/users/${createResponse.body.id}`);
      expect(deleteResponse.status).toBe(204);

      // Verify user is deleted
      const getResponse = await request(app).get(`/api/users/${createResponse.body.id}`);
      expect(getResponse.status).toBe(404);
    });
  });
}); 
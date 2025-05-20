import request from 'supertest';
import app from '../app';
import { User } from '../types/user';

describe('User API Routes', () => {
  let createdUser: User;

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john.doe@example.com');
      expect(response.body).toHaveProperty('createdAt');
      
      createdUser = response.body;
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'john.doe@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name and email are required');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name and email are required');
    });
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('email');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user', async () => {
      const response = await request(app).get(`/api/users/${createdUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdUser.id);
      expect(response.body).toHaveProperty('name', createdUser.name);
      expect(response.body).toHaveProperty('email', createdUser.email);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user email', async () => {
      const response = await request(app)
        .put(`/api/users/${createdUser.id}`)
        .send({
          email: 'john.updated@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdUser.id);
      expect(response.body).toHaveProperty('email', 'john.updated@example.com');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should update user name', async () => {
      const response = await request(app)
        .put(`/api/users/${createdUser.id}`)
        .send({
          name: 'John Updated'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdUser.id);
      expect(response.body).toHaveProperty('name', 'John Updated');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/999')
        .send({
          name: 'John Updated'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const response = await request(app).delete(`/api/users/${createdUser.id}`);

      expect(response.status).toBe(204);
    });

    it('should verify user was deleted', async () => {
      const response = await request(app).get(`/api/users/${createdUser.id}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).delete('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });
}); 
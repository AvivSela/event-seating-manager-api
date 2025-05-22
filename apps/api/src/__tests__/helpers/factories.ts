import request from 'supertest';
import app from '../../app';
import { User } from '../../types/user';
import { Event } from '../../types/event';
import { Venue } from '../../types/venue';
import { testUser, testVenue, testEvent, TEST_USER_ID, TEST_VENUE_ID } from './fixtures';

export async function createTestUser(userData: Partial<User> = testUser): Promise<User> {
  const response = await request(app)
    .post('/api/users')
    .send(userData);
  return response.body;
}

export async function createTestVenue(venueData: Partial<Venue> = testVenue): Promise<Venue> {
  const response = await request(app)
    .post('/api/venues')
    .send(venueData);
  return response.body;
}

export async function createTestEvent(
  eventData: Partial<Event> = testEvent,
  userId: string = TEST_USER_ID,
  venueId: string = TEST_VENUE_ID
): Promise<Event> {
  const response = await request(app)
    .post('/api/events')
    .send({
      ...eventData,
      userId,
      venueId
    });
  return response.body;
} 
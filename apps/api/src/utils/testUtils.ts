import { events } from '../controllers/eventController';
import { venues } from '../controllers/venueController';
import { Request, Response } from "express";

/**
 * Test utility functions for managing test data state
 */

/**
 * Clears all events from the events array
 * This function should only be used in test environments
 */
export const clearEvents = (): void => {
  const events = require('../controllers/eventController').events;
  events.length = 0;
};

/**
 * Clears all venues from the venues array
 * This function should only be used in test environments
 */
export const clearVenues = (): void => {
  const venues = require('../controllers/venueController').venues;
  venues.length = 0;
};

export const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const mockRequest = (data: Partial<Request> = {}): Request => {
  const req = {
    body: {},
    params: {},
    query: {},
    ...data
  } as Request;
  return req;
};

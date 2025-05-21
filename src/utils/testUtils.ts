import { events } from '../controllers/eventController';
import { venues } from '../controllers/venueController';

/**
 * Test utility functions for managing test data state
 */

/**
 * Clears all events from the events array
 * This function should only be used in test environments
 */
export const clearEvents = (): void => {
  events.length = 0;
};

/**
 * Clears all venues from the venues array
 * This function should only be used in test environments
 */
export const clearVenues = (): void => {
  venues.length = 0;
};

/**
 * Clears all test data (events and venues)
 * This function should only be used in test environments
 */
export const clearAllTestData = (): void => {
  clearEvents();
  clearVenues();
};

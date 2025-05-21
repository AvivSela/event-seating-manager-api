import { User } from '../../types/user';
import { Event, EventType } from '../../types/event';
import { Venue, VenueMap } from '../../types/venue';

export const testUser: Partial<User> = {
  name: 'Test User',
  email: 'test.user@example.com'
};

export const testVenue: Partial<Venue> = {
  name: 'Test Venue',
  address: '123 Test St',
  capacity: 100,
  description: 'A test venue'
};

export const testEvent: Partial<Event> = {
  type: EventType.WEDDING,
  title: "John & Jane's Wedding",
  description: 'Celebration of John and Jane\'s marriage',
  date: new Date('2024-06-15T15:00:00.000Z')
};

export const validVenueMap: VenueMap = {
  dimensions: {
    width: 50,
    height: 30
  },
  features: [
    {
      type: 'stage',
      position: { x: 25, y: 5 },
      dimensions: { width: 10, height: 5 },
      rotation: 0
    },
    {
      type: 'bar',
      position: { x: 45, y: 15 },
      dimensions: { width: 5, height: 2 }
    },
    {
      type: 'table',
      position: { x: 15, y: 20 },
      dimensions: { width: 3, height: 3 },
      numberOfSeats: 6,
      guests: [
        {
          id: '1',
          name: 'John Doe',
          seatNumber: 1
        },
        {
          id: '2',
          name: 'Jane Smith',
          seatNumber: 2
        }
      ]
    }
  ]
}; 
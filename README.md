
[![codecov](https://codecov.io/gh/AvivSela/event-seating-manager-api/branch/main/graph/badge.svg)](https://codecov.io/gh/AvivSela/event-seating-manager-api)
# Event Seating API

A TypeScript-based REST API service for managing event seating arrangements, built with Express.js.

## Features

- Event management with venue assignments
- Guest management with party size tracking
- Table assignments with seat number tracking
- Venue management with floor plan support
- In-memory data storage (no database required)

## Project Structure

```
/
├── apps/
│   └── api/
│       ├── src/           # Source code directory
│       ├── dist/          # Compiled output
│       ├── coverage/      # Test coverage reports
│       ├── jest.config.js # Jest test configuration
│       ├── package.json   # API-specific dependencies
│       └── tsconfig.json  # API-specific TypeScript config
├── docs/                  # Documentation files
├── dist/                  # Project build output
├── coverage/              # Project-wide test coverage
├── .github/              # GitHub configuration files
├── .yarn/                # Yarn package manager files
├── node_modules/         # Project dependencies
├── jest.config.js        # Project-wide Jest configuration
├── tsconfig.json         # Root TypeScript configuration
├── package.json          # Project dependencies and scripts
├── yarn.lock             # Yarn dependency lock file
├── nodemon.json          # Nodemon configuration
├── codecov.yml           # CodeCov configuration
└── LICENSE              # Project license file
```

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Development:
```bash
# Start development server with auto-reload
yarn dev
```

3. Production:
```bash
# Build the TypeScript files
yarn build

# Start the production server
yarn start
```

The server will start on port 3000 by default.

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/users/:userId/events` - Get user's events

### Venues
- `GET /api/venues` - Get all venues
- `GET /api/venues/:id` - Get venue by ID
- `POST /api/venues` - Create new venue
- `PUT /api/venues/:id` - Update venue
- `DELETE /api/venues/:id` - Delete venue

### Guests
- `GET /api/events/:eventId/guests` - Get event guests
- `GET /api/events/:eventId/guests/:guestId` - Get specific guest
- `POST /api/events/:eventId/guests` - Create guest
- `PUT /api/events/:eventId/guests/:guestId` - Update guest
- `DELETE /api/events/:eventId/guests/:guestId` - Delete guest

### Table Assignments
- `GET /api/events/:eventId/tables/:tableId/assignments` - Get table assignments
- `POST /api/events/:eventId/tables/:tableId/assignments` - Create assignment
- `DELETE /api/events/:eventId/tables/:tableId/assignments/:guestId` - Delete assignment

## Data Models

### User
```typescript
interface User {
  id: string;         // UUID
  name: string;       // Full name
  email: string;      // Email address
  createdAt: Date;    // Creation timestamp
  updatedAt?: Date;   // Last update timestamp
}
```

### Event
```typescript
interface Event {
  id: string;         // UUID
  userId: string;     // Owner's user ID
  venueId: string;    // Associated venue ID
  type: EventType;    // WEDDING | BIRTHDAY | CORPORATE | OTHER
  title: string;      // Event title
  description?: string; // Optional description
  date: string;       // Event date (ISO string)
  createdAt: Date;    // Creation timestamp
  updatedAt?: Date;   // Last update timestamp
}
```

### Venue
```typescript
interface Venue {
  id: string;         // UUID
  name: string;       // Venue name
  address: string;    // Physical address
  capacity: number;   // Maximum capacity
  description?: string; // Optional description
  map?: VenueMap;     // Optional floor plan
  createdAt: Date;    // Creation timestamp
  updatedAt?: Date;   // Last update timestamp
}
```

### Guest
```typescript
interface Guest {
  id: string;         // UUID
  eventId: string;    // Associated event ID
  name: string;       // Guest name
  email?: string;     // Optional email
  status: GuestStatus; // INVITED | CONFIRMED | DECLINED | MAYBE
  partySize: number;  // Number of seats needed
  createdAt: Date;    // Creation timestamp
  updatedAt?: Date;   // Last update timestamp
}
```

### Table Assignment
```typescript
interface TableAssignment {
  id: string;         // UUID
  eventId: string;    // Associated event ID
  tableId: string;    // Table identifier
  guestId: string;    // Assigned guest ID
  seatNumbers: number[]; // Assigned seat numbers
  assignedAt: Date;   // Assignment timestamp
  createdAt: Date;    // Creation timestamp
}
```

## Error Handling

All endpoints follow a consistent error response format:

```typescript
interface ErrorResponse {
  message: string;    // Human-readable error message
  code?: string;      // Optional error code for specific scenarios
}
```

Common error status codes:
- 400: Bad Request (invalid input)
- 404: Not Found
- 500: Internal Server Error

## Development

The project uses TypeScript for better type safety and developer experience. Key features:

- Strong typing for all entities and DTOs
- Type-safe Express.js route handlers
- UUID-based entity IDs with validation
- In-memory data storage with type safety
- Comprehensive validation rules
- Error handling with type checking

## License

This project is licensed under the MIT License - see the LICENSE file for details. 

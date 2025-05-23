# Event Seating API Documentation

## Overview

The Event Seating API provides endpoints for managing events, venues, guests, and table assignments. All data is stored in memory and uses UUID-based identifiers.

## Base URL

All endpoints are prefixed with `/api`.

## Data Types

### Event Types
- `WEDDING`
- `BIRTHDAY`
- `CORPORATE`
- `OTHER`

### Guest Status
- `INVITED`
- `CONFIRMED`
- `DECLINED`
- `MAYBE`

## Endpoints

### User Management

#### Get All Users
- **GET** `/api/users`
- Returns all users in the system
- Response: Array of User objects

#### Get User by ID
- **GET** `/api/users/:id`
- Returns a specific user
- Parameters:
  - `id`: UUID of the user
- Error Responses:
  - 400: Invalid UUID format
  - 404: User not found

#### Create User
- **POST** `/api/users`
- Creates a new user
- Request Body:
  ```json
  {
    "name": "string",
    "email": "string"
  }
  ```
- Response: Created User object with UUID

#### Update User
- **PUT** `/api/users/:id`
- Updates user information
- Parameters:
  - `id`: UUID of the user
- Request Body:
  ```json
  {
    "name": "string (optional)",
    "email": "string (optional)"
  }
  ```
- Error Responses:
  - 400: Invalid UUID format
  - 404: User not found

#### Delete User
- **DELETE** `/api/users/:id`
- Removes a user
- Parameters:
  - `id`: UUID of the user
- Response: 204 No Content
- Error Responses:
  - 400: Invalid UUID format
  - 404: User not found

### Event Management

#### Get All Events
- **GET** `/api/events`
- Returns all events in the system
- Response: Array of Event objects

#### Get Event by ID
- **GET** `/api/events/:id`
- Returns a specific event
- Parameters:
  - `id`: UUID of the event
- Error Responses:
  - 400: Invalid UUID format
  - 404: Event not found

#### Create Event
- **POST** `/api/events`
- Creates a new event
- Request Body:
  ```json
  {
    "type": "WEDDING | BIRTHDAY | CORPORATE | OTHER",
    "title": "string",
    "description": "string (optional)",
    "date": "ISO date string",
    "userId": "UUID",
    "venueId": "UUID"
  }
  ```
- Response: Created Event object
- Error Responses:
  - 400: Invalid input data
  - 404: User or venue not found

#### Update Event
- **PUT** `/api/events/:id`
- Updates event information
- Parameters:
  - `id`: UUID of the event
- Request Body: Same as Create Event (all fields optional)
- Error Responses:
  - 400: Invalid UUID format or input data
  - 404: Event not found

#### Delete Event
- **DELETE** `/api/events/:id`
- Removes an event and all associated data
- Parameters:
  - `id`: UUID of the event
- Response: 204 No Content
- Error Responses:
  - 400: Invalid UUID format
  - 404: Event not found

### Guest Management

#### Get Event Guests
- **GET** `/api/events/:eventId/guests`
- Returns all guests for an event
- Parameters:
  - `eventId`: UUID of the event
- Query Parameters:
  - `assigned`: boolean (optional) - Filter by table assignment status
- Response: Array of Guest objects with assignment information

#### Get Guest by ID
- **GET** `/api/events/:eventId/guests/:guestId`
- Returns a specific guest
- Parameters:
  - `eventId`: UUID of the event
  - `guestId`: UUID of the guest
- Error Responses:
  - 400: Invalid UUID format
  - 404: Event or guest not found

#### Create Guest
- **POST** `/api/events/:eventId/guests`
- Creates a new guest for an event
- Parameters:
  - `eventId`: UUID of the event
- Request Body:
  ```json
  {
    "name": "string",
    "email": "string (optional)",
    "status": "INVITED | CONFIRMED | DECLINED | MAYBE",
    "partySize": "number"
  }
  ```
- Response: Created Guest object
- Error Responses:
  - 400: Invalid input data
  - 404: Event not found

#### Update Guest
- **PUT** `/api/events/:eventId/guests/:guestId`
- Updates guest information
- Parameters:
  - `eventId`: UUID of the event
  - `guestId`: UUID of the guest
- Request Body: Same as Create Guest (all fields optional)
- Error Responses:
  - 400: Invalid UUID format or input data
  - 404: Event or guest not found

#### Delete Guest
- **DELETE** `/api/events/:eventId/guests/:guestId`
- Removes a guest and their table assignments
- Parameters:
  - `eventId`: UUID of the event
  - `guestId`: UUID of the guest
- Response: 204 No Content
- Error Responses:
  - 400: Invalid UUID format
  - 404: Event or guest not found

### Table Assignment Management

#### Get Table Assignments
- **GET** `/api/events/:eventId/tables/:tableId/assignments`
- Returns all assignments for a table
- Parameters:
  - `eventId`: UUID of the event
  - `tableId`: Table identifier from venue map
- Response: Array of TableAssignment objects

#### Create Table Assignment
- **POST** `/api/events/:eventId/tables/:tableId/assignments`
- Assigns a guest to specific seats at a table
- Parameters:
  - `eventId`: UUID of the event
  - `tableId`: Table identifier from venue map
- Request Body:
  ```json
  {
    "guestId": "UUID",
    "seatNumbers": "number[]"
  }
  ```
- Response: Created TableAssignment object
- Error Responses:
  - 400: Invalid input data
  - 404: Event, table, or guest not found
  - 409: Seat conflict or capacity exceeded

#### Delete Table Assignment
- **DELETE** `/api/events/:eventId/tables/:tableId/assignments/:guestId`
- Removes a guest's table assignment
- Parameters:
  - `eventId`: UUID of the event
  - `tableId`: Table identifier from venue map
  - `guestId`: UUID of the guest
- Response: 204 No Content
- Error Responses:
  - 400: Invalid UUID format
  - 404: Assignment not found

## Error Handling

All error responses follow this format:
```json
{
  "message": "Human-readable error message",
  "code": "Optional error code for specific scenarios"
}
```

### Common Error Codes
- `INVALID_ID_FORMAT`: Invalid UUID format
- `INVALID_SEAT_NUMBERS`: Invalid seat numbers for table
- `TABLE_CAPACITY_EXCEEDED`: Assignment exceeds table capacity
- `SEATS_ALREADY_ASSIGNED`: Seats are already assigned
- `INVALID_PARTY_SIZE`: Number of seats doesn't match party size
- `TABLE_NOT_FOUND`: Table doesn't exist in venue
- `GUEST_NOT_FOUND`: Guest not found or doesn't belong to event
- `GUEST_ALREADY_ASSIGNED`: Guest is already assigned to a table

## Data Validation

### Guest Validation
- Party size must be positive
- Email must be valid format (if provided)
- Status must be valid enum value

### Table Assignment Validation
- Seat numbers must be within table capacity
- Number of seats must match guest party size
- Seats must not be already assigned
- Guest must belong to the event
- Table must exist in venue map

### Event Validation
- Title is required
- Date must be valid ISO string
- Type must be valid enum value
- Venue must exist and have sufficient capacity

## Performance Considerations

- All operations are in-memory
- Response times should be under 100ms
- Assignment operations under 500ms
- Supports events with 500+ guests
- No persistence between server restarts 
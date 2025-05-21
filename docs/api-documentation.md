# Event Seating API Documentation

## Overview

The Event Seating API provides endpoints for managing guests and table assignments for events. This document outlines the available endpoints, request/response formats, and error handling.

## Base URL

All endpoints are prefixed with `/api`.

## Authentication

Authentication details will be provided separately. All endpoints require a valid authentication token.

## Endpoints

### Guest Management

#### Create Guest
- **POST** `/api/events/:eventId/guests`
- Creates a new guest for an event
- Request Body:
  ```json
  {
    "name": "string",
    "email": "string (optional)",
    "phone": "string (optional)",
    "status": "INVITED | CONFIRMED | DECLINED | MAYBE",
    "partySize": "number"
  }
  ```
- Response: `201 Created`
  ```json
  {
    "id": "string",
    "eventId": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "status": "string",
    "partySize": "number",
    "createdAt": "string (ISO date)"
  }
  ```

#### Get All Guests
- **GET** `/api/events/:eventId/guests`
- Returns all guests for an event
- Query Parameters:
  - `assigned`: boolean (optional) - Filter by table assignment status
- Response: `200 OK`
  ```json
  [
    {
      "id": "string",
      "eventId": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "status": "string",
      "partySize": "number",
      "tableAssignment": {
        "tableId": "string",
        "seatNumbers": "number[]",
        "assignedAt": "string (ISO date)"
      }
    }
  ]
  ```

#### Get Single Guest
- **GET** `/api/events/:eventId/guests/:guestId`
- Returns details for a specific guest
- Response: `200 OK`
  ```json
  {
    "id": "string",
    "eventId": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "status": "string",
    "partySize": "number",
    "tableAssignment": {
      "tableId": "string",
      "seatNumbers": "number[]",
      "assignedAt": "string (ISO date)"
    }
  }
  ```

#### Update Guest
- **PUT** `/api/events/:eventId/guests/:guestId`
- Updates guest information
- Request Body: Same as Create Guest
- Response: `200 OK` with updated guest object

#### Delete Guest
- **DELETE** `/api/events/:eventId/guests/:guestId`
- Removes a guest from the event
- Response: `204 No Content`

### Table Assignments

#### Create Table Assignment
- **POST** `/api/events/:eventId/tables/:tableId/assignments`
- Assigns a guest to table seats
- Request Body:
  ```json
  {
    "guestId": "string",
    "seatNumbers": "number[]"
  }
  ```
- Response: `201 Created`
  ```json
  {
    "id": "string",
    "eventId": "string",
    "tableId": "string",
    "guestId": "string",
    "seatNumbers": "number[]",
    "assignedAt": "string (ISO date)",
    "createdAt": "string (ISO date)"
  }
  ```

#### Get Table Assignments
- **GET** `/api/events/:eventId/tables/:tableId/assignments`
- Returns all assignments for a table
- Response: `200 OK`
  ```json
  [
    {
      "id": "string",
      "eventId": "string",
      "tableId": "string",
      "guestId": "string",
      "seatNumbers": "number[]",
      "assignedAt": "string (ISO date)",
      "createdAt": "string (ISO date)"
    }
  ]
  ```

#### Delete Table Assignment
- **DELETE** `/api/events/:eventId/tables/:tableId/assignments/:guestId`
- Removes a guest's table assignment
- Response: `204 No Content`

## Error Codes

The API uses the following error codes:

### General Errors
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Specific Error Codes
These are returned in the response body with a `code` field:

```json
{
  "message": "string",
  "code": "ERROR_CODE"
}
```

#### Table Assignment Errors
- `INVALID_SEAT_NUMBERS`: Seat numbers are invalid for the table
- `TABLE_CAPACITY_EXCEEDED`: Assignment exceeds table capacity
- `SEATS_ALREADY_ASSIGNED`: One or more seats are already assigned
- `INVALID_PARTY_SIZE`: Number of seats doesn't match party size
- `TABLE_NOT_FOUND`: Table doesn't exist in venue
- `GUEST_NOT_FOUND`: Guest not found or doesn't belong to event
- `GUEST_ALREADY_ASSIGNED`: Guest is already assigned to a table

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Performance Expectations

- API response times: < 100ms
- Assignment operations: < 500ms
- Supports events with 500+ guests

## Best Practices

1. Always validate guest party size matches seat number count
2. Check for existing assignments before creating new ones
3. Use the assigned/unassigned filter for efficient guest listing
4. Handle all error codes appropriately in your client application 
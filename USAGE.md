# Event Seating API Usage Guide

This guide provides step-by-step instructions on how to use the Event Seating API to manage events and their seating arrangements.

## Step-by-Step Process

### 1. Create a User Account
First, create a user account if you don't have one:

```http
POST /api/users
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

Response:
```json
{
  "id": "user-uuid",
  "name": "John Smith",
  "email": "john.smith@example.com",
  "createdAt": "2024-03-21T..."
}
```

### 2. Create a Venue
Create a venue with tables layout:

```http
POST /api/venues
Content-Type: application/json

{
  "name": "Grand Ballroom",
  "address": "123 Event Street, City",
  "capacity": 200,
  "map": {
    "dimensions": {
      "width": 1000,
      "height": 800
    },
    "features": [
      {
        "type": "table",
        "tableNumber": "table-uuid-1",
        "position": {
          "x": 100,
          "y": 100
        },
        "dimensions": {
          "width": 80,
          "height": 80
        },
        "shape": "rectangular",
        "numberOfSeats": 8
      }
      // Add more tables as needed
    ]
  }
}
```

Response:
```json
{
  "id": "venue-uuid",
  "name": "Grand Ballroom",
  "address": "123 Event Street, City",
  "capacity": 200,
  "map": { ... },
  "createdAt": "2024-03-21T..."
}
```

### 3. Create an Event
Create an event at the venue:

```http
POST /api/events
Content-Type: application/json

{
  "userId": "user-uuid",
  "venueId": "venue-uuid",
  "title": "Smith Wedding",
  "type": "WEDDING",
  "date": "2024-12-31T18:00:00Z"
}
```

Response:
```json
{
  "id": "event-uuid",
  "userId": "user-uuid",
  "venueId": "venue-uuid",
  "title": "Smith Wedding",
  "type": "WEDDING",
  "date": "2024-12-31T18:00:00Z",
  "createdAt": "2024-03-21T..."
}
```

### 4. Add Guests to the Event
Add guests who will attend the event:

```http
POST /api/events/event-uuid/guests
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "partySize": 2,
  "status": "CONFIRMED"
}
```

Response:
```json
{
  "id": "guest-uuid",
  "eventId": "event-uuid",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "partySize": 2,
  "status": "CONFIRMED",
  "createdAt": "2024-03-21T..."
}
```

### 5. Check Available Tables and Seats
Check which tables and seats are available:

```http
GET /api/events/event-uuid/tables/table-uuid-1/assignments
```

To get unassigned guests:
```http
GET /api/events/event-uuid/guests?assigned=false
```

To get assigned guests:
```http
GET /api/events/event-uuid/guests?assigned=true
```

### 6. Assign Guests to Tables
Assign a guest to specific seats at a table:

```http
POST /api/events/event-uuid/tables/table-uuid-1/assignments
Content-Type: application/json

{
  "guestId": "guest-uuid",
  "seatNumbers": [1, 2]
}
```

Response:
```json
{
  "id": "assignment-uuid",
  "eventId": "event-uuid",
  "tableId": "table-uuid-1",
  "guestId": "guest-uuid",
  "seatNumbers": [1, 2],
  "assignedAt": "2024-03-21T...",
  "createdAt": "2024-03-21T..."
}
```

### 7. Verify Assignments
Check guest assignments:

```http
GET /api/events/event-uuid/guests
```

Response includes assignment information:
```json
{
  "guests": [
    {
      "id": "guest-uuid",
      "name": "Alice Johnson",
      "partySize": 2,
      "status": "CONFIRMED",
      "tableAssignment": {
        "tableId": "table-uuid-1",
        "seatNumbers": [1, 2],
        "assignedAt": "2024-03-21T..."
      }
    }
  ]
}
```

### 8. Modify Assignments
To change a guest's seating, first remove the current assignment:

```http
DELETE /api/events/event-uuid/tables/table-uuid-1/assignments/guest-uuid
```

Then create a new assignment as shown in step 6.

## Important Notes

- Always ensure the guest's party size matches the number of seats being assigned
- Check seat availability before making assignments
- You can't assign the same guest to multiple tables
- You can't assign the same seats to multiple guests
- If you need to move a guest, always remove their current assignment first

## Error Handling

The API will return appropriate error messages if:
- The guest is already assigned
- The seats are already taken
- The party size doesn't match seat numbers
- The table or seats don't exist
- The guest doesn't belong to the event

Example error response:
```json
{
  "code": "SEAT_ALREADY_ASSIGNED",
  "message": "Seats 1, 2 are already assigned",
  "details": {
    "conflictingSeats": [1, 2]
  }
}
``` 
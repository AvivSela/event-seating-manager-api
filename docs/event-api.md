# Event API Documentation

This document describes the Event API endpoints and their usage.

## API Structure

The API is organized around two main resources:
- Events (`/api/events`)
- User-specific Events (`/api/users/:userId/events`)

## Event Types

Events can be of the following types:
- `WEDDING`
- `BIRTHDAY`
- `CORPORATE`
- `OTHER`

## Event Endpoints

### Get All Events

Retrieves all events in the system.

```
GET /api/events
```

#### Response

```json
[
  {
    "id": 1,
    "userId": 1,
    "venueId": 1,
    "type": "WEDDING",
    "title": "John & Jane's Wedding",
    "description": "Celebration of John and Jane's marriage",
    "date": "2024-06-15T15:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
]
```

### Get Event by ID

Retrieves a specific event by its ID.

```
GET /api/events/:id
```

#### Parameters
- `id`: The ID of the event to retrieve

#### Response

```json
{
  "id": 1,
  "userId": 1,
  "venueId": 1,
  "type": "WEDDING",
  "title": "John & Jane's Wedding",
  "description": "Celebration of John and Jane's marriage",
  "date": "2024-06-15T15:00:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Create Event

Creates a new event.

```
POST /api/events
```

#### Request Body

```json
{
  "type": "WEDDING",
  "title": "John & Jane's Wedding",
  "description": "Celebration of John and Jane's marriage",
  "date": "2024-06-15T15:00:00.000Z",
  "userId": 1,
  "venueId": 1
}
```

Required fields:
- `type`: One of the valid event types
- `title`: Event title
- `date`: ISO date string
- `userId`: ID of the user who owns the event
- `venueId`: ID of the venue where the event will be held

Optional fields:
- `description`: Event description

#### Response

```json
{
  "id": 1,
  "userId": 1,
  "venueId": 1,
  "type": "WEDDING",
  "title": "John & Jane's Wedding",
  "description": "Celebration of John and Jane's marriage",
  "date": "2024-06-15T15:00:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### Update Event

Updates an existing event.

```
PUT /api/events/:id
```

#### Parameters
- `id`: The ID of the event to update

#### Request Body

```json
{
  "title": "Updated Wedding Title",
  "description": "Updated description",
  "venueId": 2
}
```

All fields are optional. Only specified fields will be updated.

#### Response

```json
{
  "id": 1,
  "userId": 1,
  "venueId": 2,
  "type": "WEDDING",
  "title": "Updated Wedding Title",
  "description": "Updated description",
  "date": "2024-06-15T15:00:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Delete Event

Deletes an event.

```
DELETE /api/events/:id
```

#### Parameters
- `id`: The ID of the event to delete

#### Response

Returns status code `204` with no content on success.

## User-Specific Event Endpoints

### Get User's Events

Retrieves all events for a specific user.

```
GET /api/users/:userId/events
```

#### Parameters
- `userId`: The ID of the user whose events to retrieve

#### Response

```json
[
  {
    "id": 1,
    "userId": 1,
    "venueId": 1,
    "type": "WEDDING",
    "title": "John & Jane's Wedding",
    "description": "Celebration of John and Jane's marriage",
    "date": "2024-06-15T15:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
]
```

## Error Responses

### Not Found (404)
```json
{
  "message": "Event not found"
}
```

### Bad Request (400)
For missing required fields:
```json
{
  "message": "Type, title, date, userId, and venueId are required"
}
```

For invalid venue:
```json
{
  "message": "Venue not found"
}
```

### Server Error (500)
```json
{
  "message": "Something went wrong!"
}
```

## Example Usage with cURL

### Get All Events
```bash
curl http://localhost:3000/api/events
```

### Get User's Events
```bash
curl http://localhost:3000/api/users/1/events
```

### Create Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "WEDDING",
    "title": "John & Jane'\''s Wedding",
    "description": "Celebration of John and Jane'\''s marriage",
    "date": "2024-06-15T15:00:00.000Z",
    "userId": 1,
    "venueId": 1
  }'
```

### Update Event
```bash
curl -X PUT http://localhost:3000/api/events/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Wedding Title",
    "description": "Updated description"
  }'
```

### Delete Event
```bash
curl -X DELETE http://localhost:3000/api/events/1
``` 
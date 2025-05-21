# Venue API Documentation

This document describes the Venue API endpoints and their usage.

## API Structure

The Venue API is organized around the `/api/venues` resource, providing standard CRUD operations for managing venues.

## Venue Model

A venue has the following properties:
- `id`: Unique identifier (number)
- `name`: Venue name (string)
- `address`: Physical address of the venue (string)
- `capacity`: Maximum capacity of the venue (number)
- `description`: Optional description of the venue (string)
- `map`: Optional venue map configuration (object)
- `createdAt`: Timestamp of venue creation (ISO date string)
- `updatedAt`: Timestamp of last update (ISO date string, optional)

### Venue Map Structure

The venue map has the following structure:
```json
{
  "dimensions": {
    "width": number,
    "height": number
  },
  "features": [
    {
      "type": string,
      "position": {
        "x": number,
        "y": number
      },
      "dimensions": {
        "width": number,
        "height": number
      },
      "rotation": number (optional)
    }
  ]
}
```

## Validation Rules

1. Required Fields:
   - `name`: Must be provided
   - `address`: Must be provided
   - `capacity`: Must be provided and be a positive number

2. Map Validation:
   - If provided, map must include valid dimensions (width and height)
   - Each feature must have:
     - Valid type (e.g., 'stage', 'bar')
     - Valid position with x and y coordinates
     - Valid dimensions (if applicable)
     - Rotation is optional

## Endpoints

### Get All Venues

Retrieves all venues in the system.

```
GET /api/venues
```

#### Response

```json
[
  {
    "id": 1,
    "name": "Concert Hall",
    "address": "123 Music Street",
    "capacity": 500,
    "description": "A premier concert venue",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
]
```

### Get Venue by ID

Retrieves a specific venue by its ID.

```
GET /api/venues/:id
```

#### Parameters
- `id`: The ID of the venue to retrieve

#### Response

```json
{
  "id": 1,
  "name": "Concert Hall",
  "address": "123 Music Street",
  "capacity": 500,
  "description": "A premier concert venue",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Create Venue

Creates a new venue.

```
POST /api/venues
```

#### Request Body

```json
{
  "name": "Concert Hall",
  "address": "123 Music Street",
  "capacity": 500,
  "description": "A premier concert venue",
  "map": {
    "dimensions": {
      "width": 50,
      "height": 30
    },
    "features": [
      {
        "type": "stage",
        "position": { "x": 25, "y": 5 },
        "dimensions": { "width": 10, "height": 5 },
        "rotation": 0
      }
    ]
  }
}
```

Required fields:
- `name`: Venue name
- `address`: Venue address
- `capacity`: Venue capacity

Optional fields:
- `description`: Venue description
- `map`: Venue map configuration

#### Response

```json
{
  "id": 1,
  "name": "Concert Hall",
  "address": "123 Music Street",
  "capacity": 500,
  "description": "A premier concert venue",
  "map": {
    "dimensions": {
      "width": 50,
      "height": 30
    },
    "features": [
      {
        "type": "stage",
        "position": { "x": 25, "y": 5 },
        "dimensions": { "width": 10, "height": 5 },
        "rotation": 0
      }
    ]
  },
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### Update Venue

Updates an existing venue.

```
PUT /api/venues/:id
```

#### Parameters
- `id`: The ID of the venue to update

#### Request Body

```json
{
  "name": "Updated Concert Hall",
  "capacity": 600,
  "map": {
    "dimensions": { "width": 60, "height": 40 },
    "features": [
      {
        "type": "stage",
        "position": { "x": 30, "y": 10 },
        "dimensions": { "width": 15, "height": 8 }
      }
    ]
  }
}
```

All fields are optional. Only specified fields will be updated.

#### Response

```json
{
  "id": 1,
  "name": "Updated Concert Hall",
  "address": "123 Music Street",
  "capacity": 600,
  "description": "A premier concert venue",
  "map": {
    "dimensions": { "width": 60, "height": 40 },
    "features": [
      {
        "type": "stage",
        "position": { "x": 30, "y": 10 },
        "dimensions": { "width": 15, "height": 8 }
      }
    ]
  },
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Delete Venue

Deletes a venue.

```
DELETE /api/venues/:id
```

#### Parameters
- `id`: The ID of the venue to delete

#### Response

Returns status code `204` with no content on success.

## Error Responses

### Not Found (404)
```json
{
  "message": "Venue not found"
}
```

### Bad Request (400)
```json
{
  "message": "Name, address, and capacity are required"
}
```

For map validation errors:
```json
{
  "message": "Map dimensions must include width and height"
}
```
```json
{
  "message": "Each feature must have a valid type and position"
}
```

### Server Error (500)
```json
{
  "message": "Something went wrong!"
}
```

## Example Usage with cURL

### Get All Venues
```bash
curl http://localhost:3000/api/venues
```

### Get Venue by ID
```bash
curl http://localhost:3000/api/venues/1
```

### Create Venue
```bash
curl -X POST http://localhost:3000/api/venues \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Concert Hall",
    "address": "123 Music Street",
    "capacity": 500,
    "description": "A premier concert venue"
  }'
```

### Update Venue
```bash
curl -X PUT http://localhost:3000/api/venues/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Concert Hall",
    "capacity": 600
  }'
```

### Delete Venue
```bash
curl -X DELETE http://localhost:3000/api/venues/1
``` 
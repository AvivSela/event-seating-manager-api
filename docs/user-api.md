# User API Documentation

This document describes the User API endpoints and their usage.

## API Structure

The User API is organized around the `/api/users` resource, providing standard CRUD operations for managing users.

## User Model

A user has the following properties:
- `id`: Unique identifier (number)
- `name`: User's full name (string)
- `email`: User's email address (string)
- `createdAt`: Timestamp of user creation (ISO date string)
- `updatedAt`: Timestamp of last update (ISO date string, optional)

## Endpoints

### Get All Users

Retrieves all users in the system.

```
GET /api/users
```

#### Response

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
]
```

### Get User by ID

Retrieves a specific user by their ID.

```
GET /api/users/:id
```

#### Parameters
- `id`: The ID of the user to retrieve

#### Response

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Create User

Creates a new user.

```
POST /api/users
```

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

Required fields:
- `name`: User's full name
- `email`: User's email address

#### Response

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### Update User

Updates an existing user.

```
PUT /api/users/:id
```

#### Parameters
- `id`: The ID of the user to update

#### Request Body

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

All fields are optional. Only specified fields will be updated.

#### Response

```json
{
  "id": 1,
  "name": "John Updated",
  "email": "john.updated@example.com",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Delete User

Deletes a user.

```
DELETE /api/users/:id
```

#### Parameters
- `id`: The ID of the user to delete

#### Response

Returns status code `204` with no content on success.

## Related Resources

Users can have associated events. See the [Event API Documentation](./event-api.md) for details on:
- Getting a user's events: `GET /api/users/:userId/events`

## Error Responses

### Not Found (404)
```json
{
  "message": "User not found"
}
```

### Bad Request (400)
```json
{
  "message": "Name and email are required"
}
```

### Server Error (500)
```json
{
  "message": "Something went wrong!"
}
```

## Example Usage with cURL

### Get All Users
```bash
curl http://localhost:3000/api/users
```

### Get User by ID
```bash
curl http://localhost:3000/api/users/1
```

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }'
```

### Update User
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/1
``` 
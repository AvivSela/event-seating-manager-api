# API Examples

This document provides examples of how to interact with the API endpoints using cURL commands.

## Base URL

All examples assume the API is running locally on port 3000. Replace `http://localhost:3000` with your actual API URL if different.

## Users API

### Get All Users

```bash
curl http://localhost:3000/api/users \
  -H "Content-Type: application/json"
```

### Get User by ID

```bash
# Replace {id} with a valid UUID
curl http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json"
```

### Create New User

```bash
curl http://localhost:3000/api/users \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }'
```

### Update User

```bash
# Replace {id} with a valid UUID
curl http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }'

# Update single field
curl http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated"
  }'
```

### Delete User

```bash
# Replace {id} with a valid UUID
curl http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -X DELETE \
  -H "Content-Type: application/json"
```

## Example Workflow

Here's a complete workflow example:

1. Create a new user:
```bash
curl http://localhost:3000/api/users \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  }'

# Response will include a UUID for the new user
```

2. Get the created user (using the UUID from the create response):
```bash
curl http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json"
```

3. Update the user's email:
```bash
curl http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.updated@example.com"
  }'
```

4. Verify the update:
```bash
curl http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json"
```

5. Delete the user:
```bash
curl http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -X DELETE \
  -H "Content-Type: application/json"
```

6. Verify deletion (should return 404):
```bash
curl http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json"
```

## Expected Responses

### Success Responses

- GET /api/users
  ```json
  [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ]
  ```

- GET /api/users/{id}
  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
  ```

- POST /api/users
  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### Error Responses

- Not Found (404)
  ```json
  {
    "message": "User not found"
  }
  ```

- Bad Request (400) - Invalid UUID
  ```json
  {
    "message": "Invalid user ID format"
  }
  ```

- Bad Request (400) - Missing Fields
  ```json
  {
    "message": "Name and email are required"
  }
  ```

- Server Error (500)
  ```json
  {
    "message": "Something went wrong!"
  }
  ``` 
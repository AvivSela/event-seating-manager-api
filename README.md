# Event Seating API

A TypeScript-based REST API service for managing users, built with Express.js.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Development:
```bash
# Start development server with auto-reload
npm run dev

# Watch TypeScript files and rebuild on changes
npm run watch
```

3. Production:
```bash
# Build the TypeScript files
npm run build

# Start the production server
npm start
```

The server will start on port 3000 by default.

## API Documentation

For detailed API examples and usage with cURL commands, see [API Examples](docs/api-examples.md).

## API Endpoints

### Users

- **GET /api/users**
  - Get all users
  - Response: Array of user objects

- **GET /api/users/:id**
  - Get a specific user by ID (UUID format)
  - Response: Single user object
  - Error Responses:
    - 400: Invalid UUID format
    - 404: User not found

- **POST /api/users**
  - Create a new user
  - Body: `{ "name": "string", "email": "string" }`
  - Response: Created user object with UUID

- **PUT /api/users/:id**
  - Update a user
  - Body: `{ "name": "string", "email": "string" }`
  - Response: Updated user object
  - Error Responses:
    - 400: Invalid UUID format
    - 404: User not found

- **DELETE /api/users/:id**
  - Delete a user
  - Response: 204 No Content
  - Error Responses:
    - 400: Invalid UUID format
    - 404: User not found

## Types

### User

```typescript
interface User {
  id: string;         // UUID string
  name: string;       // User's full name
  email: string;      // User's email address
  createdAt: Date;    // Creation timestamp
  updatedAt?: Date;   // Last update timestamp (optional)
}
```

### DTOs (Data Transfer Objects)

```typescript
interface CreateUserDto {
  name: string;        // User's full name
  email: string;       // User's email address
}

interface UpdateUserDto {
  name?: string;       // User's full name (optional)
  email?: string;      // User's email address (optional)
}
```

## Project Structure

```
src/
  ├── index.ts           # Application entry point
  ├── routes/            # Route definitions
  │   └── userRoutes.ts
  ├── controllers/       # Route handlers
  │   └── userController.ts
  ├── utils/            # Utility functions
  │   └── uuid.ts       # UUID generation and validation
  └── types/            # Type definitions
      └── user.ts
```

## Development

The project uses TypeScript for better type safety and developer experience. Key features:

- Strong typing for all entities and DTOs
- Type-safe Express.js route handlers
- UUID-based entity IDs with validation
- Automatic compilation to JavaScript
- Development server with hot reload
- TypeScript configuration in `tsconfig.json`

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
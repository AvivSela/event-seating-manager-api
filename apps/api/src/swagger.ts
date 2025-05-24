import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Seating API',
      version: '1.0.0',
      description: 'API for managing event seating arrangements, venues, guests, and table assignments',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'email'],
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            type: { type: 'string', enum: ['WEDDING', 'CORPORATE', 'BIRTHDAY', 'OTHER'] },
            userId: { type: 'string', format: 'uuid' },
            venueId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'date', 'type', 'userId'],
        },
        Venue: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            address: { type: 'string' },
            capacity: { type: 'integer', minimum: 1 },
            features: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['PARKING', 'WIFI', 'CATERING', 'AUDIO_SYSTEM', 'STAGE'],
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'address', 'capacity'],
        },
        Guest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'DECLINED', 'MAYBE'],
            },
            eventId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'email', 'eventId'],
        },
        TableAssignment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tableId: { type: 'string', format: 'uuid' },
            guestId: { type: 'string', format: 'uuid' },
            eventId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['tableId', 'guestId', 'eventId'],
        },
        Error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'object' },
          },
          required: ['code', 'message'],
        },
      },
      securitySchemes: {
        // Add authentication schemes here when implemented
      },
    },
  },
  apis: [path.join(__dirname, 'routes', '*.ts')], // Path to the API routes
};

export const specs = swaggerJsdoc(options); 
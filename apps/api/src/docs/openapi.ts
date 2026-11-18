export const openapiDoc = {
  openapi: '3.0.3',
  info: {
    title: 'Aurum Drive API',
    version: '1.0.0',
    description:
      'REST API for Aurum Drive luxury automobile test-drive booking and management system.',
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'BAD_REQUEST' },
              message: { type: 'string', example: 'Validation failed' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
            required: ['code', 'message', 'details'],
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register customer account',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'fullName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Registered successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user & receive session cookies',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated successfully' },
          '401': { description: 'Invalid credentials or inactive user' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Rotate tokens using refresh cookie',
        tags: ['Auth'],
        responses: {
          '200': { description: 'Token rotated' },
          '401': { description: 'Invalid or revoked token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Logout and revoke refresh token',
        tags: ['Auth'],
        responses: {
          '200': { description: 'Logged out' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current user identity',
        tags: ['Auth'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '200': { description: 'Current user' },
          '401': { description: 'Unauthenticated' },
        },
      },
    },
    '/users/me': {
      get: {
        summary: 'Get user profile',
        tags: ['Users'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '200': { description: 'User profile details' },
        },
      },
      patch: {
        summary: 'Update own profile details',
        tags: ['Users'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Profile updated' },
        },
      },
    },
    '/users/me/change-password': {
      post: {
        summary: 'Change password & invalidate other sessions',
        tags: ['Users'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password changed' },
          '400': { description: 'Incorrect current password' },
        },
      },
    },
    '/dealerships': {
      get: {
        summary: 'List dealerships',
        tags: ['Dealerships'],
        parameters: [
          { name: 'includeInactive', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'List of dealerships' },
        },
      },
      post: {
        summary: 'Create dealership (Staff only)',
        tags: ['Dealerships'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '201': { description: 'Dealership created' },
          '403': { description: 'Staff role required' },
        },
      },
    },
    '/vehicles': {
      get: {
        summary: 'Browse and filter luxury vehicles',
        tags: ['Vehicles'],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'manufacturer', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'fuelType', in: 'query', schema: { type: 'string' } },
          { name: 'dealershipId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'Paginated vehicles list' },
        },
      },
      post: {
        summary: 'Create vehicle record (Staff only)',
        tags: ['Vehicles'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '201': { description: 'Vehicle created' },
        },
      },
    },
    '/vehicles/filters': {
      get: {
        summary: 'Get distinct filter values',
        tags: ['Vehicles'],
        responses: {
          '200': { description: 'Filter metadata' },
        },
      },
    },
    '/vehicles/{id}/slots': {
      get: {
        summary: 'Get future active slots with isBooked status',
        tags: ['Slots'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          '200': { description: 'Slot availability' },
        },
      },
    },
    '/bookings': {
      post: {
        summary: 'Create test-drive booking request',
        tags: ['Bookings'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['slotId'],
                properties: {
                  slotId: { type: 'string', format: 'uuid' },
                  customerNote: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Booking created' },
          '409': { description: 'Conflict: Slot already booked or customer overlap' },
        },
      },
    },
    '/bookings/mine': {
      get: {
        summary: 'View customer bookings by group',
        tags: ['Bookings'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'group',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['pending', 'upcoming', 'completed', 'cancelled', 'past', 'all'],
            },
          },
        ],
        responses: {
          '200': { description: 'Customer bookings' },
        },
      },
    },
    '/admin/bookings': {
      get: {
        summary: 'Filter and view all booking records (Staff only)',
        tags: ['Admin'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '200': { description: 'Bookings list' },
        },
      },
    },
    '/admin/dashboard/summary': {
      get: {
        summary: 'Admin KPI dashboard summary (Staff only)',
        tags: ['Admin'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '200': { description: 'Dashboard KPI metrics' },
        },
      },
    },
    '/notifications': {
      get: {
        summary: 'List user notifications',
        tags: ['Notifications'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '200': { description: 'Notifications' },
        },
      },
    },
  },
};


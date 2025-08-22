import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { adminGraphQL, storeGraphQL } from './graphql';
import { requireAdminAuth } from './middleware/auth';
import { apiResponse, getApiVersion } from './middleware/versioning';
import { apiV1 } from './v1';

// Main API router combining REST and GraphQL
export const api = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Metropolitan API',
        version: getApiVersion(),
        description: 'REST and GraphQL APIs for Metropolitan App'
      },
      tags: [
        { name: 'Store', description: 'Client-facing store operations' },
        { name: 'Admin', description: 'Administrative operations' }
      ]
    }
  }))
  .get('/health', requireAdminAuth, () => {
    return apiResponse({
      status: 'healthy',
      apis: {
        rest: `${process.env.API_PREFIX || '/api/v1'}`,
        graphql: {
          store: '/graphql/store',
          admin: '/graphql/admin'
        }
      }
    });
  })
  .use(apiV1)          // REST API v1
  .use(storeGraphQL)   // GraphQL Store
  .use(adminGraphQL);  // GraphQL Admin

import { Elysia } from 'elysia';
import { apiResponse } from '../../../middleware/versioning';

// Store API routes - client facing (bireysel + kurumsal)
export const storeRoutes = new Elysia({ prefix: '/store' })
  .get('/health', () => {
    return apiResponse({
      status: 'healthy',
      service: 'store-api',
      description: 'Store API for individual and corporate clients'
    });
  })
  .get('/ping', () => {
    return apiResponse({ pong: true, timestamp: Date.now() });
  });

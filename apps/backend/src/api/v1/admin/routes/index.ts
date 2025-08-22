import { Elysia } from 'elysia';
import { requireAdminAuth } from '../../../middleware/auth';
import { apiResponse } from '../../../middleware/versioning';

// Admin API routes - admin only
export const adminRoutes = new Elysia({ prefix: '/admin' })
  .get('/health', () => {
    return apiResponse({
      status: 'healthy',
      service: 'admin-api',
      description: 'Admin API for management operations'
    });
  })
  .get('/ping', requireAdminAuth, () => {
    return apiResponse({ pong: true, timestamp: Date.now() });
  });

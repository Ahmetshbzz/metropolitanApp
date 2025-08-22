import { Elysia } from 'elysia';
import { apiResponse, getApiPrefix } from '../middleware/versioning';
import { adminRoutes } from './admin/routes';
import { storeRoutes } from './store/routes';

// Main v1 API router
export const apiV1 = new Elysia({ prefix: getApiPrefix() })
  .get('/', () => {
    return apiResponse({
      message: 'Metropolitan API v1',
      endpoints: {
        store: `${getApiPrefix()}/store`,
        admin: `${getApiPrefix()}/admin`
      }
    });
  })
  .use(storeRoutes)
  .use(adminRoutes);

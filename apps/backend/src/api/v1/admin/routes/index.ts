import { Elysia } from 'elysia';
import { requireAdminAuth } from '../../../middleware/auth';
import { keyManager } from '../../../middleware/keys';
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
  })

  // API Key Management - Admin Only
  .post('/keys/generate', requireAdminAuth, async ({ body }: any) => {
    const { name, clientType } = body;

    if (!name || !clientType) {
      return apiResponse(
        { error: 'name and clientType are required' },
        { status: 400 }
      );
    }

    if (!['individual', 'corporate'].includes(clientType)) {
      return apiResponse(
        { error: 'clientType must be individual or corporate' },
        { status: 400 }
      );
    }

    const newKey = keyManager.generatePublicKey(name, clientType);

    return apiResponse({
      message: 'API key generated successfully',
      key: {
        id: newKey.id,
        key: newKey.key,
        name: newKey.name,
        clientType: newKey.clientType,
        createdAt: newKey.createdAt,
        rateLimitPerMinute: newKey.rateLimitPerMinute
      }
    });
  })

  .get('/keys/list', requireAdminAuth, () => {
    const keys = keyManager.listKeys();
    return apiResponse({
      total: keys.length,
      keys: keys.map(k => ({
        id: k.id,
        name: k.name,
        clientType: k.clientType,
        createdAt: k.createdAt,
        isActive: k.isActive,
        rateLimitPerMinute: k.rateLimitPerMinute,
        keyPreview: `${k.key.slice(0, 20)}...` // Security: sadece preview
      }))
    });
  })

  .delete('/keys/:keyId/revoke', requireAdminAuth, ({ params }: any) => {
    const keys = keyManager.listKeys();
    const targetKey = keys.find(k => k.id === params.keyId);

    if (!targetKey) {
      return apiResponse(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    const revoked = keyManager.revokeKey(targetKey.key);

    return apiResponse({
      message: revoked ? 'API key revoked successfully' : 'Failed to revoke key',
      keyId: params.keyId
    });
  });

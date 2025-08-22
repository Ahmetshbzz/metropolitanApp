import type { Context } from 'elysia';
import { validateAdminSecret, keyManager, type PublicApiKey } from './keys';

export enum UserType {
  INDIVIDUAL = 'individual',
  CORPORATE = 'corporate', 
  ADMIN = 'admin'
}

export interface AuthUser {
  id: string;
  type: UserType;
  email: string;
  permissions?: string[];
  apiKey?: PublicApiKey;
}

// Enhanced auth middleware with secret key and public key support
export const authMiddleware = (allowedTypes: UserType[]) => {
  return async (ctx: Context) => {
    const authHeader = ctx.headers.authorization;
    
    if (!authHeader) {
      ctx.set.status = 401;
      return { error: 'Authentication required' };
    }

    const token = authHeader.replace('Bearer ', '').replace('ApiKey ', '');

    // Check if it's admin secret key
    if (validateAdminSecret(token)) {
      const adminUser: AuthUser = {
        id: 'admin_root',
        type: UserType.ADMIN,
        email: 'admin@metropolitan.com',
        permissions: ['*']
      };

      if (!allowedTypes.includes(UserType.ADMIN)) {
        ctx.set.status = 403;
        return { error: 'Insufficient permissions' };
      }

      (ctx as any).user = adminUser;
      return;
    }

    // Check if it's a public API key
    const publicKey = keyManager.validatePublicKey(token);
    if (publicKey) {
      const userType = publicKey.clientType === 'individual' ? UserType.INDIVIDUAL : UserType.CORPORATE;
      
      const clientUser: AuthUser = {
        id: `client_${publicKey.id}`,
        type: userType,
        email: `client@${publicKey.name}.com`,
        apiKey: publicKey
      };

      if (!allowedTypes.includes(userType)) {
        ctx.set.status = 403;
        return { error: 'Insufficient permissions for this client type' };
      }

      (ctx as any).user = clientUser;
      return;
    }

    // Invalid token
    ctx.set.status = 401;
    return { error: 'Invalid API key or token' };
  };
};

// Helper functions
export const requireStoreAuth = authMiddleware([UserType.INDIVIDUAL, UserType.CORPORATE]);
export const requireAdminAuth = authMiddleware([UserType.ADMIN]);

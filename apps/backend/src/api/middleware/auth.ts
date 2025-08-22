import type { Context } from 'elysia';

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
}

// Basit auth middleware - JWT implementation sonra eklenecek
export const authMiddleware = (allowedTypes: UserType[]) => {
  return async (ctx: Context) => {
    // Şimdilik basit header check - sonra JWT decode edilecek
    const authHeader = ctx.headers.authorization;

    if (!authHeader) {
      ctx.set.status = 401;
      return { error: 'Authentication required' };
    }

    // Mock user - gerçek JWT decode sonra gelecek
    const mockUser: AuthUser = {
      id: 'user_123',
      type: UserType.INDIVIDUAL, // Token'dan parse edilecek
      email: 'test@example.com'
    };

    // Type check
    if (!allowedTypes.includes(mockUser.type)) {
      ctx.set.status = 403;
      return { error: 'Insufficient permissions' };
    }

    // User'ı context'e ekle
    (ctx as any).user = mockUser;
  };
};

// Helper functions
export const requireStoreAuth = authMiddleware([UserType.INDIVIDUAL, UserType.CORPORATE]);
export const requireAdminAuth = authMiddleware([UserType.ADMIN]);

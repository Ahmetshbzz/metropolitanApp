// Simple in-memory key store - production'da Redis/DB olacak
export interface PublicApiKey {
  id: string;
  key: string;
  name: string;
  clientType: 'individual' | 'corporate';
  createdAt: string;
  isActive: boolean;
  rateLimitPerMinute?: number;
}

class KeyManager {
  private keys: Map<string, PublicApiKey> = new Map();

  generatePublicKey(name: string, clientType: 'individual' | 'corporate'): PublicApiKey {
    const keyId = this.generateId();
    const apiKey = `pk_${clientType}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const publicKey: PublicApiKey = {
      id: keyId,
      key: apiKey,
      name,
      clientType,
      createdAt: new Date().toISOString(),
      isActive: true,
      rateLimitPerMinute: clientType === 'corporate' ? 1000 : 100
    };

    this.keys.set(apiKey, publicKey);
    console.log(`🔑 Public API key generated: ${name} (${clientType})`);
    
    return publicKey;
  }

  validatePublicKey(key: string): PublicApiKey | null {
    const apiKey = this.keys.get(key);
    return apiKey?.isActive ? apiKey : null;
  }

  revokeKey(key: string): boolean {
    const apiKey = this.keys.get(key);
    if (apiKey) {
      apiKey.isActive = false;
      console.log(`🚫 API key revoked: ${apiKey.name}`);
      return true;
    }
    return false;
  }

  listKeys(): PublicApiKey[] {
    return Array.from(this.keys.values());
  }

  private generateId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

export const keyManager = new KeyManager();

// Admin secret key validation
export const validateAdminSecret = (providedKey: string): boolean => {
  const adminSecret = process.env.ADMIN_API_SECRET_KEY;
  if (!adminSecret) {
    console.error('❌ ADMIN_API_SECRET_KEY not configured');
    return false;
  }
  return providedKey === adminSecret;
};

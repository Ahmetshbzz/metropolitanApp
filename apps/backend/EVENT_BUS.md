# Event Bus Kullanım Rehberi - Modüler Yapı

Bu sistem production-ready, enterprise-grade modüler event bus implementasyonudur. Redis tabanlı, in-memory mode kaldırılmıştır.

## Modüler Mimari

### Core Modüller
- **EventPublisher**: Event yayınlama logic'i
- **EventSubscriber**: Subscription ve handler yönetimi
- **RedisTransport**: Redis streams ve broadcast transport
- **EventDispatcher**: Event dispatch ve middleware orchestration
- **HealthMonitor**: Kapsamlı sağlık izleme ve monitoring
- **EventValidator**: Event schema validation ve type safety

### Desteklenen Modlar
- **redis-broadcast**: Pub/Sub based. Ephemeral events, at-most-once delivery
- **redis-streams**: Persistent queue, consumer groups, at-least-once delivery, DLQ support
- **hybrid (önerilen)**: Her ikisi aktif. `durability` ile otomatik yönlendirme

## ENV
`.env.example` dosyasındaki değerleri `.env` olarak kopyalayın/güncelleyin.

**ZORUNLU Değişkenler:**
```bash
EVENT_BUS_MODE=hybrid          # redis-broadcast | redis-streams | hybrid
SERVICE_NAME=backend           # Servis tanımlayıcısı
REDIS_URL=redis://localhost:6379   # Redis bağlantı URL'i
```

⚠️ **Önemli**: `REDIS_URL` olmadan sistem başlamaz!

## API Kullanımı

### Temel Kullanım
```ts
import { eventBus, publishPersistent, publishEphemeral } from '@/event-bus';
```

### 1. Event Publishing

**Kalıcı Events** (Redis Streams - önerilen):
```ts
// Otomatik schema validation ile
await publishPersistent('order.created', {
  orderId: 'ord_123',
  userId: 'user_456',
  total: 99.99
});

// Correlation tracking ile
await publishPersistent('payment.processed', paymentData, {
  correlationId: 'trace_789',
  causationId: orderEvent.meta.id
});
```

**Geçici Events** (Redis Pub/Sub):
```ts
await publishEphemeral('cache.invalidate', { key: 'products' });
await publishEphemeral('notification.send', {
  userId: 'user_123',
  type: 'info',
  message: 'Welcome!'
});
```

### 2. Event Subscription

**Production-ready subscription:**
```ts
eventBus.subscribe('order.created', async ({ payload, meta }) => {
  // Business logic - tip güvenli payload
  const { orderId, userId, total } = payload;
  await processNewOrder(orderId, userId, total);
}, {
  group: 'billing-service',          // Consumer group
  concurrency: 3,                   // Parallel processing limit
  retry: {
    attempts: 5,                    // Total retry attempts
    backoffMs: (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000), // Exponential backoff
    deadLetter: async (evt, err) => {
      console.error('💀 Dead letter - billing failed:', {
        eventId: evt.meta.id,
        error: err
      });
      await notifyAdmins('Billing pipeline failure', err);
    }
  }
});
```

### 3. Event Schema Validation

**Built-in validation:**
```ts
// Schemas otomatik register edilir startup'ta
// Yanlış payload ile publish edilirse hata fırlatır
await publishPersistent('auth.user.registered', {
  userId: 'user_123'
}); // ✅ Valid

await publishPersistent('auth.user.registered', {
  id: 'user_123' // ❌ Invalid - userId expected
}); // Throws validation error
```

### 4. Monitoring & Health

**Health check:**
```ts
import { eventBus } from '@/event-bus';

// Basic health
const health = eventBus.health();
console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'

// Detailed health
const detailed = eventBus.detailedHealth();
console.log(detailed.redis.connected);
console.log(detailed.handlers.totalEvents);

// Simple ping
const isAlive = await eventBus.ping();
```

**Dead Letter Queue Management:**
```ts
// DLQ inspection
const dlqMessages = await eventBus.inspectDeadLetterQueue('order.created');

// DLQ cleanup
await eventBus.clearDeadLetterQueue('order.created');
```

## Production Deployment

### ENV Konfigürasyonu
```bash
# Production settings
EVENT_BUS_MODE=hybrid
SERVICE_NAME=backend-prod
REDIS_URL=redis://prod-redis:6379

# Multi-instance deployment
INSTANCE_ID=backend-01  # Her instance için unique
```

### Redis Setup
```bash
# DLQ monitoring
redis-cli XINFO STREAM events:dlq:order.created
redis-cli XREAD COUNT 10 STREAMS events:dlq:order.created 0-0

# Stream monitoring
redis-cli XINFO GROUPS events:order.created
redis-cli XPENDING events:order.created billing-service
```

## 10 Modül için Hazır Event Schemas

Sistem şu modüller için event schemas ile birlikte gelir:
- **Auth**: user.registered, user.login, user.logout
- **Product**: product.created, product.updated
- **Order**: order.created
- **Notification**: notification.send
- **Cache**: cache.invalidate, cache.clear
- **Payment**: payment.processed
- **Inventory**: inventory.updated
- **Analytics**: analytics.track

Yeni modül eklerken sadece schemas/index.ts'e yeni schema ekleyin.

## Error Handling & Resilience

- **Automatic retries** with exponential backoff
- **Circuit breaker** pattern via concurrency control
- **Dead letter queue** for failed messages
- **Graceful degradation** when Redis unavailable
- **Comprehensive logging** with correlation IDs
- **Health monitoring** with status indicators

## Performance Features

- **Consumer groups** for horizontal scaling
- **Concurrency control** per event type
- **Batching** for stream processing (10 messages/batch)
- **Connection pooling** via Redis client
- **Non-blocking** architecture

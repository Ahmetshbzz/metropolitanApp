import type { BusMode } from '../types';
import type { EventSubscriber } from './subscriber';
import type { RedisTransport } from './transport';
import type { EventDispatcher } from './dispatcher';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  mode: BusMode;
  serviceName: string;
  started: boolean;
  uptime: number;
  redis: {
    connected: boolean;
    subscriberConnected: boolean;
    activeStreamLoops: number;
  };
  handlers: {
    totalEvents: number;
    totalHandlers: number;
    eventDetails: Array<{
      eventName: string;
      handlerCount: number;
      groups: string[];
    }>;
  };
  middleware: {
    count: number;
  };
  errors: string[];
}

export class HealthMonitor {
  private startTime: number;
  private errors: string[] = [];

  constructor(
    private mode: BusMode,
    private serviceName: string,
    private transport: RedisTransport,
    private subscriber: EventSubscriber,
    private dispatcher: EventDispatcher
  ) {
    this.startTime = Date.now();
  }

  recordError(error: string): void {
    this.errors.push(`${new Date().toISOString()}: ${error}`);
    // Keep only last 10 errors to prevent memory leak
    if (this.errors.length > 10) {
      this.errors = this.errors.slice(-10);
    }
  }

  clearErrors(): void {
    this.errors = [];
  }

  getHealth(started: boolean): HealthStatus {
    const transportHealth = this.transport.getHealth();
    const dispatchStats = this.dispatcher.getDispatchStats();
    const handlerStats = this.subscriber.getHandlerStats();

    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Determine overall health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!started || !transportHealth.redisConnected) {
      status = 'unhealthy';
    } else if (this.errors.length > 5 || !transportHealth.subscriberConnected) {
      status = 'degraded';
    }

    return {
      status,
      mode: this.mode,
      serviceName: this.serviceName,
      started,
      uptime,
      redis: {
        connected: transportHealth.redisConnected,
        subscriberConnected: transportHealth.subscriberConnected,
        activeStreamLoops: transportHealth.activeStreamLoops,
      },
      handlers: {
        totalEvents: dispatchStats.registeredEvents,
        totalHandlers: handlerStats.reduce((sum, stat) => sum + stat.handlerCount, 0),
        eventDetails: handlerStats,
      },
      middleware: {
        count: dispatchStats.middlewareCount,
      },
      errors: [...this.errors], // Return copy to prevent external mutation
    };
  }

  getDetailedHealth(started: boolean) {
    const basicHealth = this.getHealth(started);
    const transportHealth = this.transport.getHealth();
    
    return {
      ...basicHealth,
      transport: transportHealth,
      groups: Object.fromEntries(this.subscriber.getAllGroups()),
      performance: {
        uptime: basicHealth.uptime,
        errorRate: this.errors.length,
      }
    };
  }

  async ping(): Promise<boolean> {
    try {
      const transportHealth = this.transport.getHealth();
      return transportHealth.redisConnected;
    } catch {
      return false;
    }
  }
}

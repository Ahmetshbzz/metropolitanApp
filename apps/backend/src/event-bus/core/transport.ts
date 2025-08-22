import { ensureStreamGroup, ensureStreamLoop } from '../streams';
import type { BusMode, EventEnvelope } from '../types';

export interface TransportConfig {
  mode: BusMode;
  serviceName: string;
  redis: any;
}

export class RedisTransport {
  private redisPub: any;
  private redisSub: any | null = null;
  private streamLoops: Map<string, boolean> = new Map();
  private started = false;

  constructor(private config: TransportConfig) {
    this.redisPub = config.redis;
  }

  async start(
    onBroadcastMessage: (envelope: EventEnvelope) => Promise<void>,
    dispatch: (envelope: EventEnvelope, group?: string) => Promise<void>,
    getAllGroups: () => Map<string, string[]>
  ): Promise<void> {
    if (this.started) return;

    try {
      await this.startBroadcastListener(onBroadcastMessage);
      await this.startStreamConsumers(dispatch, getAllGroups);
      this.started = true;
      console.log(`🚀 RedisTransport started in ${this.config.mode} mode`);
    } catch (error) {
      console.error('❌ Failed to start RedisTransport:', error);
      throw new Error(`Transport initialization failed: ${error}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.started) return;

    const cleanup = async () => {
      // Stop broadcast listener
      if (this.redisSub) {
        try {
          await this.redisSub.pUnsubscribe('events:*');
          await this.redisSub.disconnect();
        } catch (err) {
          console.warn('Warning during broadcast cleanup:', err);
        }
        this.redisSub = null;
      }

      // Stop stream loops
      this.streamLoops.clear();
    };

    try {
      await cleanup();
      this.started = false;
      console.log('🛑 RedisTransport stopped');
    } catch (error) {
      console.error('❌ Error during transport shutdown:', error);
      throw error;
    }
  }

  private async startBroadcastListener(onMessage: (envelope: EventEnvelope) => Promise<void>): Promise<void> {
    if (!this.isBroadcastEnabled()) return;

    this.redisSub = this.redisPub.duplicate();
    await this.redisSub.connect();

    await this.redisSub.pSubscribe('events:*', async (message: string, channel: string) => {
      try {
        const envelope: EventEnvelope = JSON.parse(message);

        // Avoid self-processing duplicate if already dispatched locally
        if (envelope.meta.source === this.config.serviceName) return;

        // Validate channel matches event name
        const name = channel.replace('events:', '');
        if (name === envelope.name) {
          await onMessage(envelope);
        }
      } catch (err) {
        console.error('🚨 Broadcast message parse/dispatch error:', { channel, error: err });
      }
    });

    console.log('📡 Broadcast listener started');
  }

  private async startStreamConsumers(
    dispatch: (envelope: EventEnvelope, group?: string) => Promise<void>,
    getAllGroups: () => Map<string, string[]>
  ): Promise<void> {
    if (!this.isStreamsEnabled()) return;

    const eventGroups = getAllGroups();

    for (const [name, groups] of eventGroups.entries()) {
      for (const group of groups) {
        try {
          await ensureStreamGroup(this.redisPub, name, group);
          this.ensureStreamLoop(name, group, dispatch);
        } catch (error) {
          console.error(`❌ Failed to setup stream consumer for ${name}:${group}:`, error);
          throw error;
        }
      }
    }

    console.log('🌀 Stream consumers started');
  }

  ensureStreamLoop(
    name: string,
    group: string,
    dispatch: (envelope: EventEnvelope, group?: string) => Promise<void>
  ): void {
    // Ensure stream group exists before starting loop
    ensureStreamGroup(this.redisPub, name, group)
      .then(() => {
        ensureStreamLoop({
          name,
          group,
          serviceName: this.config.serviceName,
          redis: this.redisPub,
          dispatch,
          getActive: () => this.started,
          getMode: () => this.config.mode,
          streamLoops: this.streamLoops,
        });
      })
      .catch(error => {
        console.error(`❌ Failed to ensure stream group for ${name}:${group}:`, error);
      });
  }

  private isBroadcastEnabled(): boolean {
    return this.config.mode === 'redis-broadcast' || this.config.mode === 'hybrid';
  }

  private isStreamsEnabled(): boolean {
    return this.config.mode === 'redis-streams' || this.config.mode === 'hybrid';
  }

  getHealth() {
    return {
      started: this.started,
      broadcastEnabled: this.isBroadcastEnabled(),
      streamsEnabled: this.isStreamsEnabled(),
      activeStreamLoops: this.streamLoops.size,
      redisConnected: !!this.redisPub,
      subscriberConnected: !!this.redisSub,
    };
  }
}

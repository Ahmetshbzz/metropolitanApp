import type { EventEnvelope, BusMode } from './types';
import { nowIso } from './types';

export const streamKey = (name: string) => `events:${name}`;
export const dlqKey = (name: string) => `events:dlq:${name}`;

export async function ensureStreamGroup(redis: any, name: string, group: string): Promise<void> {
  const key = streamKey(name);
  try {
    await redis.xGroupCreate(key, group, '$', { MKSTREAM: true });
    console.debug(`✅ Stream group created: ${key}:${group}`);
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    if (msg.includes('BUSYGROUP')) {
      // Group already exists, this is expected
      console.debug(`ℹ️  Stream group already exists: ${key}:${group}`);
    } else {
      console.error(`❌ Failed to create stream group ${key}:${group}:`, err);
      throw new Error(`Stream group creation failed for ${key}:${group}: ${msg}`);
    }
  }
}

export function ensureStreamLoop(opts: {
  name: string;
  group: string;
  serviceName: string;
  redis: any;
  dispatch: (env: EventEnvelope, group: string) => Promise<void>;
  getActive: () => boolean; // returns bus.started
  getMode: () => BusMode;
  streamLoops: Map<string, boolean>;
}) {
  const { name, group, serviceName, redis, dispatch, getActive, getMode, streamLoops } = opts;
  const loopKey = `${name}::${group}`;
  if (streamLoops.get(loopKey)) return;
  streamLoops.set(loopKey, true);
  const key = streamKey(name);
  const consumer = `${serviceName}-${process.pid}-${Math.random().toString(16).slice(2)}`;
  const run = async () => {
    console.log(`🌀 Starting stream loop for ${name}:${group} with consumer ${consumer}`);
    
    while (getActive() && (getMode() === 'redis-streams' || getMode() === 'hybrid')) {
      if (!streamLoops.get(loopKey)) {
        console.log(`🛑 Stream loop stopped for ${name}:${group}`);
        break;
      }
      
      try {
        const res = await redis.xReadGroup(group, consumer, [{ key, id: '>' }], { COUNT: 10, BLOCK: 2000 });
        
        if (!res || res.length === 0) continue;
        
        for (const stream of res) {
          if (!stream.messages || stream.messages.length === 0) continue;
          
          for (const msg of stream.messages) {
            const messageId = msg.id;
            
            try {
              // Parse message envelope
              const envStr = msg.message?.envelope ?? msg.message?.data ?? JSON.stringify(msg.message);
              if (!envStr) {
                throw new Error('Empty message envelope');
              }
              
              const envelope: EventEnvelope = typeof envStr === 'string' ? JSON.parse(envStr) : envStr;
              
              // Validate envelope structure
              if (!envelope.name || !envelope.meta) {
                throw new Error('Invalid envelope structure');
              }
              
              // Dispatch and acknowledge
              await dispatch(envelope, group);
              await redis.xAck(key, group, messageId);
              
              console.debug(`✅ Processed stream message: ${name}:${group}:${messageId}`);
              
            } catch (err) {
              console.error(`❌ Stream message processing failed for ${name}:${group}:${messageId}:`, err);
              
              try {
                // Move to dead letter queue with detailed error info
                await redis.xAdd(dlqKey(name), '*', {
                  envelope: JSON.stringify({
                    error: err instanceof Error ? err.message : String(err),
                    stack: err instanceof Error ? err.stack : undefined,
                    timestamp: nowIso(),
                    event: name,
                    group,
                    consumer,
                    originalId: messageId,
                    originalMessage: msg.message
                  })
                });
                console.log(`💀 Message moved to DLQ: ${dlqKey(name)}`);
              } catch (dlqErr) {
                console.error(`❌ Failed to move message to DLQ:`, dlqErr);
              }
              
              // Always acknowledge to prevent reprocessing
              try { 
                await redis.xAck(key, group, messageId); 
                console.debug(`✅ Acknowledged failed message: ${messageId}`);
              } catch (ackErr) {
                console.error(`❌ Failed to acknowledge message ${messageId}:`, ackErr);
              }
            }
          }
        }
      } catch (streamErr) {
        console.error(`❌ Stream read error for ${name}:${group}:`, streamErr);
        // Back off on connection errors
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`🏁 Stream loop ended for ${name}:${group}`);
  };
  void run();
}

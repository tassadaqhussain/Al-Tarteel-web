import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private client: Redis | null = null;

  private getClient(): Redis | null {
    if (this.client) return this.client;
    const url = process.env.REDIS_URL;
    if (!url) return null;
    try {
      this.client = new Redis(url, { maxRetriesPerRequest: 2 });
      return this.client;
    } catch {
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    const redis = this.getClient();
    if (!redis) return null;
    try {
      return await redis.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const redis = this.getClient();
    if (!redis) return;
    try {
      if (ttlSeconds) await redis.setex(key, ttlSeconds, value);
      else await redis.set(key, value);
    } catch {
      // ignore
    }
  }

  async del(key: string): Promise<void> {
    const redis = this.getClient();
    if (!redis) return;
    try {
      await redis.del(key);
    } catch {
      // ignore
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
  }
}

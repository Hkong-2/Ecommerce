import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || '127.0.0.1';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;
    
    this.client = new Redis({
      host,
      port,
      password: this.configService.get<string>('REDIS_PASSWORD'), // Hỗ trợ thêm mật khẩu nếu có
      enableOfflineQueue: false, // Quan trọng: Không chờ đợi kết nối Redis nếu nó đang sập
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        // Chỉ thử lại tối đa 3 lần nếu không phải môi trường local
        if (times > 3 && host !== '127.0.0.1') return null;
        return Math.min(times * 50, 2000);
      }
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  onModuleDestroy() {
    this.client.quit();
  }

  // --- Caching Methods ---
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (this.client.status !== 'ready') return; // Skip if not connected
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (e) {
      console.warn(`Redis set error for ${key}:`, e);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.client.status !== 'ready') return null; // Skip if not connected
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`Redis get error for ${key}:`, e);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
  
  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // --- Distributed Lock (Simple SETNX) cho Race Condition ---
  async acquireLock(key: string, ttlSeconds: number = 5): Promise<boolean> {
    // PX is for milliseconds
    const result = await this.client.set(key, 'LOCKED', 'PX', ttlSeconds * 1000, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.client.del(key);
  }
}

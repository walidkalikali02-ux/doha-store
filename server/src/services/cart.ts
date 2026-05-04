import { createClient, SupabaseClient } from '@supabase/supabase-js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const CART_TTL_SECONDS = 7 * 24 * 60 * 60;

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
}

interface CartSession {
  items: CartItem[];
  discountCode: string | null;
  createdAt: string;
  updatedAt: string;
}

class RedisClient {
  private client: any = null;
  private fallbackMode = false;

  async connect(): Promise<void> {
    try {
      const { createClient } = await import('redis');
      this.client = createClient({ url: redisUrl });
      this.client.on('error', (err: Error) => {
        console.warn('Redis client error, falling back to localStorage:', err.message);
        this.fallbackMode = true;
      });
      await this.client.connect();
      this.fallbackMode = false;
    } catch {
      this.fallbackMode = true;
      console.warn('Redis unavailable, using localStorage fallback for cart sessions');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.fallbackMode || !this.client) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.fallbackMode || !this.client) return;
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      this.fallbackMode = true;
    }
  }

  async del(key: string): Promise<void> {
    if (this.fallbackMode || !this.client) return;
    try {
      await this.client.del(key);
    } catch {
    }
  }

  isFallbackMode(): boolean {
    return this.fallbackMode;
  }
}

let redisClient: RedisClient | null = null;

async function getRedisClient(): Promise<RedisClient> {
  if (!redisClient) {
    redisClient = new RedisClient();
    await redisClient.connect();
  }
  return redisClient;
}

function cartKey(sessionId: string): string {
  return `cart:${sessionId}`;
}

export interface CartSessionData {
  sessionId: string;
  items: CartItem[];
  discountCode: string | null;
  isRedis: boolean;
}

export async function getCart(sessionId: string): Promise<CartSessionData | null> {
  const redis = await getRedisClient();
  const key = cartKey(sessionId);

  const stored = await redis.get(key);
  if (stored) {
    try {
      const parsed: CartSession = JSON.parse(stored);
      return {
        sessionId,
        items: parsed.items || [],
        discountCode: parsed.discountCode || null,
        isRedis: !redis.isFallbackMode(),
      };
    } catch {
      return null;
    }
  }

  return null;
}

export async function setCart(
  sessionId: string,
  items: CartItem[],
  discountCode: string | null
): Promise<void> {
  const redis = await getRedisClient();
  const key = cartKey(sessionId);

  const session: CartSession = {
    items,
    discountCode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.set(key, JSON.stringify(session), CART_TTL_SECONDS);
}

export async function clearCart(sessionId: string): Promise<void> {
  const redis = await getRedisClient();
  const key = cartKey(sessionId);
  await redis.del(key);
}

export async function getOrCreateSessionId(request: Request): Promise<string> {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  if (cookies['cart_session_id']) {
    return cookies['cart_session_id'];
  }

  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return sessionId;
}

export async function createCartSession(items: CartItem[]): Promise<string> {
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await setCart(sessionId, items, null);
  return sessionId;
}

export default {
  getCart,
  setCart,
  clearCart,
  getOrCreateSessionId,
  createCartSession,
};

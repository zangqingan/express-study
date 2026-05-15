import Redis from 'ioredis'
import { config } from './index.js'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null
        return Math.min(times * 200, 2000)
      },
    })

    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message)
    })
  }
  return redis
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis()
    const val = await r.get(key)
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttl = 3600): Promise<void> {
  try {
    const r = getRedis()
    await r.set(key, JSON.stringify(value), 'EX', ttl)
  } catch {
    // cache failure is non-fatal
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const r = getRedis()
    await r.del(key)
  } catch {
    // cache failure is non-fatal
  }
}

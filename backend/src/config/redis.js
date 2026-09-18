const Redis = require('ioredis');

/**
 * Redis is used purely as a cache (swipe feed lookups). It should never be a
 * hard dependency for correctness, so every call site treats a Redis outage
 * as a cache miss rather than an error. If REDIS_URL is unreachable we log
 * once and keep serving requests straight from MongoDB.
 */
let client = null;
let hasWarned = false;

function getRedis() {
  if (client) return client;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  client = new Redis(url, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => (times > 3 ? null : 200),
    lazyConnect: true,
  });

  client.on('error', (err) => {
    if (!hasWarned) {
      console.warn(`[redis] unavailable, falling back to DB-only mode: ${err.message}`);
      hasWarned = true;
    }
  });

  client.connect().catch(() => {
    /* swallow - handled by the 'error' listener above */
  });

  return client;
}

async function cacheGet(key) {
  try {
    const raw = await getRedis().get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 300) {
  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    /* cache is best-effort */
  }
}

async function cacheDel(key) {
  try {
    await getRedis().del(key);
  } catch {
    /* cache is best-effort */
  }
}

module.exports = { getRedis, cacheGet, cacheSet, cacheDel };

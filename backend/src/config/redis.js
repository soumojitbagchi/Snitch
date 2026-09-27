import { createClient } from "redis";
import { config } from "./config.js";

// Managed Redis (Render/Upstash) provides a single REDIS_URL like
// rediss://user:pass@host:port (TLS is auto-enabled for rediss://).
// Self-hosted setups use the split HOST/PORT/USER/PASSWORD vars instead.
const redisClient = config.REDIS_URL
  ? createClient({
      url: config.REDIS_URL,
      socket: {
        // Reconnect with backoff instead of hammering a downed instance.
        reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
      },
    })
  : createClient({
      username: config.REDIS_USER,
      password: config.REDIS_PASSWORD,
      socket: {
        host: config.REDIS_HOST,
        port: Number(config.REDIS_PORT),
        reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
      },
    });

redisClient.on("error", (err) => {
  console.error("Redis error:", err?.message || err);
});

// Fail-soft: cache calls already degrade to Mongo when Redis is down
// (see service/cache.service.js), so a Redis outage must not crash the API.
const connectToRedis = async () => {
  if (redisClient.isReady) return redisClient;
  try {
    await redisClient.connect();
    console.log("connected to redis");
  } catch (error) {
    console.warn(
      "Redis unavailable, continuing without cache:",
      error?.message || error,
    );
  }
  return redisClient;
};

export { connectToRedis, redisClient };

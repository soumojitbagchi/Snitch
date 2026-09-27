import { createClient } from "redis";
import { config } from "./config.js";

const redisClient = createClient({
  username: config.REDIS_USER,
  password: config.REDIS_PASSWORD,

  socket: {
    host: config.REDIS_HOST,
    port: Number(config.REDIS_PORT),
  },
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

const connectToRedis = async () => {
  if (!redisClient.isReady) {
    await redisClient.connect();
    console.log("connected to redis")
  }
  return redisClient;
};

export { connectToRedis ,redisClient};
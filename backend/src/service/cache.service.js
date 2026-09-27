import { redisClient } from "../config/redis.js";

export const getJson = async (key) => {
  try {
    const raw = await redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setJsonEx = async (key, value, ttlSeconds) => {
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const del = async (...keys) => {
  if (!keys.length) return false;
  try {
    await redisClient.del(keys);
    return true;
  } catch {
    return false;
  }
};

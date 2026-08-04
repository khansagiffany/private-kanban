const { Redis } = require('@upstash/redis');

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis = new Redis({ url, token });

const KEY = 'kanban-data';

const DEFAULT_DATA = {
  auth: { passwordHash: null },
  projects: [],
  cards: [],
};

async function readData() {
  const data = await redis.get(KEY);
  return data || { ...DEFAULT_DATA };
}

async function writeData(data) {
  await redis.set(KEY, data);
}

module.exports = { readData, writeData };

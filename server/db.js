const hasRedisEnv = !!(
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
);

module.exports = hasRedisEnv ? require('./db-redis') : require('./db-local');

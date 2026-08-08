// Vercel serverless function entry point.
// This wraps the same Express app used for self-hosting — all routes
// under /api/* are handled here. Data storage automatically switches
// to Upstash Redis when UPSTASH_REDIS_REST_URL is present (see server/db.js).
const app = require('../server/app');

module.exports = app;

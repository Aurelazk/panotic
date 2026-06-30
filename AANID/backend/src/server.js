require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((s) => s.trim()),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Redis optionnel (dev local)
let redisClient = null;
try {
  const redis = require('redis');
  if (process.env.REDIS_URL) {
    redisClient = redis.createClient({ url: process.env.REDIS_URL });
    redisClient.connect().catch(() => console.log('[AANID] Redis non connecté'));
  }
} catch {
  /* redis optionnel */
}

// Gateway — tous les modules sous /api/v1
app.use('/api/v1', require('@aanid/beni-momo-adnan-backend'));
app.use('/api/v1', require('@aanid/bryan-fanou-backend'));
app.use('/api/v1', require('@aanid/rayan-backend'));
app.use('/api/v1', require('@aanid/w-d-backend'));
app.use('/api/v1', require('@aanid/undef-backend'));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'aanid-api-gateway',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'configured' : 'not_configured',
  });
});

app.get('/', (_req, res) => {
  res.json({ name: 'AANID API', version: '1.0.0', docs: '/health' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AANID API Gateway → http://0.0.0.0:${PORT}`);
  console.log(`  Health: /health`);
  console.log(`  API:    /api/v1/*`);
  if (process.env.DATABASE_URL) {
    console.log('  Database: Neon/Postgres configuré (Prisma seed: npm run prisma:seed -w backend)');
  }
});

module.exports = { app, redisClient };

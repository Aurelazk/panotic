const express = require('express');
const router = require('./src/server');

const app = express();
app.use(express.json());
app.use('/api/v1', router);

app.get('/health', (_, res) => res.json({ status: 'ok', module: 'bryan-fanou' }));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`[bryan-fanou] Backend running on http://localhost:${PORT}`);
  console.log(`[bryan-fanou] Routes:`);
  console.log(`  GET /health`);
  console.log(`  GET /api/v1/etats-lieux`);
  console.log(`  GET /api/v1/etats-lieux/kpis`);
  console.log(`  GET /api/v1/etats-lieux/evolution`);
  console.log(`  GET /api/v1/etats-lieux/signalements`);
  console.log(`  GET /api/v1/etats-lieux/categories`);
  console.log(`  GET /api/v1/etats-lieux/carte`);
  console.log(`  GET /api/v1/etats-lieux/conformite`);
});

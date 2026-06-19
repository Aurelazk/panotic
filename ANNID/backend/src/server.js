require('dotenv').config();
const express = require('express');
const cors = require('cors');
const redis = require('redis');

const app = express();

app.use(cors());
app.use(express.json());

const client = redis.createClient({ url: process.env.REDIS_URL });
client.connect().catch(console.error);

// Mount member modules
app.use('/api/v1', require('@aanid/beni-momo-adnan-backend'));
app.use('/api/v1', require('@aanid/bryan-fanou-backend'));
app.use('/api/v1', require('@aanid/rayan-backend'));
app.use('/api/v1', require('@aanid/w-d-backend'));
app.use('/api/v1', require('@aanid/undef-backend'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'aanid-api-gateway' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AANID API Gateway running on port ${PORT}`);
});

module.exports = { app, client };

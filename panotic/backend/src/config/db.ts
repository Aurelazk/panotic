import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a new PostgreSQL pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // You might want to adjust SSL settings based on your environment
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;

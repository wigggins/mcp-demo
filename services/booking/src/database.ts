import { Pool, PoolClient } from 'pg';

// Create a connection pool
const pool = new Pool({
  user: 'booking_user',
  password: 'booking_password',
  host: 'localhost',
  port: 5432,
  database: 'mcp_booking_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: false,  // Disable SSL for local Docker container
});

// Database query helper
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

// Get a client from the pool for transactions
export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  return client;
};

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await pool.end();
});

export default { query, getClient }; 
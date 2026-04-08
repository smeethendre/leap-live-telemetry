import { Pool } from 'pg';

// This global variable survives hot-reloads in development
const globalForPg = global as unknown as { pool: Pool };

export const pool = globalForPg.pool || new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST || 'localhost',
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME || 'hab_telemetry',
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER || 'postgres',
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  max: 20,                // Let's allow 20 seats
  idleTimeoutMillis: 5000, // Kick out idle users after 5 seconds
  connectionTimeoutMillis: 2000,
});

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

// Using pool.query directly is the most reliable way to auto-release connections
export const query = (text: string, params?: any[]) => pool.query(text, params);
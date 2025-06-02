
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL!,
  // ssl: { rejectUnauthorized: false } // Only if needed for self-signed certs or specific cloud providers
});


export const db = drizzle(pool, {
  schema
});
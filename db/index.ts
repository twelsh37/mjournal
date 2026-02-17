import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Drizzle DB client for Postgres (Supabase / Vercel).
 * Uses POSTGRES_URL (Vercel) or DATABASE_URL from environment.
 */
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "POSTGRES_URL or DATABASE_URL is not set. Add one to .env.local (Vercel provides POSTGRES_URL)."
  );
}

// postgres.js for serverless: use max 1 connection in serverless to avoid exhausting pool
const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client, { schema });

export * from "./schema";

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local (Next.js) or .env for drizzle-kit CLI
config({ path: ".env.local" });
config({ path: ".env" });

// Postgres connection string (Vercel: POSTGRES_URL; or DATABASE_URL / Supabase connection string)
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  "postgres://localhost:5432/postgres";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
});

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Build connection string from Railway-provided variables or use DATABASE_URL
function getConnectionString(): string {
  // First try DATABASE_URL
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
    return process.env.DATABASE_URL;
  }

  // Fallback: construct from Railway Postgres individual variables
  const pgHost = process.env.PGHOST;
  const pgPort = process.env.PGPORT;
  const pgUser = process.env.PGUSER;
  const pgPassword = process.env.PGPASSWORD;
  const pgDatabase = process.env.PGDATABASE;

  if (pgHost && pgPort && pgUser && pgPassword && pgDatabase) {
    console.log("📊 Building DATABASE_URL from Railway PG* variables");
    return `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
  }

  // Development fallback
  return "postgresql://postgres:postgres@localhost:5432/marketing_automation";
}

const connectionString = getConnectionString();

// Debug logging for Railway deployment
if (process.env.NODE_ENV === "production") {
  console.log("📊 Database connection check:");
  console.log("  DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("  PGHOST exists:", !!process.env.PGHOST);
  const sanitized = connectionString.replace(/:[^@]+@/, ':***@');
  console.log("  Using:", sanitized);
}

// Disable prefetch as it's not supported in serverless environments
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

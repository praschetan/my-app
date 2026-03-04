import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/marketing_automation";

// Debug logging for Railway deployment
if (process.env.NODE_ENV === "production") {
  console.log("📊 Database connection check:");
  console.log("  DATABASE_URL exists:", !!process.env.DATABASE_URL);
  if (process.env.DATABASE_URL) {
    const sanitized = process.env.DATABASE_URL.replace(/:[^@]+@/, ':***@');
    console.log("  Using:", sanitized);
  } else {
    console.log("  ⚠️  Using fallback: localhost:5432");
  }
}

// Disable prefetch as it's not supported in serverless environments
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

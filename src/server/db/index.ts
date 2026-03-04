import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/marketing_automation";

// Disable prefetch as it's not supported in serverless environments
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

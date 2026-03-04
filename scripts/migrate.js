const { drizzle } = require("drizzle-orm/postgres-js");
const { migrate } = require("drizzle-orm/postgres-js/migrator");
const postgres = require("postgres");

// Build connection string from Railway-provided variables or use DATABASE_URL
function getConnectionString() {
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

  return null;
}

const connectionString = getConnectionString();

console.log("📊 Environment check:");
console.log("  DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing");
console.log("  PGHOST:", process.env.PGHOST ? "✅ Set" : "❌ Missing");
console.log("  PGUSER:", process.env.PGUSER ? "✅ Set" : "❌ Missing");
if (connectionString) {
  // Safely log without exposing password
  const sanitized = connectionString.replace(/:[^@]+@/, ':***@');
  console.log("  Connection:", sanitized);
}

if (!connectionString) {
  console.error("❌ No database connection available. Need either DATABASE_URL or PG* variables.");
  process.exit(1);
}

async function runMigrations() {
  console.log("🔄 Running database migrations...");

  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const { drizzle } = require("drizzle-orm/postgres-js");
const { migrate } = require("drizzle-orm/postgres-js/migrator");
const postgres = require("postgres");

const connectionString = process.env.DATABASE_URL;

console.log("📊 Environment check:");
console.log("  DATABASE_URL:", connectionString ? "✅ Set" : "❌ Missing");
if (connectionString) {
  // Safely log without exposing password
  const sanitized = connectionString.replace(/:[^@]+@/, ':***@');
  console.log("  Connection:", sanitized);
}

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
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

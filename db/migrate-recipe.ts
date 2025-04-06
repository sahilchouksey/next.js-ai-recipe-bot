import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const runMigration = async () => {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_URL is not defined in the environment");
  }

  // Use with migrate
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  console.log("Running recipe table migration...");
  
  try {
    // Creating recipe table directly
    await migrationClient`
      CREATE TABLE IF NOT EXISTS "recipe" (
        "id" varchar(256) PRIMARY KEY NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "user_id" varchar(256) NOT NULL,
        "details" jsonb NOT NULL,
        "is_favorite" boolean DEFAULT false
      );
    `;
    
    console.log("Recipe table migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
};

runMigration()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });

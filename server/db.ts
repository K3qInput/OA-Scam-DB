import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Construct DATABASE_URL from individual Replit PostgreSQL environment variables if not provided
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT } = process.env;
  
  if (!PGHOST || !PGUSER || !PGPASSWORD || !PGDATABASE || !PGPORT) {
    console.error("DATABASE_URL is not set and required PostgreSQL environment variables are missing!");
    console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('PG') || k.includes('DB')));
    throw new Error(
      "DATABASE_URL must be set or PostgreSQL environment variables (PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT) must be provided.",
    );
  }
  
  databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
  console.log("Constructed DATABASE_URL from environment variables");
}

console.log("Database connection established with URL:", databaseUrl.substring(0, 30) + "...");

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
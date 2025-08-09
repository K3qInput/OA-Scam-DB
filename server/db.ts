import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check for database URL and construct if needed
let databaseUrl = process.env.DATABASE_URL;

// If DATABASE_URL is not set or empty, construct from provided values
if (!databaseUrl || databaseUrl.trim() === '') {
  console.log("DATABASE_URL not found in environment, constructing from provided credentials...");
  
  // Use the credentials provided by the user
  const PGHOST = "ep-rough-credit-afoxp554.c-2.us-west-2.aws.neon.tech";
  const PGUSER = "neondb_owner";
  const PGPASSWORD = "npg_pcaF4XtDmx3s";
  const PGDATABASE = "neondb";
  const PGPORT = "5432";
  
  databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
  console.log("Constructed DATABASE_URL from hardcoded credentials");
} else {
  console.log("Using DATABASE_URL from environment");
}

console.log("Database connection established with URL:", databaseUrl.substring(0, 30) + "...");

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
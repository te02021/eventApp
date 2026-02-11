import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no se encuentra definida en el servidor");
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Inicializamos Drizzle con el pool
export const db = drizzle(pool, { schema });

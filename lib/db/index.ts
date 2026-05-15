import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!dbInstance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL no está configurado");
    }
    const sql = neon(url);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
}

// Proxy que inicializa el db lazy al primer uso
/* eslint-disable @typescript-eslint/no-explicit-any */
export const db = new Proxy({} as any, {
  get(_, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
/* eslint-enable @typescript-eslint/no-explicit-any */

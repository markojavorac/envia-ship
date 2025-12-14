/**
 * Turso Database Client
 *
 * Provides connection to LibSQL/Turso database for driver assist data
 */

import { createClient, Client } from "@libsql/client";

let _db: Client | null = null;

/**
 * Get database client (lazy initialization)
 */
export function getDb(): Client {
  if (_db) {
    return _db;
  }

  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }

  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_AUTH_TOKEN is not set");
  }

  _db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return _db;
}

// Export a getter for backward compatibility
export const db = new Proxy({} as Client, {
  get(target, prop) {
    return getDb()[prop as keyof Client];
  },
});

export default db;

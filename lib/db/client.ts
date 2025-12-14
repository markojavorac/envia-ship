/**
 * Turso Database Client
 *
 * Provides connection to LibSQL/Turso database for driver assist data
 */

import { createClient, Client } from "@libsql/client";

let _db: Client | null = null;

/**
 * Get database client (lazy initialization)
 * Use this function to access the database client
 */
function getDb(): Client {
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

// Export db as an object with execute method
export const db = {
  execute: (...args: Parameters<Client["execute"]>) => getDb().execute(...args),
};

export default db;

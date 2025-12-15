/**
 * Quick script to check database status
 */
import { db } from "../lib/db/client";

async function checkDatabase() {
  try {
    console.log("Checking database connection...");

    // Check if tables exist
    const tables = await db.execute(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `);

    console.log("\nExisting tables:");
    console.log(tables.rows);

    // Check users table
    try {
      const users = await db.execute("SELECT * FROM users");
      console.log("\nUsers:");
      console.log(users.rows);
    } catch (e) {
      console.log("\nUsers table doesn't exist yet");
    }

    // Check tickets table
    try {
      const tickets = await db.execute("SELECT COUNT(*) as count FROM delivery_tickets");
      console.log("\nTickets count:");
      console.log(tickets.rows);
    } catch (e) {
      console.log("\nTickets table doesn't exist yet");
    }
  } catch (error) {
    console.error("Database error:", error);
  }
}

checkDatabase();

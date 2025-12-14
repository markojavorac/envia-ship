import { db } from "../lib/db/client";

async function inspectSchema() {
  console.log("=== DELIVERY_TICKETS SCHEMA ===");
  const ticketsSchema = await db.execute("PRAGMA table_info(delivery_tickets)");
  console.log(ticketsSchema.rows);

  console.log("\n=== DRIVERS SCHEMA ===");
  const driversSchema = await db.execute("PRAGMA table_info(drivers)");
  console.log(driversSchema.rows);

  console.log("\n=== SESSIONS SCHEMA ===");
  const sessionsSchema = await db.execute("PRAGMA table_info(sessions)");
  console.log(sessionsSchema.rows);

  console.log("\n=== SAMPLE DRIVERS ===");
  const drivers = await db.execute("SELECT * FROM drivers LIMIT 5");
  console.log(drivers.rows);

  console.log("\n=== SAMPLE TICKETS ===");
  const tickets = await db.execute("SELECT * FROM delivery_tickets LIMIT 3");
  console.log(tickets.rows);
}

inspectSchema();

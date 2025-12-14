import { db } from "../lib/db/client";
import { hashPin } from "../lib/auth/pin";

async function updateAdminPin() {
  console.log("Generating new PIN hash for '1234'...");

  const newPinHash = await hashPin("1234");
  console.log("New hash:", newPinHash);

  console.log("\nUpdating admin user PIN...");
  await db.execute({
    sql: "UPDATE drivers SET pin_hash = ? WHERE id = 'admin-001'",
    args: [newPinHash],
  });

  console.log("✅ Admin PIN updated successfully!");
  console.log("\nYou can now login with:");
  console.log("  Username: Admin User");
  console.log("  PIN: 1234");
}

updateAdminPin();

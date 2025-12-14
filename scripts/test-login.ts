import { getUserByUsername } from "../lib/db/queries";
import { verifyPin } from "../lib/auth/pin";

async function testLogin() {
  console.log("Testing login for 'Admin User'...");

  const user = await getUserByUsername("Admin User");

  if (!user) {
    console.error("❌ User 'Admin User' not found in database");
    return;
  }

  console.log("✅ User found:", { id: user.id, username: user.username, role: user.role });
  console.log("PIN hash:", user.pinHash);

  // Test PIN verification
  const isValid = await verifyPin("1234", user.pinHash);
  console.log(`PIN '1234' verification: ${isValid ? "✅ VALID" : "❌ INVALID"}`);
}

testLogin();

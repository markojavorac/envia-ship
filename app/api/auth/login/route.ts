/**
 * Login API Route
 *
 * Handles user authentication with PIN
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/db/queries";
import { verifyPin, isValidPinFormat } from "@/lib/auth/pin";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, pin } = body;

    // Validate input
    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    if (!pin || !isValidPinFormat(pin)) {
      return NextResponse.json(
        { error: "Invalid PIN format (4-6 digits required)" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify PIN
    const isValid = await verifyPin(pin, user.pinHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create session
    await createSession(user.id, user.username);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Session API Route
 *
 * Returns current session information
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        username: session.username,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

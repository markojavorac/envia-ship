/**
 * Next.js Middleware
 *
 * Handles authentication and root redirect
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "envia_session";
const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET || "fallback-secret-key-change-in-production");

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME);

  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token.value, SECRET_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect root to admin driver assist (server-side, no flash)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/admin/driver-assist", request.url));
  }

  // Public routes (no authentication required)
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Protected admin routes
  if (pathname.startsWith("/admin")) {
    const authenticated = await isAuthenticated(request);

    if (!authenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match:
     * - Root path (/) for redirect
     * - All admin routes
     * Except:
     * - API routes (_next)
     * - Static files (.*)
     * - Images, favicon, etc.
     */
    "/",
    "/admin/:path*",
  ],
};

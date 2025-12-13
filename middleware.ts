/**
 * Next.js Middleware
 *
 * Handles root redirect to admin dashboard.
 * Authentication will be added in future version.
 */

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect root to admin driver assist (server-side, no flash)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/admin/driver-assist", request.url));
  }

  // Allow all other requests
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

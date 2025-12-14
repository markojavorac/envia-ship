/**
 * Session Management
 *
 * Handles user sessions with HTTP-only cookies
 */

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "envia_session";
const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET || "fallback-secret-key-change-in-production");
const SESSION_EXPIRY_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS || "24", 10);

export interface SessionData {
  userId: string;
  username: string;
  exp: number;
}

/**
 * Create a new session
 */
export async function createSession(userId: string, username: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

  const token = await new SignJWT({
    userId,
    username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

/**
 * Get the current session
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME);

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token.value, SECRET_KEY);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      exp: payload.exp as number,
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

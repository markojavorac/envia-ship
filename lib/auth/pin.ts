/**
 * PIN Authentication
 *
 * Handles PIN hashing and validation using bcrypt
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash a PIN for storage
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

/**
 * Verify a PIN against a hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Validate PIN format (4-6 digits)
 */
export function isValidPinFormat(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

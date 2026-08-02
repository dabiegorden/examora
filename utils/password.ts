import bcrypt from "bcryptjs";

/**
 * Password hashing, isolated behind two functions so the algorithm can change
 * without touching call sites.
 *
 * Cost 12 is the current sensible default: roughly 250ms on typical serverless
 * hardware — slow enough to hurt offline cracking, fast enough for a sign-in.
 */
const BCRYPT_COST = 12;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_COST);
}

/**
 * Always compares against a real hash, so the timing of a wrong password and a
 * missing account look the same to an attacker enumerating emails.
 */
export async function verifyPassword(
  plainText: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainText, passwordHash);
}

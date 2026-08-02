import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SETUP_COOKIE = "oryvane-admin-setup";
export const ADMIN_SETUP_TTL_SECONDS = 15 * 60;

function digest(value: string) { return createHmac("sha256", "oryvane-admin-setup-token-check").update(value).digest(); }
export function setupTokenMatches(provided: string, expected: string) { return timingSafeEqual(digest(provided), digest(expected)); }

export function createSetupGrant(userId: string, secret: string, now = Date.now()) {
  const payload = `${userId}.${Math.floor(now / 1000) + ADMIN_SETUP_TTL_SECONDS}`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySetupGrant(value: string | undefined, userId: string, secret: string, now = Date.now()) {
  if (!value) return false;
  const [subject, expiryText, signature] = value.split(".");
  if (subject !== userId || !expiryText || !signature || !/^\d+$/.test(expiryText) || Number(expiryText) < Math.floor(now / 1000)) return false;
  const expected = createHmac("sha256", secret).update(`${subject}.${expiryText}`).digest();
  let supplied: Buffer; try { supplied = Buffer.from(signature, "base64url"); } catch { return false; }
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

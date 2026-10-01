import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "upcreate_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Falls back to APP_PASSWORD (legacy single-password deployments) so an
// existing env var still gives a stable signing key without any new setup.
// Set SESSION_SECRET for a dedicated signing key independent of any
// password.
function secret() {
  return process.env.SESSION_SECRET || process.env.APP_PASSWORD || "dev-only-insecure-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

// The session token carries the user's id, signed -- middleware can verify
// and extract it without touching the database (Edge-safe), while server
// actions and pages use requireUserId() for the same token to scope every
// query to the signed-in user.
export function createSessionToken(userId: number) {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userIdStr, expiresStr, signature] = parts;
  const payload = `${userIdStr}.${expiresStr}`;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;
  const userId = Number(userIdStr);
  if (!Number.isFinite(userId) || userId <= 0) return null;
  return userId;
}

// Defense-in-depth check for Route Handlers (proxy already gates these paths,
// but each handler should verify independently per Next.js's auth guidance).
export function requireAuth(req: NextRequest): NextResponse | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (verifySessionToken(token) === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

// --- Password hashing (scrypt, built into Node -- no extra dependency) ---

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// --- Server Component / Server Action helpers (reads the session cookie) ---

// Returns the signed-in user's id, or null if not signed in. Safe to call
// from Server Components and Server Actions (reads cookies via next/headers).
export async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

// Like getCurrentUserId, but redirects to /login instead of returning null.
// Use this at the top of any page or action that requires a signed-in user
// -- proxy.ts already gates the route, so this should never actually fire
// in normal use, but it's a safe fallback (e.g. direct action invocation).
export async function requireUserId(): Promise<number> {
  const userId = await getCurrentUserId();
  if (userId === null) redirect("/login");
  return userId;
}

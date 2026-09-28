import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "chillchai_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function secret() {
  // Falls back to APP_PASSWORD so a single env var is enough to get going;
  // set SESSION_SECRET separately for a stronger, independent signing key.
  return process.env.SESSION_SECRET || process.env.APP_PASSWORD || "";
}

export function isAuthConfigured() {
  return !!process.env.APP_PASSWORD;
}

export function checkPassword(candidate: string) {
  const expected = process.env.APP_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSessionToken() {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${expires}`;
  return `${payload}.${sign(payload)}`;
}

// Defense-in-depth check for Route Handlers (proxy already gates these paths,
// but each handler should verify independently per Next.js's auth guidance).
export function requireAuth(req: NextRequest): NextResponse | null {
  if (!isAuthConfigured()) return null;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !isAuthConfigured()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  return true;
}

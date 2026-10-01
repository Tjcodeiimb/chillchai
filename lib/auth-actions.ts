"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql, ensureSchema } from "./db";
import { createSessionToken, hashPassword, verifyPassword, SESSION_COOKIE } from "./auth";

async function setSessionCookie(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

// The very first account ever created on a deployment inherits every
// pre-existing row that has no owner yet (user_id IS NULL) -- this is how
// the original single-tenant dataset (e.g. the 1000-script library) becomes
// that user's data with no manual migration step.
async function claimOrphanedData(userId: number) {
  await sql`UPDATE brand_config SET user_id = ${userId} WHERE user_id IS NULL`;
  await sql`UPDATE calendar_items SET user_id = ${userId} WHERE user_id IS NULL`;
  await sql`UPDATE outlier_research SET user_id = ${userId} WHERE user_id IS NULL`;
  await sql`UPDATE hook_stacks SET user_id = ${userId} WHERE user_id IS NULL`;
  await sql`UPDATE scripts SET user_id = ${userId} WHERE user_id IS NULL`;
  await sql`UPDATE script_templates SET user_id = ${userId} WHERE user_id IS NULL`;
  await sql`UPDATE ai_settings SET user_id = ${userId} WHERE user_id IS NULL`;
  await sql`UPDATE own_posts SET user_id = ${userId} WHERE user_id IS NULL`;
}

export async function signupAction(_prev: { error?: string } | null, formData: FormData) {
  await ensureSchema();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !email.includes("@")) return { error: "Enter a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) return { error: "An account with that email already exists." };

  const [{ count }] = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM users`;
  const isFirstUser = Number(count) === 0;

  const [user] = await sql<{ id: number }[]>`
    INSERT INTO users (email, password_hash) VALUES (${email}, ${hashPassword(password)})
    RETURNING id
  `;

  if (isFirstUser) await claimOrphanedData(user.id);

  await setSessionCookie(user.id);
  redirect("/onboarding");
}

export async function loginAction(_prev: { error?: string } | null, formData: FormData) {
  await ensureSchema();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const [user] = await sql<{ id: number; password_hash: string }[]>`
    SELECT id, password_hash FROM users WHERE email = ${email}
  `;
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "Wrong email or password." };
  }

  await setSessionCookie(user.id);
  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

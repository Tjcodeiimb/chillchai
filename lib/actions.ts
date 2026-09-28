"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "./db";
import { updateBrand, BrandConfig } from "./brand";

function val(fd: FormData, key: string, fallback = "") {
  const v = fd.get(key);
  return v === null || v === "" ? fallback : String(v);
}
function num(fd: FormData, key: string, fallback = 0) {
  const v = fd.get(key);
  const n = Number(v);
  return v === null || Number.isNaN(n) ? fallback : n;
}
function id(fd: FormData) {
  return num(fd, "id");
}

// ---------- Brand ----------
export async function saveBrandAction(partial: Partial<BrandConfig>) {
  await updateBrand(partial);
  revalidatePath("/brand");
  revalidatePath("/");
}

// ---------- Calendar ----------
export async function createCalendarItem(fd: FormData) {
  await ensureSchema();
  await sql`
    INSERT INTO calendar_items (date, pillar, concept_bucket, content_type, topic, angle, format, cta_type, funnel_stage, status, notes)
    VALUES (${val(fd, "date")}, ${val(fd, "pillar", "authority")}, ${val(fd, "concept_bucket", "proven")}, ${val(fd, "content_type", "educational")}, ${val(fd, "topic")}, ${val(fd, "angle")}, ${val(fd, "format")}, ${val(fd, "cta_type", "follow")}, ${val(fd, "funnel_stage", "tofu")}, ${val(fd, "status", "idea")}, ${val(fd, "notes")})
  `;
  revalidatePath("/calendar");
  revalidatePath("/");
  revalidatePath("/funnel");
}

export async function updateCalendarItemStatus(fd: FormData) {
  await ensureSchema();
  await sql`UPDATE calendar_items SET status = ${val(fd, "status", "idea")} WHERE id = ${id(fd)}`;
  revalidatePath("/calendar");
  revalidatePath("/");
  revalidatePath("/funnel");
}

export async function deleteCalendarItem(fd: FormData) {
  await ensureSchema();
  await sql`DELETE FROM calendar_items WHERE id = ${id(fd)}`;
  revalidatePath("/calendar");
  revalidatePath("/");
  revalidatePath("/funnel");
}

// ---------- Outlier research ----------
export async function createOutlier(fd: FormData) {
  await ensureSchema();
  await sql`
    INSERT INTO outlier_research (source_type, creator_handle, link, niche_keyword, follower_count, views, hook_written, hook_verbal, hook_visual, angle, notes)
    VALUES (${val(fd, "source_type", "keyword")}, ${val(fd, "creator_handle")}, ${val(fd, "link")}, ${val(fd, "niche_keyword")}, ${num(fd, "follower_count")}, ${num(fd, "views")}, ${val(fd, "hook_written")}, ${val(fd, "hook_verbal")}, ${val(fd, "hook_visual")}, ${val(fd, "angle")}, ${val(fd, "notes")})
  `;
  revalidatePath("/research");
}

export async function toggleOutlierUsed(fd: FormData) {
  await ensureSchema();
  await sql`UPDATE outlier_research SET used = NOT used WHERE id = ${id(fd)}`;
  revalidatePath("/research");
}

export async function deleteOutlier(fd: FormData) {
  await ensureSchema();
  await sql`DELETE FROM outlier_research WHERE id = ${id(fd)}`;
  revalidatePath("/research");
}

// ---------- Hook stacks ----------
export async function createHookStack(fd: FormData) {
  await ensureSchema();
  await sql`
    INSERT INTO hook_stacks (written, verbal, visual, angle, topic)
    VALUES (${val(fd, "written")}, ${val(fd, "verbal")}, ${val(fd, "visual")}, ${val(fd, "angle")}, ${val(fd, "topic")})
  `;
  revalidatePath("/hooks");
}

export async function deleteHookStack(fd: FormData) {
  await ensureSchema();
  await sql`DELETE FROM hook_stacks WHERE id = ${id(fd)}`;
  revalidatePath("/hooks");
}

// ---------- Scripts ----------
export async function createScript(fd: FormData) {
  await ensureSchema();
  await sql`
    INSERT INTO scripts (title, pillar, content_type, angle_or_story_type, format, body_black, body_red, body_green, cta_type, funnel_stage, status, series_name)
    VALUES (${val(fd, "title", "Untitled script")}, ${val(fd, "pillar", "authority")}, ${val(fd, "content_type", "educational")}, ${val(fd, "angle_or_story_type")}, ${val(fd, "format")}, ${val(fd, "body_black")}, ${val(fd, "body_red")}, ${val(fd, "body_green")}, ${val(fd, "cta_type", "follow")}, ${val(fd, "funnel_stage", "tofu")}, ${val(fd, "status", "draft")}, ${val(fd, "series_name")})
  `;
  revalidatePath("/scripts");
  revalidatePath("/production");
}

export async function deleteScript(fd: FormData) {
  await ensureSchema();
  await sql`DELETE FROM scripts WHERE id = ${id(fd)}`;
  revalidatePath("/scripts");
  revalidatePath("/production");
}

export async function createScriptTemplate(fd: FormData) {
  await ensureSchema();
  await sql`
    INSERT INTO script_templates (name, pillar, angle, source_note, template_text)
    VALUES (${val(fd, "name", "Untitled template")}, ${val(fd, "pillar", "authority")}, ${val(fd, "angle")}, ${val(fd, "source_note")}, ${val(fd, "template_text")})
  `;
  revalidatePath("/scripts");
}

export async function deleteScriptTemplate(fd: FormData) {
  await ensureSchema();
  await sql`DELETE FROM script_templates WHERE id = ${id(fd)}`;
  revalidatePath("/scripts");
}

// ---------- Own posts / analytics ----------
export async function createOwnPost(fd: FormData) {
  await ensureSchema();
  await sql`
    INSERT INTO own_posts (title, posted_date, views, followers_at_post, pillar, notes)
    VALUES (${val(fd, "title")}, ${val(fd, "posted_date")}, ${num(fd, "views")}, ${num(fd, "followers_at_post")}, ${val(fd, "pillar", "authority")}, ${val(fd, "notes")})
  `;
  revalidatePath("/analytics");
  revalidatePath("/");
}

export async function deleteOwnPost(fd: FormData) {
  await ensureSchema();
  await sql`DELETE FROM own_posts WHERE id = ${id(fd)}`;
  revalidatePath("/analytics");
  revalidatePath("/");
}

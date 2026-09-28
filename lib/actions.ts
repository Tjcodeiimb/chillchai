"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
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
  updateBrand(partial);
  revalidatePath("/brand");
  revalidatePath("/");
}

// ---------- Calendar ----------
export async function createCalendarItem(fd: FormData) {
  db.prepare(
    `INSERT INTO calendar_items (date, pillar, concept_bucket, content_type, topic, angle, format, cta_type, funnel_stage, status, notes)
     VALUES (@date, @pillar, @concept_bucket, @content_type, @topic, @angle, @format, @cta_type, @funnel_stage, @status, @notes)`
  ).run({
    date: val(fd, "date"),
    pillar: val(fd, "pillar", "authority"),
    concept_bucket: val(fd, "concept_bucket", "proven"),
    content_type: val(fd, "content_type", "educational"),
    topic: val(fd, "topic"),
    angle: val(fd, "angle"),
    format: val(fd, "format"),
    cta_type: val(fd, "cta_type", "follow"),
    funnel_stage: val(fd, "funnel_stage", "tofu"),
    status: val(fd, "status", "idea"),
    notes: val(fd, "notes"),
  });
  revalidatePath("/calendar");
  revalidatePath("/");
  revalidatePath("/funnel");
}

export async function updateCalendarItemStatus(fd: FormData) {
  db.prepare("UPDATE calendar_items SET status = ? WHERE id = ?").run(val(fd, "status", "idea"), id(fd));
  revalidatePath("/calendar");
  revalidatePath("/");
  revalidatePath("/funnel");
}

export async function deleteCalendarItem(fd: FormData) {
  db.prepare("DELETE FROM calendar_items WHERE id = ?").run(id(fd));
  revalidatePath("/calendar");
  revalidatePath("/");
  revalidatePath("/funnel");
}

// ---------- Outlier research ----------
export async function createOutlier(fd: FormData) {
  db.prepare(
    `INSERT INTO outlier_research (source_type, creator_handle, link, niche_keyword, follower_count, views, hook_written, hook_verbal, hook_visual, angle, notes)
     VALUES (@source_type, @creator_handle, @link, @niche_keyword, @follower_count, @views, @hook_written, @hook_verbal, @hook_visual, @angle, @notes)`
  ).run({
    source_type: val(fd, "source_type", "keyword"),
    creator_handle: val(fd, "creator_handle"),
    link: val(fd, "link"),
    niche_keyword: val(fd, "niche_keyword"),
    follower_count: num(fd, "follower_count"),
    views: num(fd, "views"),
    hook_written: val(fd, "hook_written"),
    hook_verbal: val(fd, "hook_verbal"),
    hook_visual: val(fd, "hook_visual"),
    angle: val(fd, "angle"),
    notes: val(fd, "notes"),
  });
  revalidatePath("/research");
}

export async function toggleOutlierUsed(fd: FormData) {
  const current = db.prepare("SELECT used FROM outlier_research WHERE id = ?").get(id(fd)) as
    | { used: number }
    | undefined;
  db.prepare("UPDATE outlier_research SET used = ? WHERE id = ?").run(current?.used ? 0 : 1, id(fd));
  revalidatePath("/research");
}

export async function deleteOutlier(fd: FormData) {
  db.prepare("DELETE FROM outlier_research WHERE id = ?").run(id(fd));
  revalidatePath("/research");
}

// ---------- Hook stacks ----------
export async function createHookStack(fd: FormData) {
  db.prepare(
    `INSERT INTO hook_stacks (written, verbal, visual, angle, topic) VALUES (@written, @verbal, @visual, @angle, @topic)`
  ).run({
    written: val(fd, "written"),
    verbal: val(fd, "verbal"),
    visual: val(fd, "visual"),
    angle: val(fd, "angle"),
    topic: val(fd, "topic"),
  });
  revalidatePath("/hooks");
}

export async function deleteHookStack(fd: FormData) {
  db.prepare("DELETE FROM hook_stacks WHERE id = ?").run(id(fd));
  revalidatePath("/hooks");
}

// ---------- Scripts ----------
export async function createScript(fd: FormData) {
  db.prepare(
    `INSERT INTO scripts (title, pillar, content_type, angle_or_story_type, format, body_black, body_red, body_green, cta_type, funnel_stage, status, series_name)
     VALUES (@title, @pillar, @content_type, @angle_or_story_type, @format, @body_black, @body_red, @body_green, @cta_type, @funnel_stage, @status, @series_name)`
  ).run({
    title: val(fd, "title", "Untitled script"),
    pillar: val(fd, "pillar", "authority"),
    content_type: val(fd, "content_type", "educational"),
    angle_or_story_type: val(fd, "angle_or_story_type"),
    format: val(fd, "format"),
    body_black: val(fd, "body_black"),
    body_red: val(fd, "body_red"),
    body_green: val(fd, "body_green"),
    cta_type: val(fd, "cta_type", "follow"),
    funnel_stage: val(fd, "funnel_stage", "tofu"),
    status: val(fd, "status", "draft"),
    series_name: val(fd, "series_name"),
  });
  revalidatePath("/scripts");
  revalidatePath("/production");
}

export async function deleteScript(fd: FormData) {
  db.prepare("DELETE FROM scripts WHERE id = ?").run(id(fd));
  revalidatePath("/scripts");
  revalidatePath("/production");
}

export async function createScriptTemplate(fd: FormData) {
  db.prepare(
    `INSERT INTO script_templates (name, pillar, angle, source_note, template_text) VALUES (@name, @pillar, @angle, @source_note, @template_text)`
  ).run({
    name: val(fd, "name", "Untitled template"),
    pillar: val(fd, "pillar", "authority"),
    angle: val(fd, "angle"),
    source_note: val(fd, "source_note"),
    template_text: val(fd, "template_text"),
  });
  revalidatePath("/scripts");
}

export async function deleteScriptTemplate(fd: FormData) {
  db.prepare("DELETE FROM script_templates WHERE id = ?").run(id(fd));
  revalidatePath("/scripts");
}

// ---------- Own posts / analytics ----------
export async function createOwnPost(fd: FormData) {
  db.prepare(
    `INSERT INTO own_posts (title, posted_date, views, followers_at_post, pillar, notes) VALUES (@title, @posted_date, @views, @followers_at_post, @pillar, @notes)`
  ).run({
    title: val(fd, "title"),
    posted_date: val(fd, "posted_date"),
    views: num(fd, "views"),
    followers_at_post: num(fd, "followers_at_post"),
    pillar: val(fd, "pillar", "authority"),
    notes: val(fd, "notes"),
  });
  revalidatePath("/analytics");
  revalidatePath("/");
}

export async function deleteOwnPost(fd: FormData) {
  db.prepare("DELETE FROM own_posts WHERE id = ?").run(id(fd));
  revalidatePath("/analytics");
  revalidatePath("/");
}

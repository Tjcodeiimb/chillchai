"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "./db";
import { updateBrand, BrandConfig } from "./brand";
import { BASE_DATE, BATCH_TAG, OCT_2026_BATCH, OCT_2026_BATCH_EXT } from "./seed-data/octBatch";
import { GROWTH_START_WEEK, GROWTH_BATCH_TAG, GROWTH_BATCH } from "./seed-data/growthBatch";
import { COMMENTARY_START_WEEK, COMMENTARY_BATCH_TAG, COMMENTARY_BATCH } from "./seed-data/commentaryBatch";
import { SEGMENTS_START_WEEK, SEGMENTS_BATCH_TAG, SEGMENTS_BATCH } from "./seed-data/segmentsBatch";

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

export type BulkOutlierRow = {
  source_type: string;
  creator_handle: string;
  link: string;
  niche_keyword: string;
  follower_count: number;
  views: number;
  hook_written: string;
  hook_verbal: string;
  hook_visual: string;
  angle: string;
  notes: string;
};

export async function createOutliersBulk(rows: BulkOutlierRow[]) {
  if (rows.length === 0) return;
  await ensureSchema();
  await sql`
    INSERT INTO outlier_research ${sql(
      rows,
      "source_type",
      "creator_handle",
      "link",
      "niche_keyword",
      "follower_count",
      "views",
      "hook_written",
      "hook_verbal",
      "hook_visual",
      "angle",
      "notes"
    )}
  `;
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

// ---------- Oct 2026 content batch (30 scripts, weekly, from BASE_DATE) ----------
function addDays(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function isOctoberBatchSeeded(): Promise<boolean> {
  await ensureSchema();
  const rows = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${BATCH_TAG}`;
  return rows.length > 0;
}

export async function seedOctoberBatch() {
  await ensureSchema();
  const already = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${BATCH_TAG}`;
  if (already.length > 0) {
    revalidatePath("/calendar");
    return { alreadySeeded: true as const, count: 0 };
  }

  const fullBatch = [...OCT_2026_BATCH, ...OCT_2026_BATCH_EXT];

  const calendarRows = fullBatch.map((s) => ({
    date: addDays(BASE_DATE, s.weekOffset * 7),
    pillar: s.pillar,
    concept_bucket: s.conceptBucket,
    content_type: s.contentType,
    topic: s.title,
    angle: s.angle,
    format: s.format,
    cta_type: s.ctaType,
    funnel_stage: s.funnelStage,
    status: "scripted",
    notes: `Oct 2026 batch -- effort: ${s.effort}${s.seriesName ? ` -- series: ${s.seriesName}` : ""}. Full script in Script Studio.`,
    effort: s.effort,
    topic_tag: "Market Entry & Business Consulting",
    segment: "",
  }));

  const scriptRows = fullBatch.map((s) => ({
    title: s.title,
    pillar: s.pillar,
    content_type: s.contentType,
    angle_or_story_type: s.angle,
    format: s.format,
    body_black: s.bodyBlack,
    body_red: s.bodyRed,
    body_green: s.bodyGreen,
    cta_type: s.ctaType,
    funnel_stage: s.funnelStage,
    status: "draft",
    series_name: s.seriesName ?? "",
    effort: s.effort,
    topic_tag: "Market Entry & Business Consulting",
    segment: "",
  }));

  await sql`
    INSERT INTO calendar_items ${sql(
      calendarRows,
      "date",
      "pillar",
      "concept_bucket",
      "content_type",
      "topic",
      "angle",
      "format",
      "cta_type",
      "funnel_stage",
      "status",
      "notes",
      "effort",
      "topic_tag",
      "segment"
    )}
  `;

  await sql`
    INSERT INTO scripts ${sql(
      scriptRows,
      "title",
      "pillar",
      "content_type",
      "angle_or_story_type",
      "format",
      "body_black",
      "body_red",
      "body_green",
      "cta_type",
      "funnel_stage",
      "status",
      "series_name",
      "effort",
      "topic_tag",
      "segment"
    )}
  `;

  await sql`
    INSERT INTO brand_config (key, value) VALUES (${BATCH_TAG}, ${JSON.stringify({ seededAt: new Date().toISOString(), count: fullBatch.length })})
    ON CONFLICT (key) DO NOTHING
  `;

  revalidatePath("/calendar");
  revalidatePath("/scripts");
  revalidatePath("/production");
  revalidatePath("/funnel");
  revalidatePath("/");

  return { alreadySeeded: false as const, count: fullBatch.length };
}

export async function seedOctoberBatchAction() {
  await seedOctoberBatch();
}

// ---------- Growth batch (100 scripts, weekly, continuing from GROWTH_START_WEEK) ----------
export async function isGrowthBatchSeeded(): Promise<boolean> {
  await ensureSchema();
  const rows = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${GROWTH_BATCH_TAG}`;
  return rows.length > 0;
}

export async function seedGrowthBatch() {
  await ensureSchema();
  const already = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${GROWTH_BATCH_TAG}`;
  if (already.length > 0) {
    revalidatePath("/calendar");
    return { alreadySeeded: true as const, count: 0 };
  }

  const calendarRows = GROWTH_BATCH.map((s) => ({
    date: addDays(BASE_DATE, (GROWTH_START_WEEK + s.weekOffset) * 7),
    pillar: s.pillar,
    concept_bucket: s.conceptBucket,
    content_type: s.contentType,
    topic: s.title,
    angle: s.angle,
    format: s.format,
    cta_type: s.ctaType,
    funnel_stage: s.funnelStage,
    status: "scripted",
    notes: `Growth batch -- sub-niche: ${s.subniche} -- effort: ${s.effort}${s.seriesName ? ` -- series: ${s.seriesName}` : ""}. Full script in Script Studio.`,
    effort: s.effort,
    topic_tag: s.subniche,
    segment: "",
  }));

  const scriptRows = GROWTH_BATCH.map((s) => ({
    title: s.title,
    pillar: s.pillar,
    content_type: s.contentType,
    angle_or_story_type: s.angle,
    format: s.format,
    body_black: s.bodyBlack,
    body_red: s.bodyRed,
    body_green: s.bodyGreen,
    cta_type: s.ctaType,
    funnel_stage: s.funnelStage,
    status: "draft",
    series_name: s.seriesName ?? "",
    effort: s.effort,
    topic_tag: s.subniche,
    segment: "",
  }));

  await sql`
    INSERT INTO calendar_items ${sql(
      calendarRows,
      "date",
      "pillar",
      "concept_bucket",
      "content_type",
      "topic",
      "angle",
      "format",
      "cta_type",
      "funnel_stage",
      "status",
      "notes",
      "effort",
      "topic_tag",
      "segment"
    )}
  `;

  await sql`
    INSERT INTO scripts ${sql(
      scriptRows,
      "title",
      "pillar",
      "content_type",
      "angle_or_story_type",
      "format",
      "body_black",
      "body_red",
      "body_green",
      "cta_type",
      "funnel_stage",
      "status",
      "series_name",
      "effort",
      "topic_tag",
      "segment"
    )}
  `;

  await sql`
    INSERT INTO brand_config (key, value) VALUES (${GROWTH_BATCH_TAG}, ${JSON.stringify({ seededAt: new Date().toISOString(), count: GROWTH_BATCH.length })})
    ON CONFLICT (key) DO NOTHING
  `;

  revalidatePath("/calendar");
  revalidatePath("/scripts");
  revalidatePath("/production");
  revalidatePath("/funnel");
  revalidatePath("/");

  return { alreadySeeded: false as const, count: GROWTH_BATCH.length };
}

export async function seedGrowthBatchAction() {
  await seedGrowthBatch();
}

// ---------- Commentary batch (50 scripts, weekly, continuing from COMMENTARY_START_WEEK) ----------
export async function isCommentaryBatchSeeded(): Promise<boolean> {
  await ensureSchema();
  const rows = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${COMMENTARY_BATCH_TAG}`;
  return rows.length > 0;
}

export async function seedCommentaryBatch() {
  await ensureSchema();
  const already = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${COMMENTARY_BATCH_TAG}`;
  if (already.length > 0) {
    revalidatePath("/calendar");
    return { alreadySeeded: true as const, count: 0 };
  }

  const calendarRows = COMMENTARY_BATCH.map((s) => ({
    date: addDays(BASE_DATE, (COMMENTARY_START_WEEK + s.weekOffset) * 7),
    pillar: s.pillar,
    concept_bucket: s.conceptBucket,
    content_type: s.contentType,
    topic: s.title,
    angle: s.angle,
    format: s.format,
    cta_type: s.ctaType,
    funnel_stage: s.funnelStage,
    status: "scripted",
    notes: `Commentary batch -- source: ${s.sourceType} (${s.sourceRef}) -- effort: ${s.effort}. Full script in Script Studio.`,
    effort: s.effort,
    topic_tag: "",
    segment: s.sourceType,
  }));

  const scriptRows = COMMENTARY_BATCH.map((s) => ({
    title: s.title,
    pillar: s.pillar,
    content_type: s.contentType,
    angle_or_story_type: s.angle,
    format: s.format,
    body_black: s.bodyBlack,
    body_red: s.bodyRed,
    body_green: s.bodyGreen,
    cta_type: s.ctaType,
    funnel_stage: s.funnelStage,
    status: "draft",
    series_name: s.seriesName ?? "",
    effort: s.effort,
    topic_tag: "",
    segment: s.sourceType,
  }));

  await sql`
    INSERT INTO calendar_items ${sql(
      calendarRows,
      "date",
      "pillar",
      "concept_bucket",
      "content_type",
      "topic",
      "angle",
      "format",
      "cta_type",
      "funnel_stage",
      "status",
      "notes",
      "effort",
      "topic_tag",
      "segment"
    )}
  `;

  await sql`
    INSERT INTO scripts ${sql(
      scriptRows,
      "title",
      "pillar",
      "content_type",
      "angle_or_story_type",
      "format",
      "body_black",
      "body_red",
      "body_green",
      "cta_type",
      "funnel_stage",
      "status",
      "series_name",
      "effort",
      "topic_tag",
      "segment"
    )}
  `;

  await sql`
    INSERT INTO brand_config (key, value) VALUES (${COMMENTARY_BATCH_TAG}, ${JSON.stringify({ seededAt: new Date().toISOString(), count: COMMENTARY_BATCH.length })})
    ON CONFLICT (key) DO NOTHING
  `;

  revalidatePath("/calendar");
  revalidatePath("/scripts");
  revalidatePath("/production");
  revalidatePath("/funnel");
  revalidatePath("/");

  return { alreadySeeded: false as const, count: COMMENTARY_BATCH.length };
}

export async function seedCommentaryBatchAction() {
  await seedCommentaryBatch();
}

// ---------- Segments batch (200 scripts, weekly, continuing from SEGMENTS_START_WEEK) ----------
export async function isSegmentsBatchSeeded(): Promise<boolean> {
  await ensureSchema();
  const rows = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${SEGMENTS_BATCH_TAG}`;
  return rows.length > 0;
}

export async function seedSegmentsBatch() {
  await ensureSchema();
  const already = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${SEGMENTS_BATCH_TAG}`;
  if (already.length > 0) {
    revalidatePath("/calendar");
    return { alreadySeeded: true as const, count: 0 };
  }

  const calendarRows = SEGMENTS_BATCH.map((s) => ({
    date: addDays(BASE_DATE, (SEGMENTS_START_WEEK + s.weekOffset) * 7),
    pillar: s.pillar,
    concept_bucket: s.conceptBucket,
    content_type: s.contentType,
    topic: s.title,
    angle: s.angle,
    format: s.format,
    cta_type: s.ctaType,
    funnel_stage: s.funnelStage,
    status: "scripted",
    notes: `Segments batch -- segment: ${s.segment} -- topic: ${s.topicTag} -- effort: ${s.effort}. Full script in Script Studio.`,
    effort: s.effort,
    topic_tag: s.topicTag,
    segment: s.segment,
  }));

  const scriptRows = SEGMENTS_BATCH.map((s) => ({
    title: s.title,
    pillar: s.pillar,
    content_type: s.contentType,
    angle_or_story_type: s.angle,
    format: s.format,
    body_black: s.bodyBlack,
    body_red: s.bodyRed,
    body_green: s.bodyGreen,
    cta_type: s.ctaType,
    funnel_stage: s.funnelStage,
    status: "draft",
    series_name: s.seriesName ?? "",
    effort: s.effort,
    topic_tag: s.topicTag,
    segment: s.segment,
  }));

  await sql`
    INSERT INTO calendar_items ${sql(
      calendarRows,
      "date",
      "pillar",
      "concept_bucket",
      "content_type",
      "topic",
      "angle",
      "format",
      "cta_type",
      "funnel_stage",
      "status",
      "notes",
      "effort",
      "topic_tag",
      "segment"
    )}
  `;

  await sql`
    INSERT INTO scripts ${sql(
      scriptRows,
      "title",
      "pillar",
      "content_type",
      "angle_or_story_type",
      "format",
      "body_black",
      "body_red",
      "body_green",
      "cta_type",
      "funnel_stage",
      "status",
      "series_name",
      "effort",
      "topic_tag",
      "segment"
    )}
  `;

  await sql`
    INSERT INTO brand_config (key, value) VALUES (${SEGMENTS_BATCH_TAG}, ${JSON.stringify({ seededAt: new Date().toISOString(), count: SEGMENTS_BATCH.length })})
    ON CONFLICT (key) DO NOTHING
  `;

  revalidatePath("/calendar");
  revalidatePath("/scripts");
  revalidatePath("/production");
  revalidatePath("/funnel");
  revalidatePath("/");

  return { alreadySeeded: false as const, count: SEGMENTS_BATCH.length };
}

export async function seedSegmentsBatchAction() {
  await seedSegmentsBatch();
}

// ---------- Backfill effort/topic_tag/segment on already-imported batches ----------
// The effort/topic_tag/segment columns were added after the first 3 batches (oct,
// growth, commentary) were already live in production. This bulk-updates
// already-seeded rows by matching on title (unique across all batches), so
// existing imports pick up the same labels new imports get, without having
// to delete and re-seed them.
const BACKFILL_TAG = "batch_metadata_backfill_v1";

export async function isBackfillDone(): Promise<boolean> {
  await ensureSchema();
  const rows = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${BACKFILL_TAG}`;
  return rows.length > 0;
}

export async function backfillScriptMetadataAction() {
  await ensureSchema();
  const already = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${BACKFILL_TAG}`;
  if (already.length > 0) {
    revalidatePath("/calendar");
    revalidatePath("/scripts");
    return;
  }

  const rows: { title: string; effort: string; topic_tag: string; segment: string }[] = [
    ...[...OCT_2026_BATCH, ...OCT_2026_BATCH_EXT].map((s) => ({
      title: s.title,
      effort: s.effort,
      topic_tag: "Market Entry & Business Consulting",
      segment: "",
    })),
    ...GROWTH_BATCH.map((s) => ({ title: s.title, effort: s.effort, topic_tag: s.subniche, segment: "" })),
    ...COMMENTARY_BATCH.map((s) => ({ title: s.title, effort: s.effort, topic_tag: "", segment: s.sourceType })),
    ...SEGMENTS_BATCH.map((s) => ({ title: s.title, effort: s.effort, topic_tag: s.topicTag, segment: s.segment })),
  ];

  if (rows.length > 0) {
    await sql`
      UPDATE scripts s SET effort = v.effort, topic_tag = v.topic_tag, segment = v.segment
      FROM (VALUES ${sql(rows.map((r) => [r.title, r.effort, r.topic_tag, r.segment]))}) AS v(title, effort, topic_tag, segment)
      WHERE s.title = v.title
    `;
    await sql`
      UPDATE calendar_items c SET effort = v.effort, topic_tag = v.topic_tag, segment = v.segment
      FROM (VALUES ${sql(rows.map((r) => [r.title, r.effort, r.topic_tag, r.segment]))}) AS v(title, effort, topic_tag, segment)
      WHERE c.topic = v.title
    `;
  }

  await sql`
    INSERT INTO brand_config (key, value) VALUES (${BACKFILL_TAG}, ${JSON.stringify({ backfilledAt: new Date().toISOString(), count: rows.length })})
    ON CONFLICT (key) DO NOTHING
  `;

  revalidatePath("/calendar");
  revalidatePath("/scripts");
  revalidatePath("/production");
}

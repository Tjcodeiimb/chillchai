"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "./db";
import { requireUserId } from "./auth";
import { parseCarouselSlides } from "./carousel-text";
import type { CarouselSeed } from "./seed-data/carouselTypes";
import { CAROUSEL_BATCH_1_TAG, CAROUSEL_BATCH_1 } from "./seed-data/carouselBatch1";
import { CAROUSEL_BATCH_2_TAG, CAROUSEL_BATCH_2 } from "./seed-data/carouselBatch2";
import { CAROUSEL_BATCH_3_TAG, CAROUSEL_BATCH_3 } from "./seed-data/carouselBatch3";

function val(fd: FormData, key: string, fallback = "") {
  const v = fd.get(key);
  return v === null || v === "" ? fallback : String(v);
}
function numVal(fd: FormData, key: string, fallback = 0) {
  const v = fd.get(key);
  const n = Number(v);
  return v === null || Number.isNaN(n) ? fallback : n;
}

export async function saveCarouselAction(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();

  const slidesText = String(fd.get("slides_text") || "");
  const slides = parseCarouselSlides(slidesText);
  if (slides.length === 0) return;

  const [carousel] = await sql<{ id: number }[]>`
    INSERT INTO carousels (
      title, pillar, content_type, archetype, cta_type, funnel_stage, status,
      topic_tag, segment, slide_count, background_style, background_category, design_notes, user_id
    ) VALUES (
      ${val(fd, "title", "Untitled carousel")}, ${val(fd, "pillar", "authority")}, ${val(fd, "content_type", "educational")},
      ${val(fd, "archetype", "listicle")}, ${val(fd, "cta_type", "save")}, ${val(fd, "funnel_stage", "tofu")}, 'draft',
      ${val(fd, "topic_tag")}, ${val(fd, "segment")}, ${slides.length}, ${val(fd, "background_style", "solid")},
      ${val(fd, "background_category")}, ${val(fd, "design_notes")}, ${userId}
    ) RETURNING id
  `;

  const slideRows = slides.map((s, i) => ({
    carousel_id: carousel.id,
    slide_number: i + 1,
    slide_role: s.role,
    headline: s.headline,
    supporting_text: s.supportingText,
    user_id: userId,
  }));
  await sql`
    INSERT INTO carousel_slides ${sql(slideRows, "carousel_id", "slide_number", "slide_role", "headline", "supporting_text", "user_id")}
  `;

  revalidatePath("/carousels");
  revalidatePath("/carousel-library");
}

export async function deleteCarouselAction(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM carousels WHERE id = ${numVal(fd, "id")} AND user_id = ${userId}`;
  revalidatePath("/carousels");
  revalidatePath("/carousel-library");
}

export async function updateCarouselStatusAction(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`UPDATE carousels SET status = ${val(fd, "status", "draft")} WHERE id = ${numVal(fd, "id")} AND user_id = ${userId}`;
  revalidatePath("/carousel-library");
}

// ---------- Idempotent content batch seeding (mirrors the script-batch
// pattern in lib/actions.ts: a "already seeded" marker row in brand_config
// per user, keyed by a unique tag per batch) ----------

async function seedCarouselBatch(batch: readonly CarouselSeed[], tag: string) {
  await ensureSchema();
  const userId = await requireUserId();
  const already = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${tag} AND user_id = ${userId}`;
  if (already.length > 0) {
    revalidatePath("/carousel-library");
    return { alreadySeeded: true as const, count: 0 };
  }

  for (const c of batch) {
    const [carousel] = await sql<{ id: number }[]>`
      INSERT INTO carousels (
        title, pillar, content_type, archetype, cta_type, funnel_stage, status,
        topic_tag, segment, slide_count, background_style, background_category, design_notes, user_id
      ) VALUES (
        ${c.title}, ${c.pillar}, ${c.contentType}, ${c.archetype}, ${c.ctaType}, ${c.funnelStage}, 'draft',
        ${c.topicTag}, ${c.segment}, ${c.slides.length}, ${c.backgroundStyle}, ${c.backgroundCategory}, ${c.designNotes}, ${userId}
      ) RETURNING id
    `;
    const slideRows = c.slides.map((s, i) => ({
      carousel_id: carousel.id,
      slide_number: i + 1,
      slide_role: s.role,
      headline: s.headline,
      supporting_text: s.supportingText,
      user_id: userId,
    }));
    await sql`
      INSERT INTO carousel_slides ${sql(slideRows, "carousel_id", "slide_number", "slide_role", "headline", "supporting_text", "user_id")}
    `;
  }

  await sql`
    INSERT INTO brand_config (key, value, user_id) VALUES (${tag}, ${JSON.stringify({ seededAt: new Date().toISOString(), count: batch.length })}, ${userId})
    ON CONFLICT (COALESCE(user_id, 0), key) DO NOTHING
  `;

  revalidatePath("/carousel-library");
  return { alreadySeeded: false as const, count: batch.length };
}

export async function isCarouselBatch1Seeded() {
  await ensureSchema();
  const userId = await requireUserId();
  const rows = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${CAROUSEL_BATCH_1_TAG} AND user_id = ${userId}`;
  return rows.length > 0;
}
export async function isCarouselBatch2Seeded() {
  await ensureSchema();
  const userId = await requireUserId();
  const rows = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${CAROUSEL_BATCH_2_TAG} AND user_id = ${userId}`;
  return rows.length > 0;
}
export async function isCarouselBatch3Seeded() {
  await ensureSchema();
  const userId = await requireUserId();
  const rows = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = ${CAROUSEL_BATCH_3_TAG} AND user_id = ${userId}`;
  return rows.length > 0;
}

export async function seedCarouselBatch1Action() {
  await seedCarouselBatch(CAROUSEL_BATCH_1, CAROUSEL_BATCH_1_TAG);
}
export async function seedCarouselBatch2Action() {
  await seedCarouselBatch(CAROUSEL_BATCH_2, CAROUSEL_BATCH_2_TAG);
}
export async function seedCarouselBatch3Action() {
  await seedCarouselBatch(CAROUSEL_BATCH_3, CAROUSEL_BATCH_3_TAG);
}

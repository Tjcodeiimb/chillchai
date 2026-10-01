"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "./db";
import { splitScriptBlocks, classifyScriptBlocks } from "./bulk-import";

export type BulkImportResult = { imported: number; skipped: number };

export async function bulkImportScriptsAction(_prev: BulkImportResult | null, fd: FormData): Promise<BulkImportResult> {
  await ensureSchema();
  const raw = String(fd.get("raw") || "");
  const blocks = splitScriptBlocks(raw);
  if (blocks.length === 0) return { imported: 0, skipped: 0 };

  // Cap a single import batch so one paste can't trigger an unbounded
  // number of API calls or a runaway prompt size.
  const MAX_BATCH = 50;
  const toImport = blocks.slice(0, MAX_BATCH);
  const skipped = blocks.length - toImport.length;

  const classified = await classifyScriptBlocks(toImport);

  const rows = classified.map((c) => ({
    title: c.title,
    pillar: c.pillar,
    content_type: c.contentType,
    angle_or_story_type: c.angleOrStoryType,
    format: c.format,
    body_black: c.bodyBlack,
    body_red: c.bodyRed,
    body_green: c.bodyGreen,
    cta_type: c.ctaType,
    funnel_stage: c.funnelStage,
    status: "draft",
    series_name: "",
    effort: c.effort,
    topic_tag: c.topicTag,
    segment: c.segment,
  }));

  await sql`
    INSERT INTO scripts ${sql(
      rows,
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

  revalidatePath("/scripts");
  revalidatePath("/library");
  revalidatePath("/production");
  revalidatePath("/funnel");
  revalidatePath("/");

  return { imported: rows.length, skipped };
}

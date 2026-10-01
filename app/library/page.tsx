import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { backfillScriptMetadataAction, isBackfillDone } from "@/lib/actions";
import { Card, SectionHeader, Badge } from "../components/ui";
import LibraryClient from "./LibraryClient";
import BulkImportClient from "../components/BulkImportClient";

// Metadata only -- body_black/body_red/body_green are fetched lazily per
// script on expand (see /api/scripts/[id]/body) instead of being shipped
// for all 1000+ scripts on every page load, which was the single biggest
// contributor to this page's slow load time.
export type LibraryScript = {
  id: number;
  title: string;
  pillar: string;
  content_type: string;
  angle_or_story_type: string;
  format: string;
  cta_type: string;
  funnel_stage: string;
  status: string;
  series_name: string;
  effort: string;
  topic_tag: string;
  segment: string;
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const userId = await requireUserId();
  const [scripts, backfillDone] = await Promise.all([
    sql<LibraryScript[]>`
      SELECT id, title, pillar, content_type, angle_or_story_type, format, cta_type, funnel_stage,
             status, series_name, effort, topic_tag, segment
      FROM scripts WHERE user_id = ${userId} ORDER BY created_at DESC
    `,
    isBackfillDone(),
  ]);

  return (
    <div>
      <SectionHeader
        num="10"
        title="Script Library"
        description="Every script from every batch, in one place -- filter by funnel stage, detail level, topic, and format."
      />

      <details className="mb-6 rounded-2xl border border-border/15 bg-card/40">
        <summary className="cursor-pointer select-none px-5 py-4 font-heading text-lg">Bulk import scripts</summary>
        <div className="px-5 pb-5">
          <BulkImportClient />
        </div>
      </details>

      {!backfillDone && (
        <Card className="mb-6">
          <p className="text-sm text-muted mb-3">
            The detail-level and topic labels were added after some batches were already imported. Run this once to
            backfill those labels onto scripts imported before this page existed -- new imports get them automatically.
          </p>
          <form action={backfillScriptMetadataAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Backfill labels on already-imported scripts
            </button>
          </form>
        </Card>
      )}

      {scripts.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">
            No scripts yet -- import a batch from the{" "}
            <a href="/calendar" className="text-accent underline">
              Calendar
            </a>{" "}
            page, or add one manually in{" "}
            <a href="/scripts" className="text-accent underline">
              Script Studio
            </a>
            .
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Badge tone="accent">{scripts.length} scripts total</Badge>
          </div>
          <LibraryClient scripts={scripts} />
        </>
      )}
    </div>
  );
}

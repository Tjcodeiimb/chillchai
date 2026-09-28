import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { buildCalendarIdeationPrompt } from "@/lib/prompts";
import { SCRIPT_ANGLES, FILMING_FORMATS, CTA_TYPES, FUNNEL_STAGES, CALENDAR_STATUSES, CONCEPT_BUCKETS } from "@/lib/reference";
import {
  createCalendarItem,
  updateCalendarItemStatus,
  deleteCalendarItem,
  seedOctoberBatchAction,
  isOctoberBatchSeeded,
  seedGrowthBatchAction,
  isGrowthBatchSeeded,
  seedCommentaryBatchAction,
  isCommentaryBatchSeeded,
  seedSegmentsBatchAction,
  isSegmentsBatchSeeded,
} from "@/lib/actions";
import { BASE_DATE, OCT_2026_BATCH, OCT_2026_BATCH_EXT } from "@/lib/seed-data/octBatch";
import { GROWTH_BATCH, GROWTH_START_WEEK } from "@/lib/seed-data/growthBatch";
import { COMMENTARY_BATCH, COMMENTARY_START_WEEK } from "@/lib/seed-data/commentaryBatch";
import { SEGMENTS_BATCH, SEGMENTS_START_WEEK } from "@/lib/seed-data/segmentsBatch";
import { Card, SectionHeader, Badge, DeleteForm } from "../components/ui";
import PromptRunner from "../components/PromptRunner";

const FULL_OCT_BATCH = [...OCT_2026_BATCH, ...OCT_2026_BATCH_EXT];

type CalendarItem = {
  id: number;
  date: string;
  pillar: string;
  concept_bucket: string;
  content_type: string;
  topic: string;
  angle: string;
  format: string;
  cta_type: string;
  funnel_stage: string;
  status: string;
  notes: string;
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const [brand, items, octBatchSeeded, growthBatchSeeded, commentaryBatchSeeded, segmentsBatchSeeded] =
    await Promise.all([
      getBrand(),
      sql<CalendarItem[]>`SELECT * FROM calendar_items ORDER BY date ASC`,
      isOctoberBatchSeeded(),
      isGrowthBatchSeeded(),
      isCommentaryBatchSeeded(),
      isSegmentsBatchSeeded(),
    ]);

  const weekDate = (weekOffset: number) => {
    const d = new Date(`${BASE_DATE}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + weekOffset * 7);
    return d.toISOString().slice(0, 10);
  };
  const growthStartDate = weekDate(GROWTH_START_WEEK);
  const commentaryStartDate = weekDate(COMMENTARY_START_WEEK);
  const segmentsStartDate = weekDate(SEGMENTS_START_WEEK);

  const total = items.length;
  const byPillar = (p: string) => items.filter((i) => i.pillar === p).length;
  const byConcept = (c: string) => items.filter((i) => i.concept_bucket === c).length;

  const ideationPrompt = buildCalendarIdeationPrompt(brand, {
    count: 12,
    pillarRatio: brand.pillarRatio,
    conceptRatio: brand.conceptRatio,
  });

  const selectClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";
  const inputClass = selectClass;

  return (
    <div>
      <SectionHeader
        num="02"
        title="Calendar & Batching"
        description="Plan monthly batches, hold yourself to your pillar and concept ratios, and let Gemini propose the next set of topics."
      />

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <h3 className="font-heading text-xl mb-3">Ratio tracker</h3>
          <p className="text-sm text-muted mb-1">
            Pillar — target {brand.pillarRatio.authority}/{brand.pillarRatio.journey}, actual{" "}
            {total ? Math.round((byPillar("authority") / total) * 100) : 0}/
            {total ? Math.round((byPillar("journey") / total) * 100) : 0}
          </p>
          <p className="text-sm text-muted">
            Concept — target {brand.conceptRatio.proven}/{brand.conceptRatio.doubleDown}/{brand.conceptRatio.experimental}, actual{" "}
            {byConcept("proven")}/{byConcept("double_down")}/{byConcept("experimental")} (of {total})
          </p>
          <p className="text-xs text-muted mt-3">
            Posting cadence: {brand.postingCadence.timesPerWeek}x/week · Account status: {brand.accountStatus}
          </p>
        </Card>

        <Card>
          <h3 className="font-heading text-xl mb-3">AI batch ideation</h3>
          <p className="text-xs text-muted mb-3">Proposes topics respecting your current ratios.</p>
          <PromptRunner prompt={ideationPrompt} label="Propose 12 topics" />
        </Card>
      </div>

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-2">Oct 2026 batch: {FULL_OCT_BATCH.length} scripts, ready to schedule</h3>
        <p className="text-xs text-muted mb-3">
          Researched, fully written, and craft-checked against the crisp-script rules on the Master Prompt Library page.
          TOFU {FULL_OCT_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {FULL_OCT_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {FULL_OCT_BATCH.filter((s) => s.funnelStage === "bofu").length} · effort low{" "}
          {FULL_OCT_BATCH.filter((s) => s.effort === "low").length} / default{" "}
          {FULL_OCT_BATCH.filter((s) => s.effort === "default").length} / high{" "}
          {FULL_OCT_BATCH.filter((s) => s.effort === "high").length} · includes the 5-part &quot;How to Enter an
          Industry&quot; series · scheduled weekly starting {BASE_DATE}.
        </p>
        {octBatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedOctoberBatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import Oct 2026 batch ({FULL_OCT_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-2">Growth batch: {GROWTH_BATCH.length} scripts across every sub-niche</h3>
        <p className="text-xs text-muted mb-3">
          A deliberate ratio, not a guess: TOFU {GROWTH_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {GROWTH_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {GROWTH_BATCH.filter((s) => s.funnelStage === "bofu").length} · effort low{" "}
          {GROWTH_BATCH.filter((s) => s.effort === "low").length} / default{" "}
          {GROWTH_BATCH.filter((s) => s.effort === "default").length} / high{" "}
          {GROWTH_BATCH.filter((s) => s.effort === "high").length} · educational{" "}
          {GROWTH_BATCH.filter((s) => s.contentType === "educational").length} / authority{" "}
          {GROWTH_BATCH.filter((s) => s.contentType === "authority").length} (storytelling left for you) · every one of
          the 9 sub-niches + the core niche gets exactly 10 scripts · 3 new signature series (&quot;Psychology of
          Buying&quot;, &quot;Founder Finance 101&quot;, &quot;Consulting Insider&quot;) · scheduled weekly starting{" "}
          {growthStartDate}, continuing right after the Oct 2026 batch.
        </p>
        {growthBatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedGrowthBatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import growth batch ({GROWTH_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-2">Commentary batch: {COMMENTARY_BATCH.length} scripts, 11 source-formats</h3>
        <p className="text-xs text-muted mb-3">
          &quot;X said this in their book/interview -- here&apos;s my take,&quot; expanded into 11 distinct formats so it
          never reads as one repeated template: book concepts, interview themes, research studies, historical business
          cases, contrarian takes, two-thinkers-disagree, a concept through one of your own deals, quote deconstructions,
          shareholder-letter reactions, podcast/documentary reactions, and old-proverb-vs-modern-data. TOFU{" "}
          {COMMENTARY_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {COMMENTARY_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {COMMENTARY_BATCH.filter((s) => s.funnelStage === "bofu").length} · effort default-heavy since context-setting
          takes real setup · scheduled weekly starting {commentaryStartDate}, continuing right after the growth batch.
        </p>
        {commentaryBatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedCommentaryBatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import commentary batch ({COMMENTARY_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-2">Segments batch: {SEGMENTS_BATCH.length} scripts, 20 new formats</h3>
        <p className="text-xs text-muted mb-3">
          20 new content-format segments beyond the original 7 script angles and the 11 commentary source-types --
          rank &amp; tier lists, rapid-fire myth vs reality, behind-the-scenes process reveals, anonymized client story
          breakdowns, surprising stat reveals, objection roleplay, checklist walkthroughs, prediction/trend calls,
          unpopular opinions, ELI5, day-in-the-life POV, pre-decision warnings, AI-tool reactions, client Q&amp;A rapid
          fire, resource-tier thought experiments, red-flag spotting, one-chart explainers, founder voice-memo
          reflections, compare-3-live, and unit-economics math -- 10 scripts each. TOFU{" "}
          {SEGMENTS_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {SEGMENTS_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {SEGMENTS_BATCH.filter((s) => s.funnelStage === "bofu").length} · scheduled weekly starting{" "}
          {segmentsStartDate}, continuing right after the commentary batch. Use the{" "}
          <a href="/library" className="text-accent underline">
            Script Library
          </a>{" "}
          to browse and filter every batch together once imported.
        </p>
        {segmentsBatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedSegmentsBatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import segments batch ({SEGMENTS_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-4">Add to calendar</h3>
        <form action={createCalendarItem} className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="text-xs text-muted block mb-1">Date</label>
            <input required type="date" name="date" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Pillar</label>
            <select name="pillar" className={selectClass} defaultValue="authority">
              <option value="authority">Authority</option>
              <option value="journey">Journey</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Concept bucket</label>
            <select name="concept_bucket" className={selectClass} defaultValue="proven">
              {CONCEPT_BUCKETS.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs text-muted block mb-1">Topic</label>
            <input name="topic" className={inputClass} placeholder="e.g. 3 mistakes founders make entering a new market" />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Content type</label>
            <select name="content_type" className={selectClass} defaultValue="educational">
              <option value="educational">Educational</option>
              <option value="storytelling">Storytelling</option>
              <option value="authority">Authority / transformation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Script angle</label>
            <select name="angle" className={selectClass} defaultValue="">
              <option value="">—</option>
              {SCRIPT_ANGLES.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Filming format</label>
            <select name="format" className={selectClass} defaultValue="">
              <option value="">—</option>
              {FILMING_FORMATS.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">CTA</label>
            <select name="cta_type" className={selectClass} defaultValue="follow">
              {CTA_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Funnel stage</label>
            <select name="funnel_stage" className={selectClass} defaultValue="tofu">
              {FUNNEL_STAGES.map((f) => (
                <option key={f} value={f}>
                  {f.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Status</label>
            <select name="status" className={selectClass} defaultValue="idea">
              {CALENDAR_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs text-muted block mb-1">Notes</label>
            <textarea name="notes" rows={2} className={inputClass} />
          </div>

          <div className="md:col-span-3">
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Add to calendar
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl">Batch ({items.length})</h3>
          <a
            href="/api/export/calendar"
            className="text-xs rounded-full border border-border/20 px-3 py-1.5 hover:bg-foreground/5"
          >
            Export to Word
          </a>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted">Nothing planned yet — add your first item above.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-border/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm text-muted mr-3">{item.date}</span>
                    <span className="text-sm font-medium">{item.topic || "(untitled topic)"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{item.pillar}</Badge>
                    <Badge>{item.content_type}</Badge>
                    <Badge tone="accent">{item.concept_bucket.replace("_", " ")}</Badge>
                    <Badge>{item.funnel_stage.toUpperCase()}</Badge>
                  </div>
                </div>
                {(item.angle || item.format || item.notes) && (
                  <p className="text-xs text-muted mt-2">
                    {[item.angle, item.format, item.notes].filter(Boolean).join(" · ")}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <form action={updateCalendarItemStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <select name="status" defaultValue={item.status} className="rounded-full border border-border/15 bg-foreground/95 text-background text-xs px-2 py-1">
                      {CALENDAR_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button className="text-xs rounded-full border border-border/20 px-2.5 py-1 hover:bg-foreground/5">Update</button>
                  </form>
                  <DeleteForm action={deleteCalendarItem} id={item.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

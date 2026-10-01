import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { requireUserId } from "@/lib/auth";
import { buildCalendarIdeationPrompt } from "@/lib/prompts";
import { SCRIPT_ANGLES, FILMING_FORMATS, CTA_TYPES, FUNNEL_STAGES, CALENDAR_STATUSES, CONCEPT_BUCKETS } from "@/lib/reference";
import {
  createCalendarItem,
  seedOctoberBatchAction,
  isOctoberBatchSeeded,
  seedGrowthBatchAction,
  isGrowthBatchSeeded,
  seedCommentaryBatchAction,
  isCommentaryBatchSeeded,
  seedSegmentsBatchAction,
  isSegmentsBatchSeeded,
  seedNewCategoriesBatchAction,
  isNewCategoriesBatchSeeded,
  seedNewCategories2BatchAction,
  isNewCategories2BatchSeeded,
  seedNewCategories3BatchAction,
  isNewCategories3BatchSeeded,
  seedNewCategories4BatchAction,
  isNewCategories4BatchSeeded,
  seedNewCategories5BatchAction,
  isNewCategories5BatchSeeded,
  seedNewCategories6BatchAction,
  isNewCategories6BatchSeeded,
  seedJourneyBatchAction,
  isJourneyBatchSeeded,
  seedCategories7BatchAction,
  isCategories7BatchSeeded,
  seedCategories8BatchAction,
  isCategories8BatchSeeded,
  seedCategories9BatchAction,
  isCategories9BatchSeeded,
} from "@/lib/actions";
import { BASE_DATE, OCT_2026_BATCH, OCT_2026_BATCH_EXT } from "@/lib/seed-data/octBatch";
import { GROWTH_BATCH, GROWTH_START_WEEK } from "@/lib/seed-data/growthBatch";
import { COMMENTARY_BATCH, COMMENTARY_START_WEEK } from "@/lib/seed-data/commentaryBatch";
import { SEGMENTS_BATCH, SEGMENTS_START_WEEK } from "@/lib/seed-data/segmentsBatch";
import { NEW_CATEGORIES_BATCH, NEW_CATEGORIES_START_WEEK } from "@/lib/seed-data/newCategoriesBatch";
import { NEW_CATEGORIES_2_BATCH, NEW_CATEGORIES_2_START_WEEK } from "@/lib/seed-data/newCategoriesBatch2";
import { NEW_CATEGORIES_3_BATCH, NEW_CATEGORIES_3_START_WEEK } from "@/lib/seed-data/newCategoriesBatch3";
import { NEW_CATEGORIES_4_BATCH, NEW_CATEGORIES_4_START_WEEK } from "@/lib/seed-data/newCategoriesBatch4";
import { NEW_CATEGORIES_5_BATCH, NEW_CATEGORIES_5_START_WEEK } from "@/lib/seed-data/newCategoriesBatch5";
import { NEW_CATEGORIES_6_BATCH, NEW_CATEGORIES_6_START_WEEK } from "@/lib/seed-data/newCategoriesBatch6";
import { JOURNEY_BATCH, JOURNEY_START_WEEK } from "@/lib/seed-data/journeyBatch";
import { CATEGORIES_7_BATCH, CATEGORIES_7_START_WEEK } from "@/lib/seed-data/categoriesBatch7";
import { CATEGORIES_8_BATCH, CATEGORIES_8_START_WEEK } from "@/lib/seed-data/categoriesBatch8";
import { CATEGORIES_9_BATCH, CATEGORIES_9_START_WEEK } from "@/lib/seed-data/categoriesBatch9";
import { Card, SectionHeader, Badge } from "../components/ui";
import PromptRunner from "../components/PromptRunner";
import CalendarClient, { type CalendarItem, type PickerScript, ResetCalendarButton } from "./CalendarClient";

const FULL_OCT_BATCH = [...OCT_2026_BATCH, ...OCT_2026_BATCH_EXT];

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const userId = await requireUserId();
  const [
    brand,
    items,
    scripts,
    octBatchSeeded,
    growthBatchSeeded,
    commentaryBatchSeeded,
    segmentsBatchSeeded,
    newCategoriesBatchSeeded,
    newCategories2BatchSeeded,
    newCategories3BatchSeeded,
    newCategories4BatchSeeded,
    newCategories5BatchSeeded,
    newCategories6BatchSeeded,
    journeyBatchSeeded,
    categories7BatchSeeded,
    categories8BatchSeeded,
    categories9BatchSeeded,
  ] = await Promise.all([
    getBrand(userId),
    sql<CalendarItem[]>`SELECT * FROM calendar_items WHERE user_id = ${userId} ORDER BY date ASC`,
    sql<PickerScript[]>`SELECT id, title, funnel_stage, topic_tag, effort FROM scripts WHERE user_id = ${userId} ORDER BY title ASC`,
    isOctoberBatchSeeded(),
    isGrowthBatchSeeded(),
    isCommentaryBatchSeeded(),
    isSegmentsBatchSeeded(),
    isNewCategoriesBatchSeeded(),
    isNewCategories2BatchSeeded(),
    isNewCategories3BatchSeeded(),
    isNewCategories4BatchSeeded(),
    isNewCategories5BatchSeeded(),
    isNewCategories6BatchSeeded(),
    isJourneyBatchSeeded(),
    isCategories7BatchSeeded(),
    isCategories8BatchSeeded(),
    isCategories9BatchSeeded(),
  ]);

  const weekDate = (weekOffset: number) => {
    const d = new Date(`${BASE_DATE}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + weekOffset * 7);
    return d.toISOString().slice(0, 10);
  };
  const growthStartDate = weekDate(GROWTH_START_WEEK);
  const commentaryStartDate = weekDate(COMMENTARY_START_WEEK);
  const segmentsStartDate = weekDate(SEGMENTS_START_WEEK);
  const newCategoriesStartDate = weekDate(NEW_CATEGORIES_START_WEEK);
  const newCategories2StartDate = weekDate(NEW_CATEGORIES_2_START_WEEK);
  const newCategories3StartDate = weekDate(NEW_CATEGORIES_3_START_WEEK);
  const newCategories4StartDate = weekDate(NEW_CATEGORIES_4_START_WEEK);
  const newCategories5StartDate = weekDate(NEW_CATEGORIES_5_START_WEEK);
  const newCategories6StartDate = weekDate(NEW_CATEGORIES_6_START_WEEK);
  const journeyStartDate = weekDate(JOURNEY_START_WEEK);
  const categories7StartDate = weekDate(CATEGORIES_7_START_WEEK);
  const categories8StartDate = weekDate(CATEGORIES_8_START_WEEK);
  const categories9StartDate = weekDate(CATEGORIES_9_START_WEEK);

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

      <details className="mb-8 rounded-2xl border border-border/15 bg-card/40">
        <summary className="cursor-pointer select-none px-5 py-4 font-heading text-xl flex items-center justify-between">
          <span>Import content batches</span>
          <span className="text-xs text-muted font-sans font-normal">
            {[
              octBatchSeeded,
              growthBatchSeeded,
              commentaryBatchSeeded,
              segmentsBatchSeeded,
              newCategoriesBatchSeeded,
              newCategories2BatchSeeded,
              newCategories3BatchSeeded,
              newCategories4BatchSeeded,
              newCategories5BatchSeeded,
              newCategories6BatchSeeded,
              journeyBatchSeeded,
              categories7BatchSeeded,
              categories8BatchSeeded,
              categories9BatchSeeded,
            ].filter(Boolean).length} of 14 imported
          </span>
        </summary>
        <div className="px-5 pb-5 space-y-5">
      <Card className="mb-0">
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

      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-2">
          New categories batch: {NEW_CATEGORIES_BATCH.length} scripts, Phase 1 of ongoing coverage expansion
        </h3>
        <p className="text-xs text-muted mb-3">
          7 new sub-categories beyond the original 9 brand sub-niches: Negotiation &amp; Deal-Making, Leadership &amp;
          Team Management, Client Relationship Management, Personal Branding for Consultants, Sales &amp; Closing
          Technique, Time Management &amp; Productivity Systems, and Data-Driven Decision Making -- 4 scripts each.
          Deliberately small: the first of several planned phases, not a one-shot attempt at full coverage. TOFU{" "}
          {NEW_CATEGORIES_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {NEW_CATEGORIES_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {NEW_CATEGORIES_BATCH.filter((s) => s.funnelStage === "bofu").length} · scheduled weekly starting{" "}
          {newCategoriesStartDate}, continuing right after the segments batch.
        </p>
        {newCategoriesBatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedNewCategoriesBatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import new categories batch ({NEW_CATEGORIES_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-2">
          New categories batch, Phase 2: {NEW_CATEGORIES_2_BATCH.length} scripts, 7 more sub-categories
        </h3>
        <p className="text-xs text-muted mb-3">
          Continuing the coverage expansion: Networking &amp; Relationship Building, Public Speaking &amp; Presentation
          Skills, Legal &amp; Contract Fundamentals, Fundraising &amp; Investor Relations, Operations &amp; Process
          Systems, Competitive Strategy &amp; Positioning, and Mental Resilience &amp; Performance -- 4 scripts each.
          TOFU {NEW_CATEGORIES_2_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {NEW_CATEGORIES_2_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {NEW_CATEGORIES_2_BATCH.filter((s) => s.funnelStage === "bofu").length} · scheduled weekly starting{" "}
          {newCategories2StartDate}, continuing right after Phase 1.
        </p>
        {newCategories2BatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedNewCategories2BatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import new categories batch, Phase 2 ({NEW_CATEGORIES_2_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-2">
          New categories batch, Phase 3: {NEW_CATEGORIES_3_BATCH.length} scripts, 7 more sub-categories
        </h3>
        <p className="text-xs text-muted mb-3">
          Continuing the coverage expansion: Pricing Strategy &amp; Value-Based Fees, Market Entry Risk Assessment,
          Cross-Cultural Business Communication, Financial Modeling &amp; Unit Economics, Hiring &amp; Team Building
          for Founders, Crisis Management &amp; Pivoting, and Brand Positioning &amp; Messaging Strategy -- 4 scripts
          each. TOFU {NEW_CATEGORIES_3_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {NEW_CATEGORIES_3_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {NEW_CATEGORIES_3_BATCH.filter((s) => s.funnelStage === "bofu").length} · scheduled weekly starting{" "}
          {newCategories3StartDate}, continuing right after Phase 2.
        </p>
        {newCategories3BatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedNewCategories3BatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import new categories batch, Phase 3 ({NEW_CATEGORIES_3_BATCH.length} scripts)
            </button>
          </form>
        )}

      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-2">
          New categories batch, Phase 4: {NEW_CATEGORIES_4_BATCH.length} scripts, 7 more sub-categories
        </h3>
        <p className="text-xs text-muted mb-3">
          Continuing the coverage expansion: Customer Onboarding &amp; Retention Systems, Email &amp; Outreach Copywriting, Vendor &amp; Supplier Negotiation, Exit Planning &amp; Business Valuation, Board &amp; Advisor Management, Product-Market Fit Validation, and Cash Flow Management for Founders -- 4 scripts
          each. TOFU {NEW_CATEGORIES_4_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {NEW_CATEGORIES_4_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {NEW_CATEGORIES_4_BATCH.filter((s) => s.funnelStage === "bofu").length} · scheduled weekly starting{" "}
          {newCategories4StartDate}, continuing right after Phase 3.
        </p>
        {newCategories4BatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedNewCategories4BatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import new categories batch, Phase 4 ({NEW_CATEGORIES_4_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-2">
          New categories batch, Phase 5: {NEW_CATEGORIES_5_BATCH.length} scripts, 7 more sub-categories
        </h3>
        <p className="text-xs text-muted mb-3">
          Continuing the coverage expansion: Go-to-Market Strategy Design, Content Marketing for B2B, Referral &amp; Word-of-Mouth Systems, Regulatory &amp; Compliance Navigation, Remote Team Culture &amp; Communication, Strategic Partnerships &amp; Joint Ventures, and Managing Scope Creep -- 4 scripts
          each. TOFU {NEW_CATEGORIES_5_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {NEW_CATEGORIES_5_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {NEW_CATEGORIES_5_BATCH.filter((s) => s.funnelStage === "bofu").length} · scheduled weekly starting{" "}
          {newCategories5StartDate}, continuing right after Phase 4.
        </p>
        {newCategories5BatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedNewCategories5BatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import new categories batch, Phase 5 ({NEW_CATEGORIES_5_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-2">
          New categories batch, Phase 6: {NEW_CATEGORIES_6_BATCH.length} scripts, 7 more sub-categories
        </h3>
        <p className="text-xs text-muted mb-3">
          Continuing the coverage expansion: Customer Segmentation &amp; Targeting, Founder Time Audits &amp; Delegation, Investor Updates &amp; Reporting, Building Case Studies &amp; Social Proof, Automating Repetitive Business Tasks, Founder Wellbeing &amp; Sustainable Pace, and Long-Term Strategic Planning -- 4 scripts
          each. TOFU {NEW_CATEGORIES_6_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {NEW_CATEGORIES_6_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {NEW_CATEGORIES_6_BATCH.filter((s) => s.funnelStage === "bofu").length} · scheduled weekly starting{" "}
          {newCategories6StartDate}, continuing right after Phase 5.
        </p>
        {newCategories6BatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedNewCategories6BatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import new categories batch, Phase 6 ({NEW_CATEGORIES_6_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-2">
          Journey/storytelling gap-fill batch: {JOURNEY_BATCH.length} scripts across all 7 story types
        </h3>
        <p className="text-xs text-muted mb-3">
          The journey pillar had only 5 scripts total out of 563 (vs 558 in authority), with 4 of 7 story types at
          zero. This batch covers My Story, Win Story, Loss Story, Lesson Story, Transformation Story, Challenge
          Story, and Big Goal / Dream Journey -- 5-7 scripts each, bringing journey to a comparable floor with every
          other topic. TOFU {JOURNEY_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {JOURNEY_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {JOURNEY_BATCH.filter((s) => s.funnelStage === "bofu").length} · scheduled weekly starting{" "}
          {journeyStartDate}, continuing right after Phase 6.
        </p>
        {journeyBatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedJourneyBatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import journey gap-fill batch ({JOURNEY_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-2">
          Equal-division top-up, Phase 7: {CATEGORIES_7_BATCH.length} scripts across 14 categories
        </h3>
        <p className="text-xs text-muted mb-3">
          Bringing 42 established sub-categories from 4 scripts each toward a shared, higher floor so the library
          totals exactly 1000. This phase covers the first 14 categories at 10 more scripts each (4 &rarr; 14).
          TOFU {CATEGORIES_7_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {CATEGORIES_7_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {CATEGORIES_7_BATCH.filter((s) => s.funnelStage === "bofu").length} &middot; scheduled weekly starting{" "}
          {categories7StartDate}.
        </p>
        {categories7BatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedCategories7BatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import equal-division batch, Phase 7 ({CATEGORIES_7_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-2">
          Equal-division top-up, Phase 8: {CATEGORIES_8_BATCH.length} scripts across 14 categories
        </h3>
        <p className="text-xs text-muted mb-3">
          Continuing toward exactly 1000 scripts. This phase covers 14 more categories: 4 at 10 more scripts each
          (4 &rarr; 14) and 10 at 9 more scripts each (4 &rarr; 13). TOFU{" "}
          {CATEGORIES_8_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {CATEGORIES_8_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {CATEGORIES_8_BATCH.filter((s) => s.funnelStage === "bofu").length} &middot; scheduled weekly starting{" "}
          {categories8StartDate}.
        </p>
        {categories8BatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedCategories8BatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import equal-division batch, Phase 8 ({CATEGORIES_8_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>

      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-2">
          Equal-division top-up, Phase 9 (final): {CATEGORIES_9_BATCH.length} scripts across 14 categories
        </h3>
        <p className="text-xs text-muted mb-3">
          The final phase, completing the equal-division top-up across all 42 established sub-categories -- this
          brings the library to exactly 1000 scripts. 14 more categories at 9 more scripts each (4 &rarr; 13).
          TOFU {CATEGORIES_9_BATCH.filter((s) => s.funnelStage === "tofu").length} / MOFU{" "}
          {CATEGORIES_9_BATCH.filter((s) => s.funnelStage === "mofu").length} / BOFU{" "}
          {CATEGORIES_9_BATCH.filter((s) => s.funnelStage === "bofu").length} &middot; scheduled weekly starting{" "}
          {categories9StartDate}.
        </p>
        {categories9BatchSeeded ? (
          <Badge tone="accent">Imported -- see the batch below and in Script Studio</Badge>
        ) : (
          <form action={seedCategories9BatchAction}>
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Import equal-division batch, Phase 9 ({CATEGORIES_9_BATCH.length} scripts)
            </button>
          </form>
        )}
      </Card>
      </Card>
        </div>
      </details>

      <details className="mb-8 rounded-2xl border border-border/15 bg-card/40">
        <summary className="cursor-pointer select-none px-5 py-4 font-heading text-xl">Add a single item manually</summary>
        <div className="px-5 pb-5">
      <Card className="mb-0">
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
        </div>
      </details>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl">Your calendar</h3>
        <a
          href="/api/export/calendar"
          className="text-xs rounded-full border border-border/20 px-3 py-1.5 hover:bg-foreground/5"
        >
          Export to Word
        </a>
      </div>

      <CalendarClient items={items} scripts={scripts} />

      <details className="mt-8 rounded-2xl border border-red-400/20 bg-card/40">
        <summary className="cursor-pointer select-none px-5 py-4 font-heading text-lg text-red-400/80">
          Danger zone: reset calendar
        </summary>
        <div className="px-5 pb-5">
          <p className="text-xs text-muted mb-3">
            Clears every scheduled date from the calendar above. Your {scripts.length} scripts in the Script Library
            are never touched -- you can re-schedule any of them onto new dates right after.
          </p>
          <ResetCalendarButton itemCount={items.length} />
        </div>
      </details>
    </div>
  );
}

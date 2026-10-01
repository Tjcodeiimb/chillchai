"use client";

import { useMemo, useState } from "react";
import { Card, Badge } from "../components/ui";
import { scheduleScriptToCalendar } from "@/lib/actions";
import type { LibraryScript } from "./page";

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

const ALL = "__all__";

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-muted block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5"
      >
        <option value={ALL}>All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

type Body = { body_black: string; body_red: string; body_green: string };

export default function LibraryClient({ scripts }: { scripts: LibraryScript[] }) {
  const [funnel, setFunnel] = useState(ALL);
  const [effort, setEffort] = useState(ALL);
  const [topicTag, setTopicTag] = useState(ALL);
  const [segment, setSegment] = useState(ALL);
  const [contentType, setContentType] = useState(ALL);
  const [pillar, setPillar] = useState(ALL);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [bodies, setBodies] = useState<Record<number, Body | "loading">>({});

  async function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!bodies[id]) {
      setBodies((b) => ({ ...b, [id]: "loading" }));
      const res = await fetch(`/api/scripts/${id}/body`);
      const body = (await res.json()) as Body;
      setBodies((b) => ({ ...b, [id]: body }));
    }
  }

  const funnelOptions = useMemo(() => uniqueSorted(scripts.map((s) => s.funnel_stage)), [scripts]);
  const effortOptions = useMemo(() => uniqueSorted(scripts.map((s) => s.effort)), [scripts]);
  const topicOptions = useMemo(() => uniqueSorted(scripts.map((s) => s.topic_tag)), [scripts]);
  const segmentOptions = useMemo(() => uniqueSorted(scripts.map((s) => s.segment)), [scripts]);
  const contentTypeOptions = useMemo(() => uniqueSorted(scripts.map((s) => s.content_type)), [scripts]);
  const pillarOptions = useMemo(() => uniqueSorted(scripts.map((s) => s.pillar)), [scripts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scripts.filter((s) => {
      if (funnel !== ALL && s.funnel_stage !== funnel) return false;
      if (effort !== ALL && s.effort !== effort) return false;
      if (topicTag !== ALL && s.topic_tag !== topicTag) return false;
      if (segment !== ALL && s.segment !== segment) return false;
      if (contentType !== ALL && s.content_type !== contentType) return false;
      if (pillar !== ALL && s.pillar !== pillar) return false;
      if (q && !s.title.toLowerCase().includes(q) && !s.angle_or_story_type.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [scripts, funnel, effort, topicTag, segment, contentType, pillar, search]);

  // Keying the results list on the filter combination below remounts it
  // (resetting its internal page count to 1) whenever a filter changes,
  // without needing an effect or a ref read during render.
  const filterKey = `${funnel}|${effort}|${topicTag}|${segment}|${contentType}|${pillar}|${search}`;

  const resetFilters = () => {
    setFunnel(ALL);
    setEffort(ALL);
    setTopicTag(ALL);
    setSegment(ALL);
    setContentType(ALL);
    setPillar(ALL);
    setSearch("");
  };

  return (
    <div>
      <Card className="mb-6">
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          <Select label="Funnel stage" value={funnel} options={funnelOptions} onChange={setFunnel} />
          <Select label="Detail level" value={effort} options={effortOptions} onChange={setEffort} />
          <Select label="Topic" value={topicTag} options={topicOptions} onChange={setTopicTag} />
          <Select label="Segment / type" value={segment} options={segmentOptions} onChange={setSegment} />
          <Select label="Content type" value={contentType} options={contentTypeOptions} onChange={setContentType} />
          <Select label="Pillar" value={pillar} options={pillarOptions} onChange={setPillar} />
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or angle..."
            className="flex-1 rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5"
          />
          <button
            onClick={resetFilters}
            className="text-xs rounded-full border border-border/20 px-3 py-1.5 hover:bg-foreground/5 whitespace-nowrap"
          >
            Reset filters
          </button>
        </div>
      </Card>

      <ResultsList
        key={filterKey}
        filtered={filtered}
        total={scripts.length}
        expandedId={expandedId}
        bodies={bodies}
        toggleExpand={toggleExpand}
      />
    </div>
  );
}

function ResultsList({
  filtered,
  total,
  expandedId,
  bodies,
  toggleExpand,
}: {
  filtered: LibraryScript[];
  total: number;
  expandedId: number | null;
  bodies: Record<number, Body | "loading">;
  toggleExpand: (id: number) => void;
}) {
  const PAGE_SIZE = 40;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = filtered.slice(0, visibleCount);

  return (
    <>
      <p className="text-xs text-muted mb-3">
        Showing {visible.length} of {filtered.length} matching scripts ({total} total)
      </p>

      <div className="space-y-2">
        {visible.map((s) => {
          const expanded = expandedId === s.id;
          return (
            <div key={s.id} className="rounded-lg border border-border/10 p-3">
              <button
                onClick={() => toggleExpand(s.id)}
                className="w-full text-left flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-sm font-medium">{s.title}</span>
                <span className="flex flex-wrap gap-1.5 shrink-0">
                  <Badge tone={s.funnel_stage === "bofu" ? "accent" : "default"}>{s.funnel_stage.toUpperCase()}</Badge>
                  <Badge>{s.effort}</Badge>
                  {s.segment && <Badge>{s.segment}</Badge>}
                  {s.topic_tag && <Badge>{s.topic_tag}</Badge>}
                  {s.series_name && <Badge tone="accent">{s.series_name}</Badge>}
                </span>
              </button>
              {expanded && (
                <div className="mt-3 text-xs text-muted space-y-2 border-t border-border/10 pt-3">
                  <p>
                    <span className="text-foreground/70">Pillar:</span> {s.pillar} ·{" "}
                    <span className="text-foreground/70">Content type:</span> {s.content_type} ·{" "}
                    <span className="text-foreground/70">Angle:</span> {s.angle_or_story_type} ·{" "}
                    <span className="text-foreground/70">Format:</span> {s.format} ·{" "}
                    <span className="text-foreground/70">CTA:</span> {s.cta_type}
                  </p>
                  {bodies[s.id] === "loading" || !bodies[s.id] ? (
                    <p className="text-muted">Loading script...</p>
                  ) : (
                    <>
                      <p className="text-foreground/70">BLACK (spoken):</p>
                      <p className="whitespace-pre-line">{(bodies[s.id] as Body).body_black}</p>
                      <p className="text-foreground/70">RED (camera/action):</p>
                      <p className="whitespace-pre-line">{(bodies[s.id] as Body).body_red}</p>
                      <p className="text-foreground/70">GREEN (editing):</p>
                      <p className="whitespace-pre-line">{(bodies[s.id] as Body).body_green}</p>
                    </>
                  )}
                  <form action={scheduleScriptToCalendar} className="flex items-center gap-2 pt-2">
                    <input type="hidden" name="script_id" value={s.id} />
                    <label className="text-foreground/70">Add to calendar:</label>
                    <input
                      required
                      type="date"
                      name="date"
                      className="rounded-lg border border-border/15 bg-foreground/95 text-background text-xs p-1.5"
                    />
                    <button className="text-xs rounded-full bg-accent text-accent-deep font-medium px-3 py-1.5">
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted">No scripts match these filters.</p>}
      </div>
      {visibleCount < filtered.length && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-4 w-full text-sm rounded-full border border-border/20 px-4 py-2.5 hover:bg-foreground/5"
        >
          Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more (
          {filtered.length - visibleCount} remaining)
        </button>
      )}
    </>
  );
}

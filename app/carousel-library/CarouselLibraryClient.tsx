"use client";

import { useMemo, useState } from "react";
import { Card, Badge } from "../components/ui";
import type { LibraryCarousel } from "./page";

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

type Slide = { slide_number: number; slide_role: string; headline: string; supporting_text: string };

export default function CarouselLibraryClient({ carousels }: { carousels: LibraryCarousel[] }) {
  const [archetype, setArchetype] = useState(ALL);
  const [funnel, setFunnel] = useState(ALL);
  const [topicTag, setTopicTag] = useState(ALL);
  const [backgroundStyle, setBackgroundStyle] = useState(ALL);
  const [pillar, setPillar] = useState(ALL);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [slidesById, setSlidesById] = useState<Record<number, Slide[] | "loading">>({});

  async function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!slidesById[id]) {
      setSlidesById((s) => ({ ...s, [id]: "loading" }));
      const res = await fetch(`/api/carousels/${id}/slides`);
      const data = await res.json();
      setSlidesById((s) => ({ ...s, [id]: data.slides }));
    }
  }

  const archetypeOptions = useMemo(() => uniqueSorted(carousels.map((c) => c.archetype)), [carousels]);
  const funnelOptions = useMemo(() => uniqueSorted(carousels.map((c) => c.funnel_stage)), [carousels]);
  const topicOptions = useMemo(() => uniqueSorted(carousels.map((c) => c.topic_tag)), [carousels]);
  const backgroundOptions = useMemo(() => uniqueSorted(carousels.map((c) => c.background_style)), [carousels]);
  const pillarOptions = useMemo(() => uniqueSorted(carousels.map((c) => c.pillar)), [carousels]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return carousels.filter((c) => {
      if (archetype !== ALL && c.archetype !== archetype) return false;
      if (funnel !== ALL && c.funnel_stage !== funnel) return false;
      if (topicTag !== ALL && c.topic_tag !== topicTag) return false;
      if (backgroundStyle !== ALL && c.background_style !== backgroundStyle) return false;
      if (pillar !== ALL && c.pillar !== pillar) return false;
      if (q && !c.title.toLowerCase().includes(q) && !c.topic_tag.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [carousels, archetype, funnel, topicTag, backgroundStyle, pillar, search]);

  const filterKey = `${archetype}|${funnel}|${topicTag}|${backgroundStyle}|${pillar}|${search}`;

  const resetFilters = () => {
    setArchetype(ALL);
    setFunnel(ALL);
    setTopicTag(ALL);
    setBackgroundStyle(ALL);
    setPillar(ALL);
    setSearch("");
  };

  return (
    <div>
      <Card className="mb-6">
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          <Select label="Archetype" value={archetype} options={archetypeOptions} onChange={setArchetype} />
          <Select label="Funnel stage" value={funnel} options={funnelOptions} onChange={setFunnel} />
          <Select label="Topic" value={topicTag} options={topicOptions} onChange={setTopicTag} />
          <Select label="Background style" value={backgroundStyle} options={backgroundOptions} onChange={setBackgroundStyle} />
          <Select label="Pillar" value={pillar} options={pillarOptions} onChange={setPillar} />
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or topic..."
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
        total={carousels.length}
        expandedId={expandedId}
        slidesById={slidesById}
        toggleExpand={toggleExpand}
      />
    </div>
  );
}

function ResultsList({
  filtered,
  total,
  expandedId,
  slidesById,
  toggleExpand,
}: {
  filtered: LibraryCarousel[];
  total: number;
  expandedId: number | null;
  slidesById: Record<number, Slide[] | "loading">;
  toggleExpand: (id: number) => void;
}) {
  const PAGE_SIZE = 40;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = filtered.slice(0, visibleCount);

  return (
    <>
      <p className="text-xs text-muted mb-3">
        Showing {visible.length} of {filtered.length} matching carousels ({total} total)
      </p>

      <div className="space-y-2">
        {visible.map((c) => {
          const expanded = expandedId === c.id;
          const slides = slidesById[c.id];
          return (
            <div key={c.id} className="rounded-lg border border-border/10 p-3">
              <button
                onClick={() => toggleExpand(c.id)}
                className="w-full text-left flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-sm font-medium">{c.title}</span>
                <span className="flex flex-wrap gap-1.5 shrink-0">
                  <Badge tone={c.funnel_stage === "bofu" ? "accent" : "default"}>{c.funnel_stage.toUpperCase()}</Badge>
                  <Badge>{c.archetype}</Badge>
                  <Badge>{c.slide_count} slides</Badge>
                  <Badge>{c.background_style}</Badge>
                  {c.topic_tag && <Badge>{c.topic_tag}</Badge>}
                </span>
              </button>
              {expanded && (
                <div className="mt-3 text-xs text-muted space-y-2 border-t border-border/10 pt-3">
                  <p>
                    <span className="text-foreground/70">Pillar:</span> {c.pillar} ·{" "}
                    <span className="text-foreground/70">Content type:</span> {c.content_type} ·{" "}
                    <span className="text-foreground/70">CTA:</span> {c.cta_type} ·{" "}
                    <span className="text-foreground/70">Background:</span> {c.background_style}
                    {c.background_category ? ` (${c.background_category})` : ""}
                  </p>
                  {c.design_notes && (
                    <p>
                      <span className="text-foreground/70">Design notes:</span> {c.design_notes}
                    </p>
                  )}
                  {!slides || slides === "loading" ? (
                    <p className="text-muted">Loading slides...</p>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      {slides.map((s) => (
                        <div key={s.slide_number} className="border-b border-border/10 pb-1.5">
                          <span className="text-foreground/70">
                            #{s.slide_number} [{s.slide_role.toUpperCase()}]
                          </span>{" "}
                          <span className="font-medium text-foreground">{s.headline}</span>
                          {s.supporting_text && <p className="mt-0.5">{s.supporting_text}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted">No carousels match these filters.</p>}
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

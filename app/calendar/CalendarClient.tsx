"use client";

import { useMemo, useState } from "react";
import { Card, Badge, DeleteForm } from "../components/ui";
import { updateCalendarItemStatus, deleteCalendarItem } from "@/lib/actions";
import { CALENDAR_STATUSES } from "@/lib/reference";

export type CalendarItem = {
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
  effort: string;
  topic_tag: string;
  segment: string;
};

const ALL = "__all__";

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

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

function monthLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7); // YYYY-MM
}

export default function CalendarClient({ items }: { items: CalendarItem[] }) {
  const [status, setStatus] = useState(ALL);
  const [pillar, setPillar] = useState(ALL);
  const [funnel, setFunnel] = useState(ALL);
  const [effort, setEffort] = useState(ALL);
  const [topicTag, setTopicTag] = useState(ALL);
  const [segment, setSegment] = useState(ALL);
  const [search, setSearch] = useState("");
  const [expandAll, setExpandAll] = useState(false);

  const statusOptions = useMemo(() => uniqueSorted(items.map((i) => i.status)), [items]);
  const pillarOptions = useMemo(() => uniqueSorted(items.map((i) => i.pillar)), [items]);
  const funnelOptions = useMemo(() => uniqueSorted(items.map((i) => i.funnel_stage)), [items]);
  const effortOptions = useMemo(() => uniqueSorted(items.map((i) => i.effort)), [items]);
  const topicOptions = useMemo(() => uniqueSorted(items.map((i) => i.topic_tag)), [items]);
  const segmentOptions = useMemo(() => uniqueSorted(items.map((i) => i.segment)), [items]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const in7DaysStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }, []);

  const stats = useMemo(() => {
    const posted = items.filter((i) => i.status === "posted").length;
    const overdue = items.filter((i) => i.status !== "posted" && i.date < todayStr).length;
    const thisWeek = items.filter((i) => i.status !== "posted" && i.date >= todayStr && i.date <= in7DaysStr).length;
    const next = items
      .filter((i) => i.status !== "posted" && i.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    return { posted, overdue, thisWeek, next, total: items.length };
  }, [items, todayStr, in7DaysStr]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (status !== ALL && i.status !== status) return false;
      if (pillar !== ALL && i.pillar !== pillar) return false;
      if (funnel !== ALL && i.funnel_stage !== funnel) return false;
      if (effort !== ALL && i.effort !== effort) return false;
      if (topicTag !== ALL && i.topic_tag !== topicTag) return false;
      if (segment !== ALL && i.segment !== segment) return false;
      if (q && !i.topic.toLowerCase().includes(q) && !i.notes.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, status, pillar, funnel, effort, topicTag, segment, search]);

  const groups = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of filtered) {
      const key = monthKey(item.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // Only auto-open the month closest to today, not every future month -- with
  // content scheduled years out, "open if future" would expand nearly all of
  // them and recreate the wall-of-items problem this view exists to fix.
  const defaultOpenKey = useMemo(() => {
    const currentMonth = todayStr.slice(0, 7);
    const upcoming = groups.find(([key]) => key >= currentMonth);
    return upcoming ? upcoming[0] : groups[groups.length - 1]?.[0];
  }, [groups, todayStr]);

  const resetFilters = () => {
    setStatus(ALL);
    setPillar(ALL);
    setFunnel(ALL);
    setEffort(ALL);
    setTopicTag(ALL);
    setSegment(ALL);
    setSearch("");
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Total planned</div>
          <div className="font-heading text-2xl">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Posted</div>
          <div className="font-heading text-2xl">{stats.posted}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Due this week</div>
          <div className="font-heading text-2xl">{stats.thisWeek}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Overdue</div>
          <div className={`font-heading text-2xl ${stats.overdue > 0 ? "text-[#e0a458]" : ""}`}>{stats.overdue}</div>
        </Card>
      </div>

      {stats.next && (
        <p className="text-xs text-muted mb-6">
          Next up: <span className="text-foreground">{stats.next.date}</span> --{" "}
          <span className="text-foreground">{stats.next.topic || "(untitled topic)"}</span>
        </p>
      )}

      <Card className="mb-6 calendar-filter-bar">
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          <Select label="Status" value={status} options={statusOptions} onChange={setStatus} />
          <Select label="Pillar" value={pillar} options={pillarOptions} onChange={setPillar} />
          <Select label="Funnel stage" value={funnel} options={funnelOptions} onChange={setFunnel} />
          <Select label="Detail level" value={effort} options={effortOptions} onChange={setEffort} />
          <Select label="Topic" value={topicTag} options={topicOptions} onChange={setTopicTag} />
          <Select label="Segment / type" value={segment} options={segmentOptions} onChange={setSegment} />
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topic or notes..."
            className="flex-1 rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5"
          />
          <button
            onClick={resetFilters}
            className="text-xs rounded-full border border-border/20 px-3 py-1.5 hover:bg-foreground/5 whitespace-nowrap"
          >
            Reset filters
          </button>
          <button
            onClick={() => setExpandAll((v) => !v)}
            className="text-xs rounded-full border border-border/20 px-3 py-1.5 hover:bg-foreground/5 whitespace-nowrap"
          >
            {expandAll ? "Collapse all months" : "Expand all months"}
          </button>
        </div>
      </Card>

      <p className="text-xs text-muted mb-3">
        Showing {filtered.length} of {items.length} planned items
      </p>

      {groups.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No items match these filters.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map(([key, groupItems]) => (
            <details key={key} open={expandAll || key === defaultOpenKey} className="rounded-2xl border border-border/15 bg-card/60">
              <summary className="cursor-pointer select-none px-5 py-4 font-heading text-lg flex items-center justify-between">
                <span>{monthLabel(groupItems[0].date)}</span>
                <span className="text-xs text-muted font-sans font-normal">{groupItems.length} items</span>
              </summary>
              <div className="px-5 pb-5 space-y-3">
                {groupItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border/10 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-sm text-muted mr-3">{item.date}</span>
                        <span className="text-sm font-medium">{item.topic || "(untitled topic)"}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{item.pillar}</Badge>
                        <Badge tone={item.funnel_stage === "bofu" ? "accent" : "default"}>
                          {item.funnel_stage.toUpperCase()}
                        </Badge>
                        <Badge>{item.effort}</Badge>
                        {item.segment && <Badge>{item.segment}</Badge>}
                        <Badge tone="accent">{item.concept_bucket.replace("_", " ")}</Badge>
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
                        <select
                          name="status"
                          defaultValue={item.status}
                          className="rounded-full border border-border/15 bg-foreground/95 text-background text-xs px-2 py-1"
                        >
                          {CALENDAR_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button className="text-xs rounded-full border border-border/20 px-2.5 py-1 hover:bg-foreground/5">
                          Update
                        </button>
                      </form>
                      <DeleteForm action={deleteCalendarItem} id={item.id} />
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Card, Badge, DeleteForm } from "../components/ui";
import { updateCalendarItemStatus, deleteCalendarItem, scheduleScriptToCalendar, resetCalendarAction } from "@/lib/actions";
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
  script_id: number | null;
};

export type PickerScript = {
  id: number;
  title: string;
  funnel_stage: string;
  topic_tag: string;
  effort: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function todayParts() {
  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth(), day: now.getDate() };
}

export function ResetCalendarButton({ itemCount }: { itemCount: number }) {
  return (
    <form
      action={resetCalendarAction}
      onSubmit={(e) => {
        if (!confirm(`Remove all ${itemCount} scheduled calendar items? Scripts in the Library are kept.`)) {
          e.preventDefault();
        }
      }}
    >
      <button className="rounded-full border border-red-400/40 text-red-400/90 text-sm font-medium px-4 py-2 hover:bg-red-400/10">
        Reset calendar ({itemCount} items)
      </button>
    </form>
  );
}

export default function CalendarClient({ items, scripts }: { items: CalendarItem[]; scripts: PickerScript[] }) {
  const today = useMemo(() => todayParts(), []);
  const todayStr = useMemo(() => toDateStr(today.year, today.monthIndex, today.day), [today]);

  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.monthIndex);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [scriptSearch, setScriptSearch] = useState("");
  const [selectedScriptId, setSelectedScriptId] = useState("");

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      if (!map.has(item.date)) map.set(item.date, []);
      map.get(item.date)!.push(item);
    }
    return map;
  }, [items]);

  const stats = useMemo(() => {
    const posted = items.filter((i) => i.status === "posted").length;
    const overdue = items.filter((i) => i.status !== "posted" && i.date < todayStr).length;
    return { total: items.length, posted, overdue };
  }, [items, todayStr]);

  const cells = useMemo(() => {
    const firstWeekday = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
    const out: { date: string | null; day: number | null }[] = [];
    for (let i = 0; i < firstWeekday; i++) out.push({ date: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) out.push({ date: toDateStr(viewYear, viewMonth, d), day: d });
    while (out.length % 7 !== 0) out.push({ date: null, day: null });
    return out;
  }, [viewYear, viewMonth]);

  const goMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const goToday = () => {
    setViewYear(today.year);
    setViewMonth(today.monthIndex);
    setSelectedDate(todayStr);
  };

  const filteredScripts = useMemo(() => {
    const q = scriptSearch.trim().toLowerCase();
    if (!q) return scripts;
    return scripts.filter((s) => s.title.toLowerCase().includes(q));
  }, [scripts, scriptSearch]);

  const selectedItems = itemsByDate.get(selectedDate) ?? [];

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Total planned</div>
          <div className="font-heading text-2xl">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Posted</div>
          <div className="font-heading text-2xl">{stats.posted}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Overdue</div>
          <div className={`font-heading text-2xl ${stats.overdue > 0 ? "text-[#e0a458]" : ""}`}>{stats.overdue}</div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => goMonth(-1)}
            className="rounded-full border border-border/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
            aria-label="Previous month"
          >
            &larr;
          </button>
          <div className="flex items-center gap-3">
            <h3 className="font-heading text-xl">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h3>
            <button
              onClick={goToday}
              className="text-xs rounded-full border border-border/20 px-2.5 py-1 hover:bg-foreground/5"
            >
              Today
            </button>
          </div>
          <button
            onClick={() => goMonth(1)}
            className="rounded-full border border-border/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
            aria-label="Next month"
          >
            &rarr;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[10px] md:text-xs text-muted uppercase tracking-wide py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (!cell.date) return <div key={idx} className="aspect-square" />;
            const dayItems = itemsByDate.get(cell.date) ?? [];
            const isToday = cell.date === todayStr;
            const isSelected = cell.date === selectedDate;
            return (
              <button
                key={cell.date}
                onClick={() => setSelectedDate(cell.date!)}
                className={`aspect-square rounded-lg border p-1 flex flex-col items-center justify-start gap-0.5 text-xs transition-colors ${
                  isSelected
                    ? "border-accent bg-accent/20"
                    : isToday
                    ? "border-accent/50 bg-foreground/5"
                    : "border-border/10 hover:bg-foreground/5"
                }`}
              >
                <span className={isToday ? "font-semibold" : ""}>{cell.day}</span>
                {dayItems.length > 0 && (
                  <span className="flex flex-wrap justify-center gap-0.5">
                    {dayItems.slice(0, 3).map((it) => (
                      <span
                        key={it.id}
                        className={`w-1.5 h-1.5 rounded-full ${it.status === "posted" ? "bg-muted" : "bg-accent"}`}
                      />
                    ))}
                    {dayItems.length > 3 && <span className="text-[9px] text-muted">+{dayItems.length - 3}</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="font-heading text-lg mb-1">{selectedDate}</h3>
        <p className="text-xs text-muted mb-4">
          {selectedItems.length === 0 ? "Nothing scheduled for this date yet." : `${selectedItems.length} item(s) scheduled`}
        </p>

        {selectedItems.length > 0 && (
          <div className="space-y-2 mb-5">
            {selectedItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-border/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">{item.topic || "(untitled topic)"}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{item.pillar}</Badge>
                    <Badge tone={item.funnel_stage === "bofu" ? "accent" : "default"}>
                      {item.funnel_stage.toUpperCase()}
                    </Badge>
                    <Badge>{item.effort}</Badge>
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
        )}

        <div className="border-t border-border/10 pt-4">
          <h4 className="text-sm font-medium mb-2">Add a script to this date</h4>
          <input
            value={scriptSearch}
            onChange={(e) => setScriptSearch(e.target.value)}
            placeholder="Search by script name..."
            className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5 mb-2"
          />
          <select
            value={selectedScriptId}
            onChange={(e) => setSelectedScriptId(e.target.value)}
            className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5 mb-1"
          >
            <option value="">-- pick a script ({filteredScripts.length} of {scripts.length}) --</option>
            {filteredScripts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} {s.topic_tag ? `(${s.topic_tag})` : ""}
              </option>
            ))}
          </select>
          <form
            action={scheduleScriptToCalendar}
            onSubmit={() => {
              setSelectedScriptId("");
              setScriptSearch("");
            }}
          >
            <input type="hidden" name="date" value={selectedDate} />
            <input type="hidden" name="script_id" value={selectedScriptId} />
            <button
              disabled={!selectedScriptId}
              className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to {selectedDate}
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

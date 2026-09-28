"use client";

import { useMemo, useState } from "react";
import { createOutliersBulk, BulkOutlierRow } from "@/lib/actions";
import { Card, Badge } from "../components/ui";

const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";

const VIEWS_ALIASES = ["views", "view count", "video_view_count", "play_count", "plays", "video views"];
const LINK_ALIASES = ["link", "url", "permalink", "post url", "shortcode", "video url"];

function detectDelimiter(text: string): "," | "\t" {
  const firstLine = text.split("\n")[0] ?? "";
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return tabs > commas ? "\t" : ",";
}

// Minimal RFC4180-ish parser: handles quoted fields with "" as an escaped quote.
function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export default function CsvImportClient() {
  const [creatorHandle, setCreatorHandle] = useState("");
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [niche, setNiche] = useState("");
  const [raw, setRaw] = useState("");
  const [viewsCol, setViewsCol] = useState<number | null>(null);
  const [linkCol, setLinkCol] = useState<number | null>(null);
  const [onlyOutliers, setOnlyOutliers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<number | null>(null);

  const parsed = useMemo(() => {
    if (!raw.trim()) return { headers: [] as string[], rows: [] as string[][] };
    const delimiter = detectDelimiter(raw);
    const all = parseDelimited(raw.trim(), delimiter);
    if (all.length === 0) return { headers: [], rows: [] };
    return { headers: all[0], rows: all.slice(1) };
  }, [raw]);

  const autoViewsCol = useMemo(() => {
    if (viewsCol !== null) return viewsCol;
    const idx = parsed.headers.findIndex((h) => VIEWS_ALIASES.includes(h.trim().toLowerCase()));
    return idx >= 0 ? idx : null;
  }, [parsed.headers, viewsCol]);

  const autoLinkCol = useMemo(() => {
    if (linkCol !== null) return linkCol;
    const idx = parsed.headers.findIndex((h) => LINK_ALIASES.includes(h.trim().toLowerCase()));
    return idx >= 0 ? idx : null;
  }, [parsed.headers, linkCol]);

  const preview = useMemo(() => {
    if (autoViewsCol === null || followerCount <= 0) return [];
    return parsed.rows
      .map((r) => {
        const views = Number((r[autoViewsCol] ?? "").replace(/[,\s]/g, "")) || 0;
        const link = autoLinkCol !== null ? r[autoLinkCol] ?? "" : "";
        const multiple = followerCount > 0 ? views / followerCount : 0;
        return { views, link, multiple, isOutlier: multiple >= 5 };
      })
      .filter((r) => r.views > 0);
  }, [parsed.rows, autoViewsCol, autoLinkCol, followerCount]);

  const toImport = onlyOutliers ? preview.filter((r) => r.isOutlier) : preview;

  async function handleImport() {
    setSaving(true);
    const rows: BulkOutlierRow[] = toImport.map((r) => ({
      source_type: "creator",
      creator_handle: creatorHandle,
      link: r.link,
      niche_keyword: niche,
      follower_count: followerCount,
      views: r.views,
      hook_written: "",
      hook_verbal: "",
      hook_visual: "",
      angle: "",
      notes: "Imported via CSV (creator research export)",
    }));
    await createOutliersBulk(rows);
    setSaving(false);
    setSaved(rows.length);
    setRaw("");
  }

  return (
    <Card className="mb-8">
      <h3 className="font-heading text-xl mb-2">Bulk import from a creator-research CSV</h3>
      <p className="text-xs text-muted mb-4">
        For the Sort Feed extension&apos;s export (or any similar tool): sort one creator&apos;s Reels by views, export as
        CSV, and paste it below instead of typing each reel in one at a time. Enter that creator&apos;s handle and follower
        count once -- every row gets checked against it automatically.
      </p>

      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <input value={creatorHandle} onChange={(e) => setCreatorHandle(e.target.value)} placeholder="Creator handle" className={inputClass} />
        <input
          type="number"
          value={followerCount || ""}
          onChange={(e) => setFollowerCount(Number(e.target.value))}
          placeholder="Their follower count"
          className={inputClass}
        />
        <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Keyword/niche (optional)" className={inputClass} />
      </div>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={6}
        placeholder="Paste the exported CSV/TSV here (first row should be headers)..."
        className={`${inputClass} mb-3 font-mono text-xs`}
      />

      {parsed.headers.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-muted block mb-1">
              Views column {autoViewsCol !== null && viewsCol === null && <Badge tone="accent">auto-detected</Badge>}
            </label>
            <select
              value={viewsCol ?? autoViewsCol ?? ""}
              onChange={(e) => setViewsCol(e.target.value === "" ? null : Number(e.target.value))}
              className={inputClass}
            >
              <option value="">— pick the views column —</option>
              {parsed.headers.map((h, i) => (
                <option key={i} value={i}>
                  {h || `Column ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">
              Link column (optional) {autoLinkCol !== null && linkCol === null && <Badge tone="accent">auto-detected</Badge>}
            </label>
            <select
              value={linkCol ?? autoLinkCol ?? ""}
              onChange={(e) => setLinkCol(e.target.value === "" ? null : Number(e.target.value))}
              className={inputClass}
            >
              <option value="">—</option>
              {parsed.headers.map((h, i) => (
                <option key={i} value={i}>
                  {h || `Column ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm">
              Parsed <span className="font-medium">{preview.length}</span> rows,{" "}
              <span className="font-medium text-accent">{preview.filter((r) => r.isOutlier).length}</span> are 5x+ outliers.
            </p>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={onlyOutliers} onChange={(e) => setOnlyOutliers(e.target.checked)} />
              Only import 5x+ outliers
            </label>
          </div>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-border/10 mb-3">
            {preview.slice(0, 50).map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs px-3 py-1.5 border-b border-border/5 last:border-0">
                <span className="text-muted truncate">{r.link || `row ${i + 1}`}</span>
                <span className="flex items-center gap-2">
                  <span>{r.views.toLocaleString()} views</span>
                  {r.isOutlier ? <Badge tone="accent">{r.multiple.toFixed(1)}x</Badge> : <Badge>{r.multiple.toFixed(1)}x</Badge>}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleImport}
            disabled={saving || toImport.length === 0 || !creatorHandle}
            className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2 disabled:opacity-60"
          >
            {saving ? "Importing…" : `Import ${toImport.length} row${toImport.length === 1 ? "" : "s"}`}
          </button>
          {!creatorHandle && <span className="text-xs text-muted ml-3">Enter a creator handle first</span>}
        </>
      )}

      {saved !== null && <p className="text-xs text-accent mt-3">Imported {saved} outlier{saved === 1 ? "" : "s"} ✓</p>}
    </Card>
  );
}

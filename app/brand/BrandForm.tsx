"use client";

import { useState } from "react";
import { BrandConfig } from "@/lib/brand";
import { saveBrandAction } from "@/lib/actions";

function linesToArray(s: string) {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function BrandForm({ brand }: { brand: BrandConfig }) {
  const [form, setForm] = useState(brand);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof BrandConfig>(key: K, value: BrandConfig[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    await saveBrandAction(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";
  const labelClass = "text-xs uppercase tracking-wide text-muted mb-1 block";

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Instagram handle</label>
          <input className={inputClass} value={form.handle} onChange={(e) => set("handle", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Name field (Name | Keyword)</label>
          <input className={inputClass} value={form.nameField} onChange={(e) => set("nameField", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Niche</label>
        <input className={inputClass} value={form.niche} onChange={(e) => set("niche", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Sub-niches (one per line)</label>
        <textarea
          className={inputClass}
          rows={5}
          value={form.subniches.join("\n")}
          onChange={(e) => set("subniches", linesToArray(e.target.value))}
        />
      </div>

      <div>
        <label className={labelClass}>Occupation / role</label>
        <input className={inputClass} value={form.occupation} onChange={(e) => set("occupation", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Founder story</label>
        <textarea className={inputClass} rows={6} value={form.founderStory} onChange={(e) => set("founderStory", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Bio link destination</label>
        <input className={inputClass} value={form.bioLink} onChange={(e) => set("bioLink", e.target.value)} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Follower count</label>
          <input
            type="number"
            className={inputClass}
            value={form.followerCount}
            onChange={(e) => set("followerCount", Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Account status</label>
          <select
            className={inputClass}
            value={form.accountStatus}
            onChange={(e) => set("accountStatus", e.target.value as BrandConfig["accountStatus"])}
          >
            <option value="new">New (90/10 rule)</option>
            <option value="established">Established (70/20/10 rule)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Posting cadence (x/week)</label>
          <input
            className={inputClass}
            value={form.postingCadence.timesPerWeek}
            onChange={(e) => set("postingCadence", { ...form.postingCadence, timesPerWeek: e.target.value })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Pillar ratio — Authority %</label>
          <input
            type="number"
            className={inputClass}
            value={form.pillarRatio.authority}
            onChange={(e) =>
              set("pillarRatio", { authority: Number(e.target.value), journey: 100 - Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label className={labelClass}>Pillar ratio — Journey %</label>
          <input className={inputClass} value={form.pillarRatio.journey} disabled />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Concept ratio — Proven %</label>
          <input
            type="number"
            className={inputClass}
            value={form.conceptRatio.proven}
            onChange={(e) => set("conceptRatio", { ...form.conceptRatio, proven: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={labelClass}>Double down %</label>
          <input
            type="number"
            className={inputClass}
            value={form.conceptRatio.doubleDown}
            onChange={(e) => set("conceptRatio", { ...form.conceptRatio, doubleDown: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={labelClass}>Experimental %</label>
          <input
            type="number"
            className={inputClass}
            value={form.conceptRatio.experimental}
            onChange={(e) => set("conceptRatio", { ...form.conceptRatio, experimental: Number(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Proprietary value / credibility</label>
        <textarea className={inputClass} rows={3} value={form.proprietaryValue} onChange={(e) => set("proprietaryValue", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Journey content assets (real footage/photos you have)</label>
        <textarea className={inputClass} rows={3} value={form.journeyAssets} onChange={(e) => set("journeyAssets", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Human alpha (why AI slop can&apos;t copy you)</label>
        <textarea className={inputClass} rows={3} value={form.humanAlpha} onChange={(e) => set("humanAlpha", e.target.value)} />
      </div>

      <button
        onClick={handleSave}
        className="rounded-full bg-accent text-accent-deep text-sm font-medium px-5 py-2.5"
      >
        {saved ? "Saved ✓" : "Save brand config"}
      </button>
    </div>
  );
}

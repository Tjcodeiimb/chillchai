"use client";

import { useMemo, useState } from "react";
import { BrandConfig } from "@/lib/brand";
import { buildScriptImproverPrompt } from "@/lib/prompts";
import { SCRIPT_ANGLES, STORY_TYPES, FILMING_FORMATS, CTA_TYPES, FUNNEL_STAGES } from "@/lib/reference";
import { Card } from "../components/ui";
import PromptRunner from "../components/PromptRunner";

export type ExistingScript = {
  id: number;
  title: string;
  pillar: string;
  content_type: string;
  angle_or_story_type: string;
  format: string;
  cta_type: string;
  funnel_stage: string;
};

const selectClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";
const inputClass = selectClass;

export default function ImproveClient({ brand, scripts }: { brand: BrandConfig; scripts: ExistingScript[] }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [scriptSearch, setScriptSearch] = useState("");
  const [pillar, setPillar] = useState("authority");
  const [contentType, setContentType] = useState("educational");
  const [angle, setAngle] = useState("");
  const [format, setFormat] = useState("");
  const [funnelStage, setFunnelStage] = useState<(typeof FUNNEL_STAGES)[number]>("tofu");
  const [ctaType, setCtaType] = useState<(typeof CTA_TYPES)[number]>("follow");
  const [bodyBlack, setBodyBlack] = useState("");
  const [bodyRed, setBodyRed] = useState("");
  const [bodyGreen, setBodyGreen] = useState("");
  const [focusNotes, setFocusNotes] = useState("");

  const angleOptions = pillar === "journey" ? STORY_TYPES : SCRIPT_ANGLES;

  const filteredScripts = useMemo(() => {
    const q = scriptSearch.trim().toLowerCase();
    if (!q) return scripts;
    return scripts.filter((s) => s.title.toLowerCase().includes(q));
  }, [scripts, scriptSearch]);

  async function loadFromLibrary(id: string) {
    setSelectedId(id);
    const found = scripts.find((s) => String(s.id) === id);
    if (!found) return;
    setPillar(found.pillar || "authority");
    setContentType(found.content_type || "educational");
    setAngle(found.angle_or_story_type || "");
    setFormat(found.format || "");
    setFunnelStage((found.funnel_stage as (typeof FUNNEL_STAGES)[number]) || "tofu");
    setCtaType((found.cta_type as (typeof CTA_TYPES)[number]) || "follow");
    setBodyBlack("");
    setBodyRed("");
    setBodyGreen("");
    const res = await fetch(`/api/scripts/${id}/body`);
    const body = (await res.json()) as { body_black: string; body_red: string; body_green: string };
    setBodyBlack(body.body_black || "");
    setBodyRed(body.body_red || "");
    setBodyGreen(body.body_green || "");
  }

  const prompt = useMemo(() => {
    if (!bodyBlack.trim()) return "";
    return buildScriptImproverPrompt(brand, {
      bodyBlack,
      bodyRed: bodyRed || undefined,
      bodyGreen: bodyGreen || undefined,
      pillar,
      contentType,
      angleOrStoryType: angle || undefined,
      format: format || undefined,
      funnelStage,
      ctaType,
      focusNotes: focusNotes || undefined,
    });
  }, [brand, bodyBlack, bodyRed, bodyGreen, pillar, contentType, angle, format, funnelStage, ctaType, focusNotes]);

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-heading text-xl mb-3">1. Bring in a script</h3>
        <label className="text-xs text-muted block mb-1">Pull from your Script Library (optional)</label>
        <input
          value={scriptSearch}
          onChange={(e) => setScriptSearch(e.target.value)}
          placeholder="Search by script name..."
          className={`${inputClass} mb-2`}
        />
        <select value={selectedId} onChange={(e) => loadFromLibrary(e.target.value)} className={`${selectClass} mb-1`}>
          <option value="">-- paste your own below instead --</option>
          {filteredScripts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted mb-4">
          {filteredScripts.length} of {scripts.length} scripts{scriptSearch ? " match your search" : ""}
        </p>

        <label className="text-xs text-muted block mb-1">BLACK (spoken dialogue) -- required</label>
        <textarea
          value={bodyBlack}
          onChange={(e) => setBodyBlack(e.target.value)}
          rows={6}
          className={`${inputClass} mb-3`}
          placeholder="Paste the spoken script here, line by line..."
        />
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">RED (camera/action) -- optional</label>
            <textarea value={bodyRed} onChange={(e) => setBodyRed(e.target.value)} rows={3} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">GREEN (editing) -- optional</label>
            <textarea value={bodyGreen} onChange={(e) => setBodyGreen(e.target.value)} rows={3} className={inputClass} />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">2. Current context (correct it if it&apos;s wrong -- the improver will flag a mismatch either way)</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Pillar</label>
            <select value={pillar} onChange={(e) => setPillar(e.target.value)} className={selectClass}>
              <option value="authority">Authority</option>
              <option value="journey">Journey</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Content type</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)} className={selectClass}>
              <option value="educational">Educational</option>
              <option value="storytelling">Storytelling</option>
              <option value="authority">Authority / transformation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Angle / story type</label>
            <select value={angle} onChange={(e) => setAngle(e.target.value)} className={selectClass}>
              <option value="">-- unspecified --</option>
              {angleOptions.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Filming format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className={selectClass}>
              <option value="">-- unspecified --</option>
              {FILMING_FORMATS.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Funnel stage</label>
            <select value={funnelStage} onChange={(e) => setFunnelStage(e.target.value as (typeof FUNNEL_STAGES)[number])} className={selectClass}>
              {FUNNEL_STAGES.map((f) => (
                <option key={f} value={f}>
                  {f.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">CTA type</label>
            <select value={ctaType} onChange={(e) => setCtaType(e.target.value as (typeof CTA_TYPES)[number])} className={selectClass}>
              {CTA_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">3. Anything specific to focus this pass on? (optional)</h3>
        <input
          value={focusNotes}
          onChange={(e) => setFocusNotes(e.target.value)}
          className={inputClass}
          placeholder="e.g. the hook feels slow, or the CTA doesn't match a BOFU audience, or make this fit the Whiteboard format instead"
        />
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">4. Diagnose &amp; rewrite</h3>
        {!bodyBlack.trim() ? (
          <p className="text-sm text-muted">Paste or pull in a script above to build the improvement prompt.</p>
        ) : (
          <PromptRunner prompt={prompt} label="Diagnose & rewrite" />
        )}
      </Card>
    </div>
  );
}

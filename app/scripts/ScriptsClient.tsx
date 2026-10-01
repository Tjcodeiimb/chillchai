"use client";

import { useState } from "react";
import { BrandConfig } from "@/lib/brand";
import {
  buildScriptPrompt,
  buildTranscriptTemplatizePrompt,
  buildIndustryEntrySeriesPrompt,
} from "@/lib/prompts";
import {
  SCRIPT_ANGLES,
  STORY_TYPES,
  FILMING_FORMATS,
  JOURNEY_SERIES_FORMATS,
  AUTHORITY_CONTENT_FORMATS,
  STORYTELLING_RECOMMENDED_FORMAT_IDS,
  HISTORICAL_MEDIA_TIP,
} from "@/lib/reference";
import { createScript, createScriptTemplate, deleteScript, deleteScriptTemplate } from "@/lib/actions";
import { Card, Badge, SubTabs, DeleteForm } from "../components/ui";
import PromptRunner from "../components/PromptRunner";

type ScriptRow = {
  id: number;
  title: string;
  pillar: string;
  status: string;
  series_name: string;
};

type TemplateRow = {
  id: number;
  name: string;
  pillar: string;
  angle: string;
  source_note: string;
  template_text: string;
};

const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";

export default function ScriptsClient({
  brand,
  scripts,
  templates,
}: {
  brand: BrandConfig;
  scripts: ScriptRow[];
  templates: TemplateRow[];
}) {
  const [tab, setTab] = useState("authority");

  return (
    <div>
      <SubTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "authority", label: "Authority / Educational" },
          { id: "storytelling", label: "Storytelling" },
          { id: "series", label: "Signature Series" },
          { id: "transcript", label: "Transcript → Template" },
          { id: "bank", label: `Script Bank (${scripts.length + templates.length})` },
        ]}
      />

      {tab === "authority" && <AuthorityTab brand={brand} />}
      {tab === "storytelling" && <StorytellingTab brand={brand} />}
      {tab === "series" && <SeriesTab brand={brand} />}
      {tab === "transcript" && <TranscriptTab />}
      {tab === "bank" && <BankTab scripts={scripts} templates={templates} />}
    </div>
  );
}

function AuthorityTab({ brand }: { brand: BrandConfig }) {
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState(SCRIPT_ANGLES[0].name);
  const [format, setFormat] = useState("");
  const [funnel, setFunnel] = useState("tofu");
  const [cta, setCta] = useState("follow");
  const [depth, setDepth] = useState<"easy" | "complex" | "">("");

  const prompt = buildScriptPrompt(brand, {
    pillar: "authority",
    contentType: "educational / authority",
    angleOrStoryType: angle,
    topic: topic || "(enter a topic below)",
    format,
    depth: depth || undefined,
    funnelStage: funnel as "tofu" | "mofu" | "bofu",
    ctaType: cta as "follow" | "engagement" | "manychat" | "none",
  });

  async function handleSave(text: string) {
    const fd = new FormData();
    fd.set("title", topic || "Untitled script");
    fd.set("pillar", "authority");
    fd.set("content_type", "educational");
    fd.set("angle_or_story_type", angle);
    fd.set("format", format);
    fd.set("body_black", text);
    fd.set("cta_type", cta);
    fd.set("funnel_stage", funnel);
    fd.set("status", "draft");
    await createScript(fd);
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <h3 className="font-heading text-xl mb-3">Authority / educational script generator</h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div className="md:col-span-2">
            <label className="text-xs text-muted block mb-1">Topic</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Angle</label>
            <select value={angle} onChange={(e) => setAngle(e.target.value)} className={inputClass}>
              <optgroup label="7 script angles">
                {SCRIPT_ANGLES.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="9 authority content formats">
                {AUTHORITY_CONTENT_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className={inputClass}>
              <option value="">—</option>
              {FILMING_FORMATS.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Funnel stage</label>
            <select value={funnel} onChange={(e) => setFunnel(e.target.value)} className={inputClass}>
              <option value="tofu">TOFU</option>
              <option value="mofu">MOFU</option>
              <option value="bofu">BOFU</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">CTA</label>
            <select value={cta} onChange={(e) => setCta(e.target.value)} className={inputClass}>
              <option value="follow">Follow</option>
              <option value="engagement">Engagement</option>
              <option value="manychat">ManyChat</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted block mb-1">Depth (reach vs. conversion)</label>
            <select value={depth} onChange={(e) => setDepth(e.target.value as "easy" | "complex" | "")} className={inputClass}>
              <option value="">Default</option>
              <option value="easy">Easy / low-effort -- optimize for reach</option>
              <option value="complex">Complex / high-effort -- optimize for conversion</option>
            </select>
          </div>
        </div>
        <PromptRunner prompt={prompt} label="Generate script" onSave={handleSave} />
      </Card>
      <Card>
        <h3 className="font-heading text-lg mb-3">9 authority content formats</h3>
        <ul className="text-xs text-muted space-y-2">
          {AUTHORITY_CONTENT_FORMATS.map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
        <h3 className="font-heading text-lg mt-5 mb-2">Reach vs. conversion</h3>
        <p className="text-xs text-muted">
          Easy/low-effort structures (ratings, simple lists) win reach. Complex/high-effort structures
          (storytelling, hyper-educational breakdowns) win followers and leads. Pick depth deliberately.
        </p>
      </Card>
    </div>
  );
}

function StorytellingTab({ brand }: { brand: BrandConfig }) {
  const [topic, setTopic] = useState("");
  const [storyType, setStoryType] = useState(STORY_TYPES[0].name);
  const [format, setFormat] = useState("");
  const [funnel, setFunnel] = useState("tofu");
  const [cta, setCta] = useState("follow");

  const prompt = buildScriptPrompt(brand, {
    pillar: "journey",
    contentType: "storytelling",
    angleOrStoryType: storyType,
    topic: topic || `(use: ${brand.journeyAssets})`,
    format,
    funnelStage: funnel as "tofu" | "mofu" | "bofu",
    ctaType: cta as "follow" | "engagement" | "manychat" | "none",
  });

  async function handleSave(text: string) {
    const fd = new FormData();
    fd.set("title", topic || storyType);
    fd.set("pillar", "journey");
    fd.set("content_type", "storytelling");
    fd.set("angle_or_story_type", storyType);
    fd.set("format", format);
    fd.set("body_black", text);
    fd.set("cta_type", cta);
    fd.set("funnel_stage", funnel);
    fd.set("status", "draft");
    await createScript(fd);
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <h3 className="font-heading text-xl mb-3">Storytelling script generator</h3>
        <p className="text-xs text-muted mb-3">Journey asset on file: {brand.journeyAssets}</p>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div className="md:col-span-2">
            <label className="text-xs text-muted block mb-1">Topic / beat</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass} placeholder="leave blank to build off your journey asset" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Story type</label>
            <select value={storyType} onChange={(e) => setStoryType(e.target.value)} className={inputClass}>
              <optgroup label="7 story types">
                {STORY_TYPES.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Journey series formats">
                {JOURNEY_SERIES_FORMATS.map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className={inputClass}>
              <option value="">—</option>
              <optgroup label="Recommended for storytelling">
                {FILMING_FORMATS.filter((f) => STORYTELLING_RECOMMENDED_FORMAT_IDS.includes(f.id)).map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other formats">
                {FILMING_FORMATS.filter((f) => !STORYTELLING_RECOMMENDED_FORMAT_IDS.includes(f.id)).map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Funnel stage</label>
            <select value={funnel} onChange={(e) => setFunnel(e.target.value)} className={inputClass}>
              <option value="tofu">TOFU</option>
              <option value="mofu">MOFU</option>
              <option value="bofu">BOFU</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">CTA</label>
            <select value={cta} onChange={(e) => setCta(e.target.value)} className={inputClass}>
              <option value="follow">Follow</option>
              <option value="engagement">Engagement</option>
              <option value="manychat">ManyChat</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-muted mb-3">{HISTORICAL_MEDIA_TIP}</p>
        <PromptRunner prompt={prompt} label="Generate script" onSave={handleSave} />
      </Card>
      <Card>
        <h3 className="font-heading text-lg mb-3">Best formats for storytelling</h3>
        <ul className="text-xs text-muted space-y-2 mb-5">
          {FILMING_FORMATS.filter((f) => STORYTELLING_RECOMMENDED_FORMAT_IDS.includes(f.id)).map((f) => (
            <li key={f.id}>
              <span className="text-foreground">{f.name}:</span> {f.description}
            </li>
          ))}
        </ul>
        <h3 className="font-heading text-lg mb-3">Journey series formats</h3>
        <ul className="text-xs text-muted space-y-2">
          {JOURNEY_SERIES_FORMATS.map((f) => (
            <li key={f.id}>
              <span className="text-foreground">{f.name}:</span> {f.description}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function SeriesTab({ brand }: { brand: BrandConfig }) {
  const [industry, setIndustry] = useState("");
  const [episodes, setEpisodes] = useState(5);

  const prompt = buildIndustryEntrySeriesPrompt(brand, { industry: industry || "(pick an industry)", episodes });

  return (
    <Card>
      <h3 className="font-heading text-xl mb-2">&quot;How to Enter an Industry&quot; — your signature series</h3>
      <p className="text-sm text-muted mb-4">{brand.humanAlpha}</p>
      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <div className="md:col-span-2">
          <label className="text-xs text-muted block mb-1">Industry</label>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass} placeholder="e.g. renewable energy, D2C beauty, fintech" />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Episodes</label>
          <input type="number" value={episodes} onChange={(e) => setEpisodes(Number(e.target.value))} className={inputClass} min={2} max={10} />
        </div>
      </div>
      <PromptRunner prompt={prompt} label="Design series" />
    </Card>
  );
}

function TranscriptTab() {
  const [transcript, setTranscript] = useState("");
  const [name, setName] = useState("");
  const [pillar, setPillar] = useState("authority");
  const [angle, setAngle] = useState("");

  const prompt = buildTranscriptTemplatizePrompt(transcript || "(paste a transcript below)");

  async function handleSave(text: string) {
    const fd = new FormData();
    fd.set("name", name || "Untitled template");
    fd.set("pillar", pillar);
    fd.set("angle", angle);
    fd.set("source_note", "Templatized from a pasted transcript");
    fd.set("template_text", text);
    await createScriptTemplate(fd);
  }

  return (
    <Card>
      <h3 className="font-heading text-xl mb-3">Transcript → fill-in-the-blank template</h3>
      <p className="text-xs text-muted mb-3">
        Paste a viral outlier&apos;s transcript (from gettranscribe.ai or similar). This uses the exact templatizing prompt from your playbook.
      </p>
      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" className={inputClass} />
        <select value={pillar} onChange={(e) => setPillar(e.target.value)} className={inputClass}>
          <option value="authority">Authority</option>
          <option value="journey">Journey</option>
        </select>
        <select value={angle} onChange={(e) => setAngle(e.target.value)} className={inputClass}>
          <option value="">Angle (optional)</option>
          {SCRIPT_ANGLES.map((a) => (
            <option key={a.id} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={6}
        placeholder="Paste transcript here..."
        className={`${inputClass} mb-3`}
      />
      <PromptRunner prompt={prompt} label="Templatize" onSave={handleSave} saveLabel="Save to script bank" />
    </Card>
  );
}

type ScriptBody = { body_black: string; body_red: string; body_green: string };

function BankTab({ scripts, templates }: { scripts: ScriptRow[]; templates: TemplateRow[] }) {
  const [bodies, setBodies] = useState<Record<number, ScriptBody | "loading">>({});
  const PAGE_SIZE = 40;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleScripts = scripts.slice(0, visibleCount);

  async function loadBody(id: number) {
    if (bodies[id]) return;
    setBodies((b) => ({ ...b, [id]: "loading" }));
    const res = await fetch(`/api/scripts/${id}/body`);
    const body = (await res.json()) as ScriptBody;
    setBodies((b) => ({ ...b, [id]: body }));
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-heading text-xl mb-3">Write a script manually (color-coded)</h3>
        <form action={createScript} className="grid md:grid-cols-2 gap-3">
          <input name="title" placeholder="Title" className={inputClass} />
          <select name="pillar" className={inputClass} defaultValue="authority">
            <option value="authority">Authority</option>
            <option value="journey">Journey</option>
          </select>
          <input name="angle_or_story_type" placeholder="Angle / story type" className={inputClass} />
          <input name="format" placeholder="Filming format" className={inputClass} />
          <div className="md:col-span-2">
            <label className="text-xs block mb-1 text-foreground">● Black — spoken dialogue (line by line)</label>
            <textarea name="body_black" rows={4} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs block mb-1 text-red-400">● Red — physical actions / camera moves</label>
            <textarea name="body_red" rows={3} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs block mb-1 text-green-400">● Green — editing / graphic instructions</label>
            <textarea name="body_green" rows={3} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">Save script</button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl">Scripts ({scripts.length})</h3>
          {scripts.length > 0 && (
            <a href="/api/export/scripts" className="text-xs rounded-full border border-border/20 px-3 py-1.5 hover:bg-foreground/5">
              Export all to Word
            </a>
          )}
        </div>
        {scripts.length === 0 ? (
          <p className="text-sm text-muted">No scripts saved yet.</p>
        ) : (
          <div className="space-y-3">
            {visibleScripts.map((s) => {
              const body = bodies[s.id];
              return (
                <details key={s.id} className="rounded-lg border border-border/10 p-3" onToggle={(e) => e.currentTarget.open && loadBody(s.id)}>
                  <summary className="cursor-pointer text-sm font-medium flex items-center justify-between">
                    <span>{s.title}</span>
                    <span className="flex gap-2">
                      <Badge>{s.pillar}</Badge>
                      <Badge>{s.status}</Badge>
                    </span>
                  </summary>
                  <div className="mt-3 text-xs space-y-2">
                    {!body || body === "loading" ? (
                      <p className="text-muted">Loading script...</p>
                    ) : (
                      <>
                        {body.body_black && <p><span className="text-foreground font-medium">Black:</span> <span className="text-muted whitespace-pre-wrap">{body.body_black}</span></p>}
                        {body.body_red && <p><span className="text-red-400 font-medium">Red:</span> <span className="text-muted whitespace-pre-wrap">{body.body_red}</span></p>}
                        {body.body_green && <p><span className="text-green-400 font-medium">Green:</span> <span className="text-muted whitespace-pre-wrap">{body.body_green}</span></p>}
                      </>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <a href={`/api/export/script/${s.id}`} className="text-xs text-accent hover:underline">
                      Export to Word
                    </a>
                    <DeleteForm action={deleteScript} id={s.id} />
                  </div>
                </details>
              );
            })}
          </div>
        )}
        {visibleCount < scripts.length && (
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="mt-4 w-full text-sm rounded-full border border-border/20 px-4 py-2.5 hover:bg-foreground/5"
          >
            Load {Math.min(PAGE_SIZE, scripts.length - visibleCount)} more ({scripts.length - visibleCount} remaining)
          </button>
        )}
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-4">Fill-in-the-blank templates ({templates.length})</h3>
        {templates.length === 0 ? (
          <p className="text-sm text-muted">No templates saved yet — use the Transcript → Template tab.</p>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <details key={t.id} className="rounded-lg border border-border/10 p-3">
                <summary className="cursor-pointer text-sm font-medium flex items-center justify-between">
                  <span>{t.name}</span>
                  <Badge>{t.pillar}</Badge>
                </summary>
                <p className="text-xs text-muted whitespace-pre-wrap mt-3">{t.template_text}</p>
                <div className="mt-3">
                  <DeleteForm action={deleteScriptTemplate} id={t.id} />
                </div>
              </details>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { BrandConfig } from "@/lib/brand";
import {
  buildBioPrompt,
  buildKeywordBankPrompt,
  buildTopicResearchPrompt,
  buildProblemResearchPrompt,
  buildOutlierDeconstructionPrompt,
  buildRawIdeaDeveloperPrompt,
  buildHookStackPrompt,
  buildCaptionPrompt,
  buildManyChatMessagePrompt,
  buildCalendarIdeationPrompt,
  buildDoubleDownPrompt,
  buildIndustryEntrySeriesPrompt,
} from "@/lib/prompts";
import {
  SCRIPT_ANGLES,
  STORY_TYPES,
  JOURNEY_SERIES_FORMATS,
  AUTHORITY_CONTENT_FORMATS,
  FILMING_FORMATS,
  UNIVERSAL_HOOK_TEMPLATES,
  PROFILE_RIGHT_WRONG,
  FIVE_X_OUTLIER_RULE,
  TRANSCRIPT_TEMPLATIZE_PROMPT,
} from "@/lib/reference";
import { Card, Badge, SubTabs } from "../components/ui";
import PromptRunner from "../components/PromptRunner";

const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";

const DIRECTORY = [
  { label: "Content Calendar", where: "/calendar", note: "Full batch planner + ratio tracker" },
  { label: "Outlier Research Hub", where: "/research", note: "Research log with auto 5x-multiple calc" },
  { label: "Hook Lab", where: "/hooks", note: "Hook stack library + builder" },
  { label: "Script Studio", where: "/scripts", note: "Full script editor, bank & transcript templatizer" },
  { label: "Production Planner", where: "/production", note: "Filming formats, equipment, shot lists" },
  { label: "CTA & Funnel Mapper", where: "/funnel", note: "TOFU/MOFU/BOFU + CTA guide" },
  { label: "Analytics & Levels", where: "/analytics", note: "Top/bottom performers + level tracker" },
];

export default function PromptsClient({ brand, hasKey }: { brand: BrandConfig; hasKey: boolean }) {
  const [tab, setTab] = useState("overview");

  return (
    <div>
      <SubTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "brand", label: "Brand, Research & Ideas" },
          { id: "hooks", label: "Hooks & Scripts" },
          { id: "captions", label: "Captions, CTA & Calendar" },
          { id: "reference", label: "Reference Library" },
        ]}
      />

      {tab === "overview" && <OverviewTab hasKey={hasKey} />}
      {tab === "brand" && <BrandResearchTab brand={brand} />}
      {tab === "hooks" && <HooksScriptsTab brand={brand} />}
      {tab === "captions" && <CaptionsCtaTab brand={brand} />}
      {tab === "reference" && <ReferenceTab />}
    </div>
  );
}

function OverviewTab({ hasKey }: { hasKey: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading text-xl">Gemini API status</h3>
          <Badge tone={hasKey ? "accent" : "warn"}>{hasKey ? "Connected" : "Not configured"}</Badge>
        </div>
        <p className="text-sm text-muted">
          {hasKey
            ? 'GEMINI_API_KEY is set — every "Generate" button below calls Gemini directly.'
            : "No GEMINI_API_KEY found. Add one to .env.local to enable live generation. Until then, every generator still assembles the full prompt for you to paste into Gemini, Claude, or ChatGPT."}
        </p>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl">Export the whole library</h3>
          <a
            href="/api/export/prompt-library"
            className="text-xs rounded-full bg-accent text-accent-deep px-3 py-1.5 font-medium"
          >
            Export to Word
          </a>
        </div>
        <p className="text-sm text-muted">
          Every prompt on this page, pre-filled with your real brand context, plus the full reference library
          (hook angles, story types, filming formats, universal templates) — as one .docx you can print, annotate,
          or hand to an editor/VA.
        </p>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-4">Section directory</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {DIRECTORY.map((d) => (
            <a key={d.label} href={d.where} className="rounded-lg border border-border/10 p-3 hover:border-accent/40 block">
              <div className="text-sm font-medium">{d.label}</div>
              <div className="text-xs text-muted">{d.note}</div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

function BrandResearchTab({ brand }: { brand: BrandConfig }) {
  const [subniche, setSubniche] = useState(brand.subniches[0] ?? "");
  const [rawIdea, setRawIdea] = useState("");
  const [outlierText, setOutlierText] = useState("");

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-heading text-xl mb-3">Bio generator (4-line framework)</h3>
        <p className="text-xs text-muted mb-3">Also suggests keyword-rich name field options and checks your current handle.</p>
        <PromptRunner prompt={buildBioPrompt(brand)} label="Generate bio" />
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Keyword bank generator</h3>
        <PromptRunner prompt={buildKeywordBankPrompt(brand)} label="Generate keyword bank" />
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Topic, framework & problem research</h3>
        <label className="text-xs text-muted block mb-1">Sub-niche</label>
        <select value={subniche} onChange={(e) => setSubniche(e.target.value)} className={`${inputClass} mb-4`}>
          {brand.subniches.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Topic & framework research</h4>
            <PromptRunner prompt={buildTopicResearchPrompt(brand, { subniche })} label="Research topics" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Problem research</h4>
            <PromptRunner prompt={buildProblemResearchPrompt(brand, { subniche })} label="Research problems" />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Raw idea developer</h3>
        <p className="text-xs text-muted mb-3">Paste a rough, unfiltered idea — get back a full 7-factor video brief (topic, hooks, value, angle, CTA, format, editing).</p>
        <textarea
          value={rawIdea}
          onChange={(e) => setRawIdea(e.target.value)}
          rows={3}
          placeholder="e.g. something about how everyone gets pricing wrong when entering a new market..."
          className={`${inputClass} mb-3`}
        />
        <PromptRunner prompt={buildRawIdeaDeveloperPrompt(brand, { rawIdea: rawIdea || "(paste an idea above)" })} label="Develop this idea" />
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Outlier deconstruction</h3>
        <p className="text-xs text-muted mb-3">Paste a viral outlier&apos;s transcript or description — understand exactly why it worked before you model it.</p>
        <textarea
          value={outlierText}
          onChange={(e) => setOutlierText(e.target.value)}
          rows={3}
          placeholder="Paste transcript or a description of the video..."
          className={`${inputClass} mb-3`}
        />
        <PromptRunner
          prompt={buildOutlierDeconstructionPrompt({ transcriptOrDescription: outlierText || "(paste above)" })}
          label="Deconstruct"
        />
      </Card>
    </div>
  );
}

function HooksScriptsTab({ brand }: { brand: BrandConfig }) {
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [industry, setIndustry] = useState("");

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-heading text-xl mb-3">Hook stack generator</h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className={inputClass} />
          <select value={angle} onChange={(e) => setAngle(e.target.value)} className={inputClass}>
            <option value="">Angle (optional)</option>
            {SCRIPT_ANGLES.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <PromptRunner prompt={buildHookStackPrompt(brand, { topic: topic || "(enter a topic above)", angle })} label="Generate hook stacks" />
        <p className="text-xs text-muted mt-3">Full builder with a saveable hook library lives in the <a href="/hooks" className="text-accent">Hook Lab</a>.</p>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Signature series — &quot;How to Enter an Industry&quot;</h3>
        <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" className={`${inputClass} mb-3`} />
        <PromptRunner prompt={buildIndustryEntrySeriesPrompt(brand, { industry: industry || "(enter above)", episodes: 5 })} label="Design series" />
        <p className="text-xs text-muted mt-3">Full script generators (authority, storytelling, transcript templatizer) live in <a href="/scripts" className="text-accent">Script Studio</a>.</p>
      </Card>
    </div>
  );
}

function CaptionsCtaTab({ brand }: { brand: BrandConfig }) {
  const [hook, setHook] = useState("");
  const [topic, setTopic] = useState("");
  const [ctaType, setCtaType] = useState("follow");
  const [triggerWord, setTriggerWord] = useState("");
  const [offer, setOffer] = useState("");

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-heading text-xl mb-3">Caption generator</h3>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="Written hook" className={`${inputClass} md:col-span-2`} />
          <select value={ctaType} onChange={(e) => setCtaType(e.target.value)} className={inputClass}>
            <option value="follow">Follow</option>
            <option value="engagement">Engagement</option>
            <option value="manychat">ManyChat</option>
            <option value="none">None</option>
          </select>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (for hashtags)" className={`${inputClass} md:col-span-3`} />
        </div>
        <PromptRunner prompt={buildCaptionPrompt(brand, { hook: hook || "(enter a hook above)", ctaType, topic })} label="Generate caption" />
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">ManyChat automated DM writer</h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <input value={triggerWord} onChange={(e) => setTriggerWord(e.target.value)} placeholder="Trigger word (e.g. GUIDE)" className={inputClass} />
          <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="Offer being delivered" className={inputClass} />
        </div>
        <PromptRunner
          prompt={buildManyChatMessagePrompt(brand, { triggerWord: triggerWord || "[TRIGGER]", offer: offer || "[OFFER]" })}
          label="Write DM sequence"
        />
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Batch ideation (calendar)</h3>
        <PromptRunner
          prompt={buildCalendarIdeationPrompt(brand, { count: 12, pillarRatio: brand.pillarRatio, conceptRatio: brand.conceptRatio })}
          label="Propose 12 topics"
        />
        <p className="text-xs text-muted mt-3">Full planner + ratio tracker lives in the <a href="/calendar" className="text-accent">Calendar</a>.</p>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Double-down variant generator</h3>
        <DoubleDownInline brand={brand} />
        <p className="text-xs text-muted mt-3">Pull directly from logged posts in <a href="/analytics" className="text-accent">Analytics</a>.</p>
      </Card>
    </div>
  );
}

function DoubleDownInline({ brand }: { brand: BrandConfig }) {
  const [topic, setTopic] = useState("");
  const [hook, setHook] = useState("");
  const [format, setFormat] = useState("");
  return (
    <div>
      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic that outperformed" className={inputClass} />
        <input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="Its hook (optional)" className={inputClass} />
        <input value={format} onChange={(e) => setFormat(e.target.value)} placeholder="Its format (optional)" className={inputClass} />
      </div>
      <PromptRunner prompt={buildDoubleDownPrompt(brand, { topic: topic || "(enter above)", hook, format })} label="Generate variants" />
    </div>
  );
}

function ReferenceTab() {
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-heading text-xl mb-3">The 5x outlier rule</h3>
        <p className="text-sm text-muted">{FIVE_X_OUTLIER_RULE}</p>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Transcript templatizing prompt</h3>
        <p className="text-sm text-muted">{TRANSCRIPT_TEMPLATIZE_PROMPT}</p>
        <p className="text-xs text-muted mt-2">Run this in <a href="/scripts" className="text-accent">Script Studio → Transcript → Template</a>.</p>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">7 script / hook angles</h3>
        <div className="space-y-4">
          {SCRIPT_ANGLES.map((a) => (
            <div key={a.id}>
              <div className="text-sm font-medium">{a.name}</div>
              <div className="text-xs text-muted mb-1">{a.description}</div>
              <div className="text-xs bg-background/40 border border-border/10 rounded-md px-3 py-2">{a.fillInTemplate}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Universal cross-niche hook templates</h3>
        <ul className="space-y-2 text-sm">
          {UNIVERSAL_HOOK_TEMPLATES.map((t) => (
            <li key={t} className="rounded-md bg-background/40 px-3 py-2 border border-border/10">
              {t}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">7 story types</h3>
        <div className="space-y-4">
          {STORY_TYPES.map((s) => (
            <div key={s.id}>
              <div className="text-sm font-medium">{s.name}</div>
              <div className="text-xs text-muted mb-1">{s.description}</div>
              <div className="text-xs bg-background/40 border border-border/10 rounded-md px-3 py-2">{s.fillInTemplate}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Journey series formats</h3>
        <ul className="text-sm space-y-2">
          {JOURNEY_SERIES_FORMATS.map((f) => (
            <li key={f.id}>
              <span className="font-medium">{f.name}:</span> <span className="text-muted">{f.description}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">9 authority content formats</h3>
        <ul className="text-sm space-y-1.5 text-muted">
          {AUTHORITY_CONTENT_FORMATS.map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">11 filming formats</h3>
        <ul className="text-sm space-y-2">
          {FILMING_FORMATS.map((f) => (
            <li key={f.id}>
              <span className="font-medium">{f.name}:</span> <span className="text-muted">{f.description}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-3">Profile mechanics — right vs. wrong</h3>
        <ul className="space-y-2 text-sm">
          {PROFILE_RIGHT_WRONG.map((r) => (
            <li key={r.field} className="border-b border-border/10 pb-2 last:border-0">
              <div className="font-medium">{r.field}</div>
              <div className="text-red-400/80">✗ {r.wrong}</div>
              <div className="text-accent">✓ {r.right}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { BrandConfig } from "@/lib/brand";
import { buildCarouselPrompt } from "@/lib/carousel-prompts";
import {
  CAROUSEL_ARCHETYPES,
  CAROUSEL_CTA_TYPES,
  CAROUSEL_BACKGROUND_STYLES,
  CAROUSEL_BACKGROUND_CATEGORIES,
  CAROUSEL_HOOK_PATTERNS,
  type CarouselCtaType,
} from "@/lib/carousel-reference";
import { saveCarouselAction, deleteCarouselAction } from "@/lib/carousel-actions";
import { Card, Badge, SubTabs, DeleteForm } from "../components/ui";
import PromptRunner from "../components/PromptRunner";

type CarouselRow = { id: number; title: string; archetype: string; status: string; slide_count: number };

const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";

export default function CarouselsClient({ brand, carousels }: { brand: BrandConfig; carousels: CarouselRow[] }) {
  const [tab, setTab] = useState("generate");

  return (
    <div>
      <SubTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "generate", label: "Generate" },
          { id: "bank", label: `Carousel Bank (${carousels.length})` },
          { id: "guide", label: "Craft Guide" },
        ]}
      />
      {tab === "generate" && <GenerateTab brand={brand} />}
      {tab === "bank" && <BankTab carousels={carousels} />}
      {tab === "guide" && <GuideTab />}
    </div>
  );
}

function GenerateTab({ brand }: { brand: BrandConfig }) {
  const [topic, setTopic] = useState("");
  const [archetypeId, setArchetypeId] = useState(CAROUSEL_ARCHETYPES[0].id);
  const [slideCount, setSlideCount] = useState(8);
  const [funnel, setFunnel] = useState<"tofu" | "mofu" | "bofu">("tofu");
  const [cta, setCta] = useState<CarouselCtaType>("save");
  const [backgroundStyle, setBackgroundStyle] = useState("solid");
  const [backgroundCategory, setBackgroundCategory] = useState("");
  const [designNotes, setDesignNotes] = useState("");

  const archetype = CAROUSEL_ARCHETYPES.find((a) => a.id === archetypeId) ?? CAROUSEL_ARCHETYPES[0];
  const prompt = buildCarouselPrompt(brand, {
    archetypeId,
    topic: topic || "(enter a topic below)",
    slideCount,
    funnelStage: funnel,
    ctaType: cta,
  });

  async function handleSave(text: string) {
    const fd = new FormData();
    fd.set("title", topic || "Untitled carousel");
    fd.set("pillar", archetype.id === "story_arc" || archetype.id === "quote_chain" ? "journey" : "authority");
    fd.set("content_type", archetype.id === "story_arc" ? "storytelling" : "educational");
    fd.set("archetype", archetypeId);
    fd.set("cta_type", cta);
    fd.set("funnel_stage", funnel);
    fd.set("background_style", backgroundStyle);
    fd.set("background_category", backgroundStyle === "photo" ? backgroundCategory : "");
    fd.set("design_notes", designNotes);
    fd.set("slides_text", text);
    await saveCarouselAction(fd);
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <h3 className="font-heading text-xl mb-3">Carousel generator</h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div className="md:col-span-2">
            <label className="text-xs text-muted block mb-1">Topic</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Archetype</label>
            <select value={archetypeId} onChange={(e) => setArchetypeId(e.target.value)} className={inputClass}>
              {CAROUSEL_ARCHETYPES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Slide count</label>
            <input
              type="number"
              min={5}
              max={20}
              value={slideCount}
              onChange={(e) => setSlideCount(Number(e.target.value) || 8)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Funnel stage</label>
            <select value={funnel} onChange={(e) => setFunnel(e.target.value as typeof funnel)} className={inputClass}>
              <option value="tofu">TOFU</option>
              <option value="mofu">MOFU</option>
              <option value="bofu">BOFU</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">CTA type (last slide)</label>
            <select value={cta} onChange={(e) => setCta(e.target.value as CarouselCtaType)} className={inputClass}>
              {CAROUSEL_CTA_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Background style</label>
            <select value={backgroundStyle} onChange={(e) => setBackgroundStyle(e.target.value)} className={inputClass}>
              {CAROUSEL_BACKGROUND_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {backgroundStyle === "photo" && (
            <div>
              <label className="text-xs text-muted block mb-1">Background photo category</label>
              <select value={backgroundCategory} onChange={(e) => setBackgroundCategory(e.target.value)} className={inputClass}>
                <option value="">Choose...</option>
                {CAROUSEL_BACKGROUND_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <label className="text-xs text-muted block mb-1">Design notes (art direction)</label>
            <input
              value={designNotes}
              onChange={(e) => setDesignNotes(e.target.value)}
              placeholder="e.g. Bold navy gradient, white sans-serif headlines, numbered badge per slide"
              className={inputClass}
            />
          </div>
        </div>
        <p className="text-xs text-muted mb-3">{archetype.description}</p>
        <PromptRunner prompt={prompt} label="Generate carousel" onSave={handleSave} saveLabel="Save to bank" />
      </Card>

      <Card>
        <h3 className="font-heading text-lg mb-2">Hook patterns</h3>
        <ul className="text-xs text-muted space-y-2">
          {CAROUSEL_HOOK_PATTERNS.map((h) => (
            <li key={h.id} className="border-b border-border/10 pb-2">
              {h.template}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function BankTab({ carousels }: { carousels: CarouselRow[] }) {
  const [slidesById, setSlidesById] = useState<Record<number, { slide_number: number; slide_role: string; headline: string; supporting_text: string }[] | "loading">>({});

  async function loadSlides(id: number) {
    if (slidesById[id]) return;
    setSlidesById((s) => ({ ...s, [id]: "loading" }));
    const res = await fetch(`/api/carousels/${id}/slides`);
    const data = await res.json();
    setSlidesById((s) => ({ ...s, [id]: data.slides }));
  }

  return (
    <Card>
      <h3 className="font-heading text-xl mb-4">Carousels ({carousels.length})</h3>
      {carousels.length === 0 ? (
        <p className="text-sm text-muted">No carousels saved yet -- generate one above.</p>
      ) : (
        <div className="space-y-3">
          {carousels.map((c) => {
            const slides = slidesById[c.id];
            return (
              <details key={c.id} className="rounded-lg border border-border/10 p-3" onToggle={(e) => e.currentTarget.open && loadSlides(c.id)}>
                <summary className="cursor-pointer text-sm font-medium flex items-center justify-between">
                  <span>{c.title}</span>
                  <span className="flex gap-2">
                    <Badge>{c.archetype}</Badge>
                    <Badge>{c.slide_count} slides</Badge>
                    <Badge tone={c.status === "posted" ? "accent" : "default"}>{c.status}</Badge>
                  </span>
                </summary>
                <div className="mt-3 text-xs space-y-2">
                  {!slides || slides === "loading" ? (
                    <p className="text-muted">Loading slides...</p>
                  ) : (
                    slides.map((s) => (
                      <div key={s.slide_number} className="border-b border-border/10 pb-2">
                        <span className="text-foreground/70">
                          #{s.slide_number} [{s.slide_role.toUpperCase()}]
                        </span>{" "}
                        <span className="font-medium">{s.headline}</span>
                        {s.supporting_text && <p className="text-muted mt-0.5">{s.supporting_text}</p>}
                      </div>
                    ))
                  )}
                  <div className="pt-2">
                    <DeleteForm action={deleteCarouselAction} id={c.id} />
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function GuideTab() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="font-heading text-lg mb-3">Archetypes</h3>
        <div className="space-y-3 text-xs">
          {CAROUSEL_ARCHETYPES.map((a) => (
            <div key={a.id} className="border-b border-border/10 pb-2">
              <p className="font-medium text-sm">{a.name}</p>
              <p className="text-muted">
                {a.description} ({a.slideCount} slides)
              </p>
              <p className="text-muted mt-1 whitespace-pre-line">{a.fillInTemplate}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-heading text-lg mb-3">Background categories</h3>
        <div className="space-y-2 text-xs">
          {CAROUSEL_BACKGROUND_CATEGORIES.map((b) => (
            <div key={b.id} className="border-b border-border/10 pb-2">
              <p className="font-medium text-sm">{b.name}</p>
              <p className="text-muted">{b.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

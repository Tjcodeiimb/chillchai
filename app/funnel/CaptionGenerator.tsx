"use client";

import { useState } from "react";
import { BrandConfig } from "@/lib/brand";
import { buildCaptionPrompt } from "@/lib/prompts";
import PromptRunner from "../components/PromptRunner";

export default function CaptionGenerator({ brand }: { brand: BrandConfig }) {
  const [hook, setHook] = useState("");
  const [topic, setTopic] = useState("");
  const [ctaType, setCtaType] = useState("follow");

  const prompt = buildCaptionPrompt(brand, { hook: hook || "(enter a hook below)", ctaType, topic });
  const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";

  return (
    <div>
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
      <PromptRunner prompt={prompt} label="Generate caption" />
    </div>
  );
}

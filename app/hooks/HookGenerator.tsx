"use client";

import { useState } from "react";
import { BrandConfig } from "@/lib/brand";
import { buildHookStackPrompt } from "@/lib/prompts";
import { SCRIPT_ANGLES } from "@/lib/reference";
import PromptRunner from "../components/PromptRunner";

export default function HookGenerator({ brand }: { brand: BrandConfig }) {
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");

  const prompt = buildHookStackPrompt(brand, { topic: topic || "(enter a topic below)", angle });
  const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-muted block mb-1">Topic</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass} placeholder="e.g. why most consultants overprice a market entry" />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Angle (optional)</label>
          <select value={angle} onChange={(e) => setAngle(e.target.value)} className={inputClass}>
            <option value="">—</option>
            {SCRIPT_ANGLES.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <PromptRunner prompt={prompt} label="Generate hook stacks" />
    </div>
  );
}

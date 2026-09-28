"use client";

import { useState } from "react";
import { BrandConfig } from "@/lib/brand";
import { buildTopicResearchPrompt, buildProblemResearchPrompt } from "@/lib/prompts";
import PromptRunner from "../components/PromptRunner";

export default function ResearchPrompts({ brand }: { brand: BrandConfig }) {
  const [subniche, setSubniche] = useState(brand.subniches[0] ?? "");
  const selectClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";

  const topicPrompt = buildTopicResearchPrompt(brand, { subniche });
  const problemPrompt = buildProblemResearchPrompt(brand, { subniche });

  return (
    <div>
      <label className="text-xs text-muted block mb-1">Sub-niche</label>
      <select value={subniche} onChange={(e) => setSubniche(e.target.value)} className={`${selectClass} mb-4`}>
        {brand.subniches.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Topic & framework research</h4>
          <PromptRunner prompt={topicPrompt} label="Research topics" />
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Problem research</h4>
          <PromptRunner prompt={problemPrompt} label="Research problems" />
        </div>
      </div>
    </div>
  );
}

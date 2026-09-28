import { getBrand } from "@/lib/brand";
import { Card, SectionHeader, Badge } from "../components/ui";
import ResearchPrompts from "./ResearchPrompts";

const DIRECTORY = [
  { label: "Keyword bank", where: "/research", note: "Niche + sub-niches + occupation → 5x outlier search terms" },
  { label: "Hook stack generator", where: "/hooks", note: "Written + verbal + visual hooks for any topic/angle" },
  { label: "Authority / educational script", where: "/scripts", note: "Full script from angle + topic + format" },
  { label: "Storytelling script", where: "/scripts", note: "Full script from a story type + your journey assets" },
  { label: "Transcript → template", where: "/scripts", note: "The exact templatizing prompt from your playbook" },
  { label: "Signature series builder", where: "/scripts", note: "\"How to Enter an Industry\" multi-episode series" },
  { label: "Calendar ideation", where: "/calendar", note: "Batch of topics respecting your live ratios" },
  { label: "Caption generator", where: "/funnel", note: "Hook / CTA / hashtags, 3-line structure" },
  { label: "Double-down variants", where: "/analytics", note: "3 remix variants of your own proven outliers" },
];

export default function PromptsPage() {
  const brand = getBrand();
  const hasKey = !!process.env.GEMINI_API_KEY;

  return (
    <div>
      <SectionHeader
        num="08"
        title="Master Prompt Library"
        description="Every generator in one directory, plus raw research prompts that don't have a home elsewhere yet."
      />

      <Card className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading text-xl">Gemini API status</h3>
          <Badge tone={hasKey ? "accent" : "warn"}>{hasKey ? "Connected" : "Not configured"}</Badge>
        </div>
        <p className="text-sm text-muted">
          {hasKey
            ? "GEMINI_API_KEY is set — every \"Generate\" button will call Gemini directly."
            : "No GEMINI_API_KEY found. Add one to .env.local (GEMINI_API_KEY=your_key) and restart the dev server to enable live generation. Until then, every generator still assembles the full prompt for you to paste into Gemini, Claude, or ChatGPT."}
        </p>
      </Card>

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-4">Prompt directory</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {DIRECTORY.map((d) => (
            <a key={d.label} href={d.where} className="rounded-lg border border-border/10 p-3 hover:border-accent/40 block">
              <div className="text-sm font-medium">{d.label}</div>
              <div className="text-xs text-muted">{d.note}</div>
            </a>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-4">Raw research prompts</h3>
        <ResearchPrompts brand={brand} />
      </Card>
    </div>
  );
}

// Plain-text convention for a generated/pasted carousel: slides separated by
// a line that's just "---" (matching the convention bulk-import.ts already
// uses for scripts), each slide starting with a role label.
//
// HOOK: 5 mistakes killing your onboarding -- save this
// Swipe through before your next client call.
// ---
// BODY: Mistake 1: No clear first-week plan
// Clients stay longer when week one has a visible roadmap.
// ---
// CTA: Save this for your next onboarding
// Tag someone who needs to see this.

export type CarouselSlide = { role: "hook" | "body" | "cta"; headline: string; supportingText: string };

const ROLE_PREFIX: Record<string, CarouselSlide["role"]> = {
  HOOK: "hook",
  BODY: "body",
  CTA: "cta",
};

export function parseCarouselSlides(raw: string): CarouselSlide[] {
  return raw
    .split(/\n\s*---\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      const firstLine = lines[0] || "";
      const match = firstLine.match(/^(HOOK|BODY|CTA)\s*:\s*(.*)$/i);
      const role = match ? ROLE_PREFIX[match[1].toUpperCase()] : "body";
      const headline = match ? match[2] : firstLine;
      const supportingText = lines.slice(1).join("\n").trim();
      return { role, headline, supportingText };
    });
}

export function stringifyCarouselSlides(slides: CarouselSlide[]): string {
  return slides
    .map((s) => {
      const label = s.role.toUpperCase();
      return s.supportingText ? `${label}: ${s.headline}\n${s.supportingText}` : `${label}: ${s.headline}`;
    })
    .join("\n---\n");
}

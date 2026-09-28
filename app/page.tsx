import Link from "next/link";
import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { Card, SectionHeader, Badge } from "./components/ui";

function levelFor(followers: number) {
  if (followers < 1000) return { level: 1, floor: 0, ceil: 1000, name: "Foundation (0 -> 1k)" };
  if (followers < 10000) return { level: 2, floor: 1000, ceil: 10000, name: "Data & Scale (1k -> 10k)" };
  return { level: 3, floor: 10000, ceil: 100000, name: "Personal Brand (10k -> 100k)" };
}

export default async function DashboardPage() {
  const brand = await getBrand();
  const level = levelFor(brand.followerCount);
  const progressPct = Math.min(
    100,
    Math.round(((brand.followerCount - level.floor) / (level.ceil - level.floor)) * 100)
  );

  const pillarCounts = await sql<{ pillar: string; n: number }[]>`
    SELECT pillar, COUNT(*)::int as n FROM calendar_items GROUP BY pillar
  `;
  const conceptCounts = await sql<{ concept_bucket: string; n: number }[]>`
    SELECT concept_bucket, COUNT(*)::int as n FROM calendar_items GROUP BY concept_bucket
  `;
  const totalItems = pillarCounts.reduce((s, r) => s + r.n, 0);

  const authorityCount = pillarCounts.find((r) => r.pillar === "authority")?.n ?? 0;
  const authorityPct = totalItems ? Math.round((authorityCount / totalItems) * 100) : 0;
  const journeyPct = totalItems ? 100 - authorityPct : 0;

  const upcoming = await sql<{ id: number; date: string; topic: string; pillar: string; status: string }[]>`
    SELECT * FROM calendar_items WHERE status != 'posted' ORDER BY date ASC LIMIT 6
  `;

  const links = [
    { href: "/brand", label: "Brand Foundation", desc: "Niche, story, visual identity, profile" },
    { href: "/calendar", label: "Calendar & Batching", desc: "Plan the next batch, track ratios" },
    { href: "/research", label: "Outlier Research", desc: "5x outlier log + keyword bank" },
    { href: "/hooks", label: "Hook Lab", desc: "Hook stacks, 7 angles, universal templates" },
    { href: "/scripts", label: "Script Studio", desc: "Authority, storytelling, signature series" },
    { href: "/production", label: "Production Planner", desc: "Formats, equipment, shot lists" },
    { href: "/funnel", label: "CTA & Funnel Mapper", desc: "TOFU/MOFU/BOFU + captions" },
    { href: "/prompts", label: "Master Prompt Library", desc: "Every AI prompt in one place" },
    { href: "/analytics", label: "Analytics & Levels", desc: "Top/bottom performers, double-downs" },
  ];

  return (
    <div>
      <SectionHeader
        num="00"
        title={`Welcome back, ${brand.nameField.split("|")[0].trim()}`}
        description="Your content operating system for the next 60-100 videos — built strictly on your growth blueprint."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="text-xs text-muted uppercase tracking-wide mb-2">Current level</div>
          <div className="font-heading text-3xl mb-1">Level {level.level}</div>
          <div className="text-sm text-muted mb-3">{level.name}</div>
          <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="text-xs text-muted mt-2">
            {brand.followerCount.toLocaleString()} / {level.ceil.toLocaleString()} followers ({level.ceil - brand.followerCount} to go)
          </div>
        </Card>

        <Card>
          <div className="text-xs text-muted uppercase tracking-wide mb-2">Pillar ratio (target {brand.pillarRatio.authority}/{brand.pillarRatio.journey})</div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-heading text-3xl">{authorityPct}%</span>
            <span className="text-sm text-muted">Authority</span>
          </div>
          <div className="h-2 rounded-full bg-foreground/10 overflow-hidden flex">
            <div className="h-full bg-accent" style={{ width: `${authorityPct}%` }} />
            <div className="h-full bg-accent-deep" style={{ width: `${journeyPct}%` }} />
          </div>
          <div className="text-xs text-muted mt-2">{journeyPct}% Journey · {totalItems} batched items total</div>
        </Card>

        <Card>
          <div className="text-xs text-muted uppercase tracking-wide mb-2">Concept split (target {brand.conceptRatio.proven}/{brand.conceptRatio.doubleDown}/{brand.conceptRatio.experimental})</div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {["proven", "double_down", "experimental"].map((k) => {
              const n = conceptCounts.find((r) => r.concept_bucket === k)?.n ?? 0;
              return (
                <Badge key={k} tone={k === "proven" ? "accent" : "default"}>
                  {k.replace("_", " ")}: {n}
                </Badge>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-3">Account status: {brand.accountStatus} · posting {brand.postingCadence.timesPerWeek}x/week</p>
        </Card>
      </div>

      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl">Upcoming in the batch</h2>
          <Link href="/calendar" className="text-sm text-accent">Open calendar →</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">No calendar items yet. Head to Calendar & Batching to plan your first batch.</p>
        ) : (
          <ul className="divide-y divide-border/10">
            {upcoming.map((item) => (
              <li key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                <span>
                  <span className="text-muted mr-3">{item.date}</span>
                  {item.topic || "(untitled topic)"}
                </span>
                <span className="flex gap-2">
                  <Badge>{item.pillar}</Badge>
                  <Badge tone="accent">{item.status}</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="h-full hover:border-accent/50 transition-colors">
              <div className="font-heading text-xl mb-1">{l.label}</div>
              <div className="text-sm text-muted">{l.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { Card, SectionHeader } from "../components/ui";
import { SCRIPT_ANGLES, STORY_TYPES, FILMING_FORMATS } from "@/lib/reference";
import ImproveClient, { type ExistingScript } from "./ImproveClient";

export const dynamic = "force-dynamic";

export default async function ImprovePage() {
  const [brand, scripts] = await Promise.all([
    getBrand(),
    // Metadata only -- the selected script's body is fetched lazily (see
    // /api/scripts/[id]/body) instead of shipping every script's full body
    // text on every Script Improver visit.
    sql<ExistingScript[]>`
      SELECT id, title, pillar, content_type, angle_or_story_type, format, cta_type, funnel_stage
      FROM scripts ORDER BY created_at DESC
    `,
  ]);

  return (
    <div>
      <SectionHeader
        num="11"
        title="Script Improver"
        description="Hand over an existing script -- pasted, or pulled from your library -- and get a diagnose-first, targeted rewrite grounded in every angle, format, funnel stage, and CTA rule this app tracks."
      />

      <details className="mb-8 rounded-2xl border border-border/15 bg-card/40">
        <summary className="cursor-pointer select-none px-5 py-4 font-heading text-xl">
          Reference: every angle, format, funnel stage &amp; CTA style
        </summary>
        <div className="px-5 pb-5 grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-heading text-lg mb-3">7 script angles</h3>
            <ul className="space-y-2 text-sm">
              {SCRIPT_ANGLES.map((a) => (
                <li key={a.id}>
                  <span className="font-medium">{a.name}</span>
                  <span className="text-muted"> -- {a.description}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-heading text-lg mb-3">7 story types (journey pillar)</h3>
            <ul className="space-y-2 text-sm">
              {STORY_TYPES.map((s) => (
                <li key={s.id}>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted"> -- {s.description}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="md:col-span-2">
            <h3 className="font-heading text-lg mb-3">12 filming formats</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {FILMING_FORMATS.map((f) => (
                <div key={f.id}>
                  <span className="font-medium">{f.name}</span>
                  <span className="text-muted"> -- {f.description}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </details>

      <ImproveClient brand={brand} scripts={scripts} />
    </div>
  );
}

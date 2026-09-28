import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { Card, SectionHeader, Badge } from "../components/ui";
import CaptionGenerator from "./CaptionGenerator";

type Item = { id: number; topic: string; funnel_stage: string; cta_type: string; status: string };

export const dynamic = "force-dynamic";

export default async function FunnelPage() {
  const brand = await getBrand();
  const items = await sql<Item[]>`
    SELECT id, topic, funnel_stage, cta_type, status FROM calendar_items ORDER BY date ASC
  `;

  const stages: Item["funnel_stage"][] = ["tofu", "mofu", "bofu"];

  return (
    <div>
      <SectionHeader num="07" title="CTA & Funnel Mapper" description="Every video should know its job: reach (TOFU), nurture (MOFU), or convert (BOFU)." />

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <h3 className="font-heading text-xl mb-3">CTA decision guide</h3>
          <ul className="text-sm space-y-2">
            <li><span className="font-medium">Follow</span> — default for TOFU reach plays and proven-concept videos.</li>
            <li><span className="font-medium">Engagement</span> — &quot;comment X&quot; plays, good for MOFU when you want signal before a pitch.</li>
            <li>
              <span className="font-medium">ManyChat</span> — trigger-word → automated DM with your landing page link. Best for BOFU lead gen.{" "}
              {!brand.manychatSetup && <Badge tone="warn">not set up yet</Badge>}
            </li>
            <li><span className="font-medium">None</span> — pure brand/value exposure, no ask.</li>
          </ul>
          {!brand.manychatSetup && (
            <div className="mt-4 text-xs text-muted border-t border-border/10 pt-3">
              <p className="font-medium text-foreground mb-1">ManyChat setup checklist</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Create a ManyChat account, connect it to your Instagram business profile.</li>
                <li>Build one automation: comment keyword → auto-DM with your one bio link.</li>
                <li>Pick 1 trigger word per offer (e.g. &quot;GUIDE&quot;, &quot;AUDIT&quot;).</li>
                <li>Test the DM flow yourself before using it live in a CTA.</li>
              </ol>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-heading text-xl mb-3">Funnel distribution</h3>
          <div className="space-y-3">
            {stages.map((stage) => {
              const list = items.filter((i) => i.funnel_stage === stage);
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{stage.toUpperCase()}</span>
                    <span className="text-muted">{list.length}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${items.length ? (list.length / items.length) * 100 : 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-heading text-xl mb-3">Caption generator</h3>
        <p className="text-xs text-muted mb-3">Hook / CTA / hashtags — the exact 3-line structure.</p>
        <CaptionGenerator brand={brand} />
      </Card>
    </div>
  );
}

import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { buildKeywordBankPrompt } from "@/lib/prompts";
import { FIVE_X_OUTLIER_RULE, SCRIPT_ANGLES } from "@/lib/reference";
import { createOutlier, toggleOutlierUsed, deleteOutlier } from "@/lib/actions";
import { Card, SectionHeader, Badge, DeleteForm } from "../components/ui";
import PromptRunner from "../components/PromptRunner";

type Outlier = {
  id: number;
  source_type: string;
  creator_handle: string;
  link: string;
  niche_keyword: string;
  follower_count: number;
  views: number;
  hook_written: string;
  hook_verbal: string;
  hook_visual: string;
  angle: string;
  notes: string;
  used: boolean;
};

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const brand = await getBrand();
  const rows = await sql<Outlier[]>`SELECT * FROM outlier_research ORDER BY created_at DESC`;
  const keywordPrompt = buildKeywordBankPrompt(brand);

  const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";
  const selectClass = inputClass;

  return (
    <div>
      <SectionHeader
        num="03"
        title="Outlier Research Hub"
        description="Never guess. Every hook and script should trace back to a proven 5x outlier."
      />

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <h3 className="font-heading text-xl mb-2">The 5x outlier rule</h3>
          <p className="text-sm text-muted">{FIVE_X_OUTLIER_RULE}</p>
          <div className="mt-4 text-sm space-y-2">
            <p><span className="font-medium">Reset the algorithm:</span> dummy account → Profile → Menu → Content Preferences → Reset Suggested Content → Reset.</p>
            <p><span className="font-medium">3 search methods:</span> creator research (Sort Feed extension), keyword research (Explore → Reels), recommendation feed (hidden gems after searching).</p>
            <p><span className="font-medium">4 creator discovery methods:</span> Accounts-tab search, Reels-tab profile screenshots, Suggested Accounts after following, and top creators&apos; Following lists.</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-heading text-xl mb-3">Keyword bank generator</h3>
          <p className="text-xs text-muted mb-3">Niche + sub-niches + occupation → search terms for the Explore/Reels tab.</p>
          <PromptRunner prompt={keywordPrompt} label="Generate keyword bank" />
        </Card>
      </div>

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-4">Log an outlier</h3>
        <form action={createOutlier} className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Source</label>
            <select name="source_type" className={selectClass} defaultValue="keyword">
              <option value="keyword">Keyword search</option>
              <option value="creator">Creator research</option>
              <option value="feed">Recommendation feed</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Creator handle</label>
            <input name="creator_handle" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Link</label>
            <input name="link" className={inputClass} placeholder="instagram.com/reel/..." />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Keyword used</label>
            <input name="niche_keyword" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Their follower count</label>
            <input type="number" name="follower_count" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Views on the reel</label>
            <input type="number" name="views" className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Written hook</label>
            <input name="hook_written" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Verbal hook</label>
            <input name="hook_verbal" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Visual hook</label>
            <input name="hook_visual" className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Angle</label>
            <select name="angle" className={selectClass} defaultValue="">
              <option value="">—</option>
              {SCRIPT_ANGLES.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted block mb-1">Notes</label>
            <input name="notes" className={inputClass} />
          </div>

          <div className="md:col-span-3">
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">Save to research log</button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-4">Research log ({rows.length})</h3>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">No outliers logged yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const multiple = r.follower_count > 0 ? r.views / r.follower_count : 0;
              const isOutlier = multiple >= 5;
              return (
                <div key={r.id} className="rounded-lg border border-border/10 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm">
                      <span className="font-medium">{r.creator_handle || r.niche_keyword || "(untitled)"}</span>
                      {r.link && (
                        <a href={r.link} target="_blank" className="text-accent text-xs ml-2">
                          link
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isOutlier && <Badge tone="accent">{multiple.toFixed(1)}x OUTLIER</Badge>}
                      {!isOutlier && r.follower_count > 0 && <Badge>{multiple.toFixed(1)}x</Badge>}
                      <Badge>{r.source_type}</Badge>
                      {r.used && <Badge tone="accent">used</Badge>}
                    </div>
                  </div>
                  {(r.hook_written || r.hook_verbal || r.hook_visual) && (
                    <p className="text-xs text-muted mt-2">
                      {r.hook_written && `W: "${r.hook_written}" `}
                      {r.hook_verbal && `V: "${r.hook_verbal}" `}
                      {r.hook_visual && `Vis: "${r.hook_visual}"`}
                    </p>
                  )}
                  {r.angle && <p className="text-xs text-muted mt-1">Angle: {r.angle}</p>}
                  <div className="flex items-center gap-3 mt-3">
                    <form action={toggleOutlierUsed}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs rounded-full border border-border/20 px-2.5 py-1 hover:bg-foreground/5">
                        {r.used ? "Mark unused" : "Mark used"}
                      </button>
                    </form>
                    <DeleteForm action={deleteOutlier} id={r.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

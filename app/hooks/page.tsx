import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { SCRIPT_ANGLES, UNIVERSAL_HOOK_TEMPLATES } from "@/lib/reference";
import { createHookStack, deleteHookStack } from "@/lib/actions";
import { Card, SectionHeader, Badge, DeleteForm } from "../components/ui";
import HookGenerator from "./HookGenerator";

type HookStack = {
  id: number;
  written: string;
  verbal: string;
  visual: string;
  angle: string;
  topic: string;
};

export const dynamic = "force-dynamic";

export default async function HooksPage() {
  const [brand, stacks] = await Promise.all([
    getBrand(),
    sql<HookStack[]>`SELECT * FROM hook_stacks ORDER BY created_at DESC`,
  ]);
  const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";
  const selectClass = inputClass;

  return (
    <div>
      <SectionHeader
        num="04"
        title="Hook Lab"
        description={`The first 3 seconds decide everything. Preferred hook types: ${brand.hookPrefs.join(" + ")}.`}
      />

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-3">Hook stack generator</h3>
        <HookGenerator brand={brand} />
      </Card>

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-4">Save a hook stack manually</h3>
        <form action={createHookStack} className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Written hook</label>
            <input name="written" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Verbal hook</label>
            <input name="verbal" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Visual hook</label>
            <input name="visual" className={inputClass} />
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
            <label className="text-xs text-muted block mb-1">Topic</label>
            <input name="topic" className={inputClass} />
          </div>
          <div className="md:col-span-3">
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">Save hook stack</button>
          </div>
        </form>
      </Card>

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-4">Saved hook stacks ({stacks.length})</h3>
        {stacks.length === 0 ? (
          <p className="text-sm text-muted">Nothing saved yet.</p>
        ) : (
          <div className="space-y-3">
            {stacks.map((s) => (
              <div key={s.id} className="rounded-lg border border-border/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{s.topic || "(untitled topic)"}</span>
                  {s.angle && <Badge>{s.angle}</Badge>}
                </div>
                <p className="text-xs text-muted mt-1">
                  {s.written && `W: "${s.written}" `}
                  {s.verbal && `V: "${s.verbal}" `}
                  {s.visual && `Vis: "${s.visual}"`}
                </p>
                <div className="mt-2">
                  <DeleteForm action={deleteHookStack} id={s.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-heading text-xl mb-3">7 hook angles</h3>
          <ul className="space-y-3 text-sm">
            {SCRIPT_ANGLES.map((a) => (
              <li key={a.id}>
                <div className="font-medium">{a.name}</div>
                <div className="text-muted text-xs">{a.description}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="font-heading text-xl mb-3">Universal cross-niche templates</h3>
          <p className="text-xs text-muted mb-2">Use these when niche-specific hooks are running dry.</p>
          <ul className="space-y-2 text-sm">
            {UNIVERSAL_HOOK_TEMPLATES.map((t) => (
              <li key={t} className="rounded-md bg-background/40 px-3 py-2 border border-border/10">
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

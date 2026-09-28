import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { FILMING_FORMATS } from "@/lib/reference";
import { Card, SectionHeader, Badge } from "../components/ui";
import ShotListClient from "./ShotListClient";
import FolderNamer from "./FolderNamer";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  const [brand, scripts] = await Promise.all([
    getBrand(),
    sql<
      { id: number; title: string; body_black: string; body_red: string; body_green: string }[]
    >`SELECT id, title, body_black, body_red, body_green FROM scripts ORDER BY created_at DESC`,
  ]);

  return (
    <div>
      <SectionHeader num="06" title="Production Planner" description="Filming formats, your equipment, and a shot list pulled straight from a saved script." />

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <h3 className="font-heading text-xl mb-3">12 filming formats</h3>
          <ul className="space-y-2 text-sm">
            {FILMING_FORMATS.map((f) => (
              <li key={f.id} className="flex items-start gap-2">
                {brand.formatPrefs.includes(f.id) && <Badge tone="accent">yours</Badge>}
                <span>
                  <span className="font-medium">{f.name}</span> — <span className="text-muted">{f.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="font-heading text-xl mb-3">Equipment checklist</h3>
          <ul className="space-y-1.5 text-sm">
            {brand.equipment.map((e) => (
              <li key={e} className="flex items-center gap-2">
                <span className="text-accent">✓</span> {e}
              </li>
            ))}
          </ul>
          <h3 className="font-heading text-xl mt-6 mb-3">Batch folder name</h3>
          <FolderNamer />
        </Card>
      </div>

      <Card>
        <h3 className="font-heading text-xl mb-4">Shot list from a saved script</h3>
        <ShotListClient scripts={scripts} />
      </Card>
    </div>
  );
}

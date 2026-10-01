import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { requireUserId } from "@/lib/auth";
import { SectionHeader } from "../components/ui";
import ScriptsClient from "./ScriptsClient";

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const userId = await requireUserId();
  const [brand, scripts, templates] = await Promise.all([
    getBrand(userId),
    // Metadata only -- bodies are fetched lazily per script on expand (see
    // /api/scripts/[id]/body), since shipping every script's full body text
    // on every Script Studio visit was a major contributor to slow loads.
    sql`SELECT id, title, pillar, status, series_name FROM scripts WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT * FROM script_templates WHERE user_id = ${userId} ORDER BY created_at DESC`,
  ]);

  return (
    <div>
      <SectionHeader
        num="05"
        title="Script Studio"
        description="Fill-in-the-blank structures beat blank-page guessing. Authority, storytelling, your signature series, and a growing script bank."
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ScriptsClient brand={brand} scripts={scripts as any} templates={templates as any} />
    </div>
  );
}

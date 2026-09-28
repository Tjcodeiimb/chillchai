import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { SectionHeader } from "../components/ui";
import ScriptsClient from "./ScriptsClient";

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const brand = await getBrand();
  const scripts = await sql`SELECT * FROM scripts ORDER BY created_at DESC`;
  const templates = await sql`SELECT * FROM script_templates ORDER BY created_at DESC`;

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

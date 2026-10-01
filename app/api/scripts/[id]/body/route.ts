import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

// Lazy-load a single script's body text on demand (Library/Script Studio
// expand a card) instead of shipping every script's full body on every page
// load -- with 1000+ scripts that full-body payload was the single biggest
// contributor to slow page loads.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await params;
  const scriptId = Number(id);
  if (!Number.isFinite(scriptId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const rows = await sql<{ body_black: string; body_red: string; body_green: string }[]>`
    SELECT body_black, body_red, body_green FROM scripts WHERE id = ${scriptId}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

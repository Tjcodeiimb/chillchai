import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

// Lazy-load a single carousel's slides on demand (Library expands a card)
// instead of shipping every carousel's full slide text on every page load --
// same pattern as /api/scripts/[id]/body for the same reason.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const userId = await getCurrentUserId();
  if (userId === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const carouselId = Number(id);
  if (!Number.isFinite(carouselId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const slides = await sql<{ slide_number: number; slide_role: string; headline: string; supporting_text: string }[]>`
    SELECT slide_number, slide_role, headline, supporting_text FROM carousel_slides
    WHERE carousel_id = ${carouselId} AND user_id = ${userId} ORDER BY slide_number ASC
  `;
  if (slides.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ slides });
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { buildCalendarDoc, toBuffer } from "@/lib/docx-export";

type CalendarRow = {
  date: string;
  pillar: string;
  concept_bucket: string;
  content_type: string;
  topic: string;
  angle: string;
  format: string;
  cta_type: string;
  funnel_stage: string;
  status: string;
};

export async function GET(_req: NextRequest) {
  const userId = await getCurrentUserId();
  if (userId === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const items = await sql<CalendarRow[]>`SELECT * FROM calendar_items WHERE user_id = ${userId} ORDER BY date ASC`;
  const brand = await getBrand(userId);

  const buffer = await toBuffer(buildCalendarDoc(items, brand));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="content-calendar.docx"`,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
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

export async function GET(req: NextRequest) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  const items = db.prepare("SELECT * FROM calendar_items ORDER BY date ASC").all() as CalendarRow[];
  const brand = getBrand();

  const buffer = await toBuffer(buildCalendarDoc(items, brand));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="content-calendar.docx"`,
    },
  });
}

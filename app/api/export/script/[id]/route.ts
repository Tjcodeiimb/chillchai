import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { sql } from "@/lib/db";
import { buildScriptDoc, toBuffer } from "@/lib/docx-export";

type ScriptRow = {
  title: string;
  pillar: string;
  content_type: string;
  angle_or_story_type: string;
  format: string;
  body_black: string;
  body_red: string;
  body_green: string;
  cta_type: string;
  funnel_stage: string;
};

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/export/script/[id]">) {
  const userId = await getCurrentUserId();
  if (userId === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const rows = await sql<ScriptRow[]>`SELECT * FROM scripts WHERE id = ${Number(id)} AND user_id = ${userId}`;
  const script = rows[0];
  if (!script) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const buffer = await toBuffer(buildScriptDoc(script));
  const filename = `${script.title || "script"}.docx`.replace(/[^a-z0-9.\- ]/gi, "_");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

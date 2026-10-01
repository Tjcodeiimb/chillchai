import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { sql } from "@/lib/db";
import { buildScriptBankDoc, toBuffer } from "@/lib/docx-export";

type ScriptRow = {
  title: string;
  pillar: string;
  content_type: string;
  angle_or_story_type: string;
  format: string;
  body_black: string;
  body_red: string;
  body_green: string;
  status: string;
};
type TemplateRow = { name: string; pillar: string; angle: string; template_text: string };

export async function GET(_req: NextRequest) {
  const userId = await getCurrentUserId();
  if (userId === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const scripts = await sql<ScriptRow[]>`SELECT * FROM scripts WHERE user_id = ${userId} ORDER BY created_at DESC`;
  const templates = await sql<TemplateRow[]>`SELECT * FROM script_templates WHERE user_id = ${userId} ORDER BY created_at DESC`;

  const buffer = await toBuffer(buildScriptBankDoc(scripts, templates));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="script-bank.docx"`,
    },
  });
}

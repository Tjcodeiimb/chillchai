import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
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

export async function GET(req: NextRequest) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  const scripts = db.prepare("SELECT * FROM scripts ORDER BY created_at DESC").all() as ScriptRow[];
  const templates = db.prepare("SELECT * FROM script_templates ORDER BY created_at DESC").all() as TemplateRow[];

  const buffer = await toBuffer(buildScriptBankDoc(scripts, templates));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="script-bank.docx"`,
    },
  });
}

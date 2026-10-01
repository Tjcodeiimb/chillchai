import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { generateText } from "@/lib/ai-providers";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (userId === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { prompt } = (await req.json()) as { prompt?: string };

  if (!prompt || !prompt.trim()) {
    return NextResponse.json({ error: "bad_request", message: "Missing prompt" }, { status: 400 });
  }

  const result = await generateText(userId, prompt);
  if (result.ok) {
    return NextResponse.json({ text: result.text });
  }
  return NextResponse.json({ error: result.error, message: result.message, prompt }, { status: 200 });
}

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  const { prompt } = (await req.json()) as { prompt?: string };

  if (!prompt || !prompt.trim()) {
    return NextResponse.json({ error: "bad_request", message: "Missing prompt" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "no_key", prompt }, { status: 200 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isQuota = /quota|rate.?limit|429|RESOURCE_EXHAUSTED/i.test(message);
    return NextResponse.json(
      { error: isQuota ? "quota" : "generation_failed", message, prompt },
      { status: 200 }
    );
  }
}

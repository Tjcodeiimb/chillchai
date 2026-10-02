import { sql, ensureSchema } from "./db";

// Plug-and-play AI provider layer: one settings row (provider + API key +
// optional model/endpoint override) drives every generation call in the
// app, instead of a single hardcoded Gemini key read from an env var. Swap
// providers or rotate a key from the Settings page -- no redeploy needed.

export const AI_PROVIDERS = ["gemini", "openai", "anthropic", "custom"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI",
  anthropic: "Anthropic (Claude)",
  custom: "Custom (OpenAI-compatible endpoint)",
};

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  gemini: "gemini-2.5-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-5-5",
  custom: "",
};

export type AiSettings = {
  provider: AiProvider;
  apiKey: string;
  model: string;
  customEndpoint: string;
};

const EMPTY_SETTINGS: AiSettings = { provider: "gemini", apiKey: "", model: "", customEndpoint: "" };

export async function getAiSettings(userId: number): Promise<AiSettings> {
  await ensureSchema();
  const rows = await sql<
    { provider: string; api_key: string; model: string; custom_endpoint: string }[]
  >`SELECT provider, api_key, model, custom_endpoint FROM ai_settings WHERE user_id = ${userId} ORDER BY id ASC LIMIT 1`;
  if (rows.length === 0) return EMPTY_SETTINGS;
  const row = rows[0];
  const provider = (AI_PROVIDERS as readonly string[]).includes(row.provider)
    ? (row.provider as AiProvider)
    : "gemini";
  return { provider, apiKey: row.api_key, model: row.model, customEndpoint: row.custom_endpoint };
}

// For display on the Settings page -- never send the real key back to the
// browser, only whether one is set and its last 4 characters for recognition.
export async function getMaskedAiSettings(userId: number): Promise<{
  provider: AiProvider;
  model: string;
  customEndpoint: string;
  hasKey: boolean;
  keyPreview: string;
}> {
  const settings = await getAiSettings(userId);
  return {
    provider: settings.provider,
    model: settings.model,
    customEndpoint: settings.customEndpoint,
    hasKey: !!settings.apiKey,
    keyPreview: settings.apiKey ? `••••${settings.apiKey.slice(-4)}` : "",
  };
}

export async function saveAiSettings(userId: number, settings: AiSettings): Promise<void> {
  await ensureSchema();
  const existing = await sql<{ id: number }[]>`SELECT id FROM ai_settings WHERE user_id = ${userId} ORDER BY id ASC LIMIT 1`;
  if (existing.length > 0) {
    await sql`
      UPDATE ai_settings
      SET provider = ${settings.provider}, api_key = ${settings.apiKey}, model = ${settings.model},
          custom_endpoint = ${settings.customEndpoint}, updated_at = now()
      WHERE id = ${existing[0].id}
    `;
  } else {
    await sql`
      INSERT INTO ai_settings (provider, api_key, model, custom_endpoint, user_id)
      VALUES (${settings.provider}, ${settings.apiKey}, ${settings.model}, ${settings.customEndpoint}, ${userId})
    `;
  }
}

export async function clearAiKey(userId: number): Promise<void> {
  await ensureSchema();
  await sql`UPDATE ai_settings SET api_key = '', updated_at = now() WHERE user_id = ${userId}`;
}

export type GenerateResult =
  | { ok: true; text: string }
  | { ok: false; error: "no_key" | "quota" | "generation_failed"; message?: string };

// Falls back to GEMINI_API_KEY from the environment when no settings row
// (or an empty key) exists yet, so existing single-key deployments keep
// working exactly as before without anyone touching Settings.
async function resolveSettings(userId: number): Promise<AiSettings> {
  const settings = await getAiSettings(userId);
  if (settings.apiKey) return settings;
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey) {
    return { provider: "gemini", apiKey: envKey, model: process.env.GEMINI_MODEL || "", customEndpoint: "" };
  }
  return settings;
}

export async function generateText(userId: number, prompt: string): Promise<GenerateResult> {
  const settings = await resolveSettings(userId);
  if (!settings.apiKey) return { ok: false, error: "no_key" };

  try {
    switch (settings.provider) {
      case "gemini":
        return await callGemini(prompt, settings);
      case "openai":
        return await callOpenAiCompatible(prompt, settings, "https://api.openai.com/v1/chat/completions");
      case "anthropic":
        return await callAnthropic(prompt, settings);
      case "custom":
        if (!settings.customEndpoint) return { ok: false, error: "generation_failed", message: "No custom endpoint set" };
        return await callOpenAiCompatible(prompt, settings, settings.customEndpoint);
      default:
        return { ok: false, error: "generation_failed", message: "Unknown provider" };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isQuota = /quota|rate.?limit|429|RESOURCE_EXHAUSTED/i.test(message);
    return { ok: false, error: isQuota ? "quota" : "generation_failed", message };
  }
}

async function callGemini(prompt: string, settings: AiSettings): Promise<GenerateResult> {
  const model = settings.model || DEFAULT_MODELS.gemini;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || `Gemini request failed (${res.status})`;
    throw new Error(message);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  if (!text) return { ok: false, error: "generation_failed", message: "Empty response from Gemini" };
  return { ok: true, text };
}

async function callOpenAiCompatible(prompt: string, settings: AiSettings, endpoint: string): Promise<GenerateResult> {
  const model = settings.model || DEFAULT_MODELS.openai;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) return { ok: false, error: "generation_failed", message: "Empty response from provider" };
  return { ok: true, text };
}

async function callAnthropic(prompt: string, settings: AiSettings): Promise<GenerateResult> {
  const model = settings.model || DEFAULT_MODELS.anthropic;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": settings.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || `Anthropic request failed (${res.status})`;
    throw new Error(message);
  }
  const text = data?.content?.map((p: { text?: string }) => p.text || "").join("") || "";
  if (!text) return { ok: false, error: "generation_failed", message: "Empty response from Anthropic" };
  return { ok: true, text };
}

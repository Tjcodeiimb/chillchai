"use server";

import { revalidatePath } from "next/cache";
import { getAiSettings, saveAiSettings, clearAiKey, type AiProvider } from "./ai-providers";
import { requireUserId } from "./auth";

export async function saveAiSettingsAction(fd: FormData) {
  const userId = await requireUserId();
  const provider = String(fd.get("provider") || "gemini") as AiProvider;
  const typedKey = String(fd.get("apiKey") || "").trim();
  const model = String(fd.get("model") || "").trim();
  const customEndpoint = String(fd.get("customEndpoint") || "").trim();

  // The key field is left blank on reload for security (see getMaskedAiSettings
  // below) -- an empty submission means "keep the existing key", not "clear it".
  const apiKey = typedKey || (await getAiSettings(userId)).apiKey;

  await saveAiSettings(userId, { provider, apiKey, model, customEndpoint });
  revalidatePath("/settings");
}

export async function clearAiKeyAction() {
  const userId = await requireUserId();
  await clearAiKey(userId);
  revalidatePath("/settings");
}

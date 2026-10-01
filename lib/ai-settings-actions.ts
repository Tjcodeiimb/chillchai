"use server";

import { revalidatePath } from "next/cache";
import { getAiSettings, saveAiSettings, clearAiKey, type AiProvider } from "./ai-providers";

export async function saveAiSettingsAction(fd: FormData) {
  const provider = String(fd.get("provider") || "gemini") as AiProvider;
  const typedKey = String(fd.get("apiKey") || "").trim();
  const model = String(fd.get("model") || "").trim();
  const customEndpoint = String(fd.get("customEndpoint") || "").trim();

  // The key field is left blank on reload for security (see getMaskedAiSettings
  // below) -- an empty submission means "keep the existing key", not "clear it".
  const apiKey = typedKey || (await getAiSettings()).apiKey;

  await saveAiSettings({ provider, apiKey, model, customEndpoint });
  revalidatePath("/settings");
}

export async function clearAiKeyAction() {
  await clearAiKey();
  revalidatePath("/settings");
}

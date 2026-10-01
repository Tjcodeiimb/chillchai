"use server";

import { redirect } from "next/navigation";
import { requireUserId } from "./auth";
import { updateBrand, DEFAULT_BRAND, type BrandConfig } from "./brand";

export async function completeOnboardingAction(formData: FormData) {
  const userId = await requireUserId();

  const subniches = String(formData.get("subniches") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const accountStatus = formData.get("accountStatus") === "established" ? "established" : "new";
  const pillarAuthority = Number(formData.get("pillarAuthority") || 70);
  const timesPerWeek = String(formData.get("timesPerWeek") || "1-2");

  const partial: Partial<BrandConfig> = {
    handle: String(formData.get("handle") || "").trim(),
    nameField: String(formData.get("nameField") || "").trim(),
    niche: String(formData.get("niche") || "").trim(),
    subniches: subniches.length ? subniches : DEFAULT_BRAND.subniches,
    occupation: String(formData.get("occupation") || "").trim(),
    founderStory: String(formData.get("founderStory") || "").trim(),
    bioLink: String(formData.get("bioLink") || "").trim(),
    followerCount: Number(formData.get("followerCount") || 0),
    accountStatus,
    pillarRatio: { authority: pillarAuthority, journey: 100 - pillarAuthority },
    postingCadence: { tier: timesPerWeek === "5+" ? "heavy" : "light", timesPerWeek, days: [] },
    ctaStatus: String(formData.get("ctaStatus") || "undecided"),
  };

  await updateBrand(userId, { ...partial, onboardingComplete: true });
  redirect("/");
}

export async function skipOnboardingAction() {
  const userId = await requireUserId();
  await updateBrand(userId, { onboardingComplete: true });
  redirect("/");
}

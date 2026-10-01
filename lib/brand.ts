import { sql, ensureSchema } from "./db";

export type BrandConfig = {
  handle: string;
  nameField: string;
  niche: string;
  subniches: string[];
  occupation: string;
  founderStory: string;
  colors: {
    background: string;
    foreground: string;
    muted: string;
    border: string;
    color4: string;
    color5: string;
  };
  fonts: { heading: string; body: string };
  assetTypes: string[];
  bioLink: string;
  followerCount: number;
  accountStatus: "new" | "established";
  pillarRatio: { authority: number; journey: number };
  conceptRatio: { proven: number; doubleDown: number; experimental: number };
  postingCadence: { tier: string; timesPerWeek: string; days: string[] };
  hookPrefs: string[];
  formatPrefs: string[];
  ctaStatus: string;
  manychatSetup: boolean;
  equipment: string[];
  aiStack: string[];
  automateWorkflows: string[];
  humanAlpha: string;
  proprietaryValue: string;
  journeyAssets: string;
  onboardingComplete: boolean;
};

export const DEFAULT_BRAND: BrandConfig = {
  handle: "",
  nameField: "",
  niche: "",
  subniches: [],
  occupation: "",
  founderStory: "",
  colors: {
    background: "#271D17",
    foreground: "#EFE4D2",
    muted: "#B9A384",
    border: "#EFE4D2",
    color4: "#9DB0FF",
    color5: "#1D3593",
  },
  fonts: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
  assetTypes: [],
  bioLink: "",
  followerCount: 0,
  accountStatus: "new",
  pillarRatio: { authority: 70, journey: 30 },
  conceptRatio: { proven: 90, doubleDown: 0, experimental: 10 },
  postingCadence: { tier: "light", timesPerWeek: "1-2", days: [] },
  hookPrefs: ["verbal", "written"],
  formatPrefs: ["whiteboard", "voiceover_broll"],
  ctaStatus: "undecided",
  manychatSetup: false,
  equipment: [],
  aiStack: [],
  automateWorkflows: [],
  humanAlpha: "",
  proprietaryValue: "",
  journeyAssets: "",
  onboardingComplete: false,
};

// In-process cache keyed by user id -- brand config barely ever changes but
// is read on nearly every page load, so avoid a round trip per request.
// Invalidated per-user by updateBrand().
declare global {
  var __chillchaiBrandCache: Map<number, BrandConfig> | undefined;
}
function brandCache() {
  if (!globalThis.__chillchaiBrandCache) globalThis.__chillchaiBrandCache = new Map();
  return globalThis.__chillchaiBrandCache;
}

async function loadBrand(userId: number): Promise<BrandConfig> {
  await ensureSchema();
  // ON CONFLICT DO NOTHING -- concurrent cold-start requests can race this
  // insert (each sees zero rows before any of them commit), so it must be
  // safe to run more than once.
  await sql`
    INSERT INTO brand_config (key, value, user_id) VALUES ('brand', ${JSON.stringify(DEFAULT_BRAND)}, ${userId})
    ON CONFLICT (COALESCE(user_id, 0), key) DO NOTHING
  `;
  const rows = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = 'brand' AND user_id = ${userId}`;
  return { ...DEFAULT_BRAND, ...JSON.parse(rows[0].value) };
}

export async function getBrand(userId: number): Promise<BrandConfig> {
  const cache = brandCache();
  const cached = cache.get(userId);
  if (cached) return cached;
  const brand = await loadBrand(userId);
  cache.set(userId, brand);
  return brand;
}

export async function updateBrand(userId: number, partial: Partial<BrandConfig>): Promise<BrandConfig> {
  const current = await getBrand(userId);
  const next = { ...current, ...partial };
  await sql`
    INSERT INTO brand_config (key, value, user_id) VALUES ('brand', ${JSON.stringify(next)}, ${userId})
    ON CONFLICT (COALESCE(user_id, 0), key) DO UPDATE SET value = excluded.value
  `;
  brandCache().set(userId, next);
  return next;
}

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
};

export const DEFAULT_BRAND: BrandConfig = {
  handle: "shardul",
  nameField: "Shardul | Market Entry Consultant",
  niche: "Market Entry & Business Consulting",
  subniches: [
    "Economic psychology",
    "Consumer psychology",
    "Building a business (founder lessons)",
    "People psychology",
    "Finance in business",
    "Young student founder journey",
    "Consulting industry insider takes",
    "Marketing",
    "Product building",
  ],
  occupation: "Founder & CEO, Upforge Consulting",
  founderStory:
    "I'm the founder and CEO at Upforge Consulting. It started when my dad got me a case study book from IIM Ahmedabad in 4th grade — I couldn't understand it then, but it stuck. I picked it up again in 7th grade and it pulled me into how business problems worked (no chapters, just real case studies). By 10th grade I knew I wanted consulting, so I spent the next two years studying it seriously, joined WCT Consulting right as college started, left after 3 months, and built Upforge from scratch. We began as generalist consultants helping Indian MSME founders solve problems, then pivoted into market entry consulting. Two years in: 30+ clients, 15 industries, 6 countries.",
  colors: {
    background: "#271D17",
    foreground: "#EFE4D2",
    muted: "#B9A384",
    border: "#EFE4D2",
    color4: "#9DB0FF",
    color5: "#1D3593",
  },
  fonts: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
  assetTypes: ["Charts", "Screenshots", "B-roll"],
  bioLink: "Upforge website",
  followerCount: 700,
  accountStatus: "new",
  pillarRatio: { authority: 70, journey: 30 },
  conceptRatio: { proven: 90, doubleDown: 0, experimental: 10 },
  postingCadence: { tier: "light", timesPerWeek: "1-2", days: [] },
  hookPrefs: ["verbal", "written"],
  formatPrefs: ["whiteboard", "voiceover_broll"],
  ctaStatus: "undecided",
  manychatSetup: false,
  equipment: ["Good microphone", "Large ring light", "Small ring light", "Tripod", "Mobile phone"],
  aiStack: ["Claude", "ChatGPT", "NotebookLM"],
  automateWorkflows: [
    "Trend / outlier research",
    "Transcribing viral reels",
    "Researching topics & frameworks",
    "Researching problems (client pain points, industry issues)",
  ],
  humanAlpha:
    "Multiple pivots (generalist MSME consulting -> market entry consulting), worked across 15 industries and 6 countries, started the intellectual journey at age 9 with an IIM Ahmedabad case book, survived failing entrance exams at 18. Signature differentiated idea: a 'How to Enter an Industry' series breaking down real market-entry case studies industry by industry.",
  proprietaryValue:
    "30+ consulting clients across 15 industries and 6 countries, 100+ proprietary tools and frameworks built for market entry and MSME problem-solving.",
  journeyAssets:
    "Has real footage/photos from being depressed at 18 after failing entrance exams -- a ready-made Loss Story / Transformation Story anchor.",
};

// In-process cache -- brand config barely ever changes but is read on nearly
// every page load, so avoid a round trip per request. Invalidated by
// updateBrand(). Lives across requests within the same server instance
// (same lifetime as the `sql` singleton in lib/db.ts).
declare global {
  var __chillchaiBrandCache: BrandConfig | undefined;
}

async function loadBrand(): Promise<BrandConfig> {
  await ensureSchema();
  // ON CONFLICT DO NOTHING -- concurrent cold-start requests can race this
  // insert (each sees zero rows before any of them commit), so it must be
  // safe to run more than once.
  await sql`
    INSERT INTO brand_config (key, value) VALUES ('brand', ${JSON.stringify(DEFAULT_BRAND)})
    ON CONFLICT (key) DO NOTHING
  `;
  const rows = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = 'brand'`;
  return { ...DEFAULT_BRAND, ...JSON.parse(rows[0].value) };
}

export async function getBrand(): Promise<BrandConfig> {
  if (globalThis.__chillchaiBrandCache) return globalThis.__chillchaiBrandCache;
  const brand = await loadBrand();
  globalThis.__chillchaiBrandCache = brand;
  return brand;
}

export async function updateBrand(partial: Partial<BrandConfig>): Promise<BrandConfig> {
  const current = await getBrand();
  const next = { ...current, ...partial };
  await sql`
    INSERT INTO brand_config (key, value) VALUES ('brand', ${JSON.stringify(next)})
    ON CONFLICT (key) DO UPDATE SET value = excluded.value
  `;
  globalThis.__chillchaiBrandCache = next;
  return next;
}

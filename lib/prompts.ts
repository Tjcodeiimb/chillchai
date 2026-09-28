import { BrandConfig } from "./brand";
import { TRANSCRIPT_TEMPLATIZE_PROMPT } from "./reference";

function brandContext(brand: BrandConfig) {
  return `You are helping ${brand.nameField}, ${brand.occupation}.
Niche: ${brand.niche}
Sub-niches: ${brand.subniches.join(", ")}
Founder story (for tone/reference, don't repeat verbatim unless asked): ${brand.founderStory}
Proprietary value/credibility to draw on: ${brand.proprietaryValue}
Voice: direct, specific, no fluff, first-person founder voice. Every claim must be hyper-specific and actionable, never vague ("fluffy").`;
}

export function buildHookStackPrompt(brand: BrandConfig, opts: { topic: string; angle?: string }) {
  return `${brandContext(brand)}

TASK: Generate 3 complete Hook Stacks for a short-form video on this topic: "${opts.topic}".
${opts.angle ? `Script angle to use: ${opts.angle}` : ""}
Preferred hook types to lean on: ${brand.hookPrefs.join(" + ")} (visual hook optional but include one idea anyway).

For EACH hook stack, give:
- Written hook (on-screen text, first 3 seconds)
- Verbal hook (first line spoken)
- Visual hook (what's seen in the first 3 seconds)

Rules: each hook must be hyper-specific (numbers, names, timeframes), not generic. No emojis. Keep each line under 12 words.`;
}

export function buildScriptPrompt(
  brand: BrandConfig,
  opts: {
    pillar: "authority" | "journey";
    contentType: string;
    angleOrStoryType: string;
    topic: string;
    hookStack?: { written?: string; verbal?: string; visual?: string };
    format?: string;
  }
) {
  return `${brandContext(brand)}

TASK: Write a full short-form video script (45-75 seconds spoken) for:
Pillar: ${opts.pillar}
Content type: ${opts.contentType}
Angle / story type: ${opts.angleOrStoryType}
Topic: ${opts.topic}
${opts.hookStack ? `Use this hook stack -- Written: "${opts.hookStack.written}" | Verbal: "${opts.hookStack.verbal}" | Visual: "${opts.hookStack.visual}"` : "Open with a strong written + verbal hook."}
${opts.format ? `Filming format: ${opts.format}` : ""}

Format the output in 3 color-coded bullet groups exactly like this:
BLACK (spoken dialogue, line by line):
- ...
RED (physical actions / camera movement instructions):
- ...
GREEN (editing / graphic instructions for the editor):
- ...

End with a single clear CTA line matched to the funnel stage requested (or default to a Follow CTA). Keep language hyper-specific, no fluff, in first-person founder voice.`;
}

export function buildTranscriptTemplatizePrompt(transcript: string) {
  return `${TRANSCRIPT_TEMPLATIZE_PROMPT}\n\nTRANSCRIPT:\n${transcript}`;
}

export function buildCaptionPrompt(
  brand: BrandConfig,
  opts: { hook: string; ctaType: string; topic: string }
) {
  return `${brandContext(brand)}

TASK: Write an Instagram caption using this exact 3-line structure:
Line 1: Written hook (reuse or lightly adapt): "${opts.hook}"
(double space)
Line 2: Call to action for a "${opts.ctaType}" goal
(double space)
Line 3: 3 to 5 niche/audience/topic keywords or hashtags relevant to "${opts.topic}" and the sub-niches: ${brand.subniches.join(", ")}

Output only the caption, nothing else.`;
}

export function buildCalendarIdeationPrompt(
  brand: BrandConfig,
  opts: { count: number; pillarRatio: { authority: number; journey: number }; conceptRatio: { proven: number; doubleDown: number; experimental: number } }
) {
  return `${brandContext(brand)}

TASK: Propose ${opts.count} video topics for the next content batch.
Respect this pillar split: ${opts.pillarRatio.authority}% Expert/Authority content, ${opts.pillarRatio.journey}% Documentation/Journey content.
Respect this concept split: ${opts.conceptRatio.proven}% Proven Concepts (topics/hooks modeled on outlier research), ${opts.conceptRatio.doubleDown}% Doubling Down (variants of my own past outliers), ${opts.conceptRatio.experimental}% Original Experiments.
Journey content should draw on: ${brand.journeyAssets}
Signature differentiated angle to weave in occasionally: ${brand.humanAlpha}

For each topic give: Topic | Pillar (authority/journey) | Concept bucket (proven/double_down/experimental) | Suggested script angle | One-line hook idea.
Return as a markdown table.`;
}

export function buildDoubleDownPrompt(
  brand: BrandConfig,
  opts: { topic: string; hook?: string; format?: string }
) {
  return `${brandContext(brand)}

My past video "${opts.topic}" (hook: "${opts.hook ?? "n/a"}", format: "${opts.format ?? "n/a"}") outperformed my average -- it's a proven outlier for my own account.

TASK: Give me 3 "double down" variants:
A) Keep most elements identical, tweak only the value/details.
B) Keep the structure/format identical, change the topic entirely.
C) Keep the core topic identical, present it in a completely new filming format.

For each variant give: new topic/angle, hook idea, and format to use.`;
}

export function buildKeywordBankPrompt(brand: BrandConfig) {
  return `${brandContext(brand)}

TASK: Generate a research keyword bank of 25-40 search terms across these 3 categories for finding 5x outlier reels on Instagram:
1. Niche: ${brand.niche}
2. Sub-niches: ${brand.subniches.join(", ")}
3. Occupation/title: ${brand.occupation}

Group the output under those 3 headings. Keywords should be things a real person would type into Instagram search, not hashtags.`;
}

export function buildTopicResearchPrompt(brand: BrandConfig, opts: { subniche: string }) {
  return `${brandContext(brand)}

TASK: I need raw content ideas for the sub-niche "${opts.subniche}" within ${brand.niche}.
Research and list 10 specific, non-obvious frameworks, mental models, statistics, or case-study angles I could turn into short-form videos, drawing on how a market-entry / business consultant would actually think about this. Prioritize measurable, specific value over generic advice. Cite the type of source (study/book/framework name) where relevant.`;
}

export function buildIndustryEntrySeriesPrompt(
  brand: BrandConfig,
  opts: { industry: string; episodes: number }
) {
  return `${brandContext(brand)}

Signature differentiator: ${brand.humanAlpha}

TASK: Design a ${opts.episodes}-episode short-form series called "How to Enter the ${opts.industry} Industry" -- a fake/real case-study breakdown of how ${brand.occupation} would approach a market-entry engagement in this industry, drawing on real consulting methodology (market sizing, regulatory landmines, local competitor mapping, distribution/channel strategy, pricing, go-to-market sequencing).

For each episode give: Episode title | Hook (written + verbal) | Core value point (hyper-specific, not generic) | Script angle to use | Suggested filming format.
Return as a numbered list, one episode per number. Keep total series watchable as a binge -- each episode must stand alone but reward watching the series in order.`;
}

export function buildProblemResearchPrompt(brand: BrandConfig, opts: { subniche: string }) {
  return `${brandContext(brand)}

TASK: List 10 specific, painful problems that ${brand.occupation}'s ideal audience faces in "${opts.subniche}". For each problem: name it in one line, explain why it's painful/costly, and suggest which script angle (framework, myth bust, comparison, transformation, etc.) would best address it as a short-form video.`;
}

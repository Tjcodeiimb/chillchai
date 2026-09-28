// Static reference content distilled from the source playbook.
// This is the "rulebook" every generator and checklist in the app pulls from.

export type ScriptAngle = {
  id: string;
  name: string;
  description: string;
  fillInTemplate: string;
};

export const SCRIPT_ANGLES: ScriptAngle[] = [
  {
    id: "framework",
    name: "Framework / Formula / Acronym",
    description: "Teach a repeatable step-by-step process, formula, or acronym.",
    fillInTemplate:
      "Hook: [Bold claim/result] using my [X]-step framework.\n1. [Step 1] -- [one-line why it matters]\n2. [Step 2] -- [one-line why it matters]\n3. [Step 3] -- [one-line why it matters]\nCTA: [Follow/Save] for [promise of more frameworks like this].",
  },
  {
    id: "comparison",
    name: "Comparison",
    description: "Side-by-side evaluation of two methods, products, or actions.",
    fillInTemplate:
      "Hook: [Option A] vs [Option B] -- which one actually [desired outcome]?\nOption A: [A] -- pros: [x], cons: [y]\nOption B: [B] -- pros: [x], cons: [y]\nVerdict: [which one wins and why, tied to your experience]\nCTA: [Comment A or B / Follow for more comparisons]",
  },
  {
    id: "myth_bust",
    name: "Myth Bust / Common Mistake",
    description: "Disprove a widespread niche misconception or correct a frequent error.",
    fillInTemplate:
      "Hook: Stop believing [common myth] -- it's costing you [consequence].\nWhy it's wrong: [explanation with proof/experience]\nWhat to do instead: [correct approach]\nCTA: [Follow to unlearn more myths in X]",
  },
  {
    id: "do_dont",
    name: "Do vs Don't (Right vs Wrong)",
    description: "Clear visual/verbal contrast of correct vs incorrect approaches.",
    fillInTemplate:
      "Hook: [Topic] -- here's the right way vs the wrong way.\nWrong: [mistake] -- why it fails: [reason]\nRight: [correct move] -- why it works: [reason]\nCTA: [Follow for more do's and don'ts in X]",
  },
  {
    id: "tip_hack",
    name: "Educational Tip / Hack",
    description: "One highly specific, actionable tactical tip or rule of thumb.",
    fillInTemplate:
      "Hook: One [niche] tip that [specific outcome] in [timeframe].\nThe tip: [exact tactic]\nWhy it works: [mechanism/reasoning]\nHow to apply it: [concrete next step]\nCTA: [Save this / Follow for more tips]",
  },
  {
    id: "transformation",
    name: "Transformation",
    description: "Before/after breakdown for you or a client/customer.",
    fillInTemplate:
      "Hook: [Before state] to [after state] in [timeframe] -- here's exactly how.\nBefore: [starting point, specific numbers if possible]\nWhat changed: [the 2-3 key moves]\nAfter: [result, specific numbers]\nCTA: [Follow if you want the same result / DM keyword for the process]",
  },
  {
    id: "challenge",
    name: "Challenge",
    description: "Complete or document a niche-relevant challenge on camera.",
    fillInTemplate:
      "Hook: I'm going to [challenge] in [timeframe] -- here's day/attempt 1.\nThe rules: [constraints]\nWhat happened: [progress/result]\nWhat I learned: [takeaway]\nCTA: [Follow to see how this ends]",
  },
];

// The doc's "7 Viral Hook Angles" map 1:1 onto the script angles above (Tutorial=Framework),
// so we reuse SCRIPT_ANGLES for hook-angle selection too.

export type StoryType = {
  id: string;
  name: string;
  description: string;
  fillInTemplate: string;
};

export const STORY_TYPES: StoryType[] = [
  {
    id: "my_story",
    name: "My Story",
    description: "Your personal background or founder origin story.",
    fillInTemplate:
      "Hook: How I went from [starting point] to [current identity/role].\nBeat 1: [origin moment / spark]\nBeat 2: [struggle or turning point]\nBeat 3: [where it led / current state]\nCTA: [Follow to see the rest of the build]",
  },
  {
    id: "win",
    name: "Win Story",
    description: "A major or minor achievement, milestone, or opportunity.",
    fillInTemplate:
      "Hook: We just [win] -- here's what it took.\nContext: [what the goal was]\nThe work: [what you actually did]\nThe win: [specific result]\nCTA: [Follow for more of the journey]",
  },
  {
    id: "loss",
    name: "Loss Story",
    description: "A mistake, failure, or setback in business or life.",
    fillInTemplate:
      "Hook: [Timeframe] ago I [failure/setback] -- and it nearly ended [thing].\nWhat happened: [the setback, be specific]\nHow it felt: [honest emotional beat]\nWhat I did next: [the recovery move]\nCTA: [Follow if you're in the middle of your own setback]",
  },
  {
    id: "lesson",
    name: "Lesson Story",
    description: "One specific lesson learned from a past win or loss.",
    fillInTemplate:
      "Hook: The one lesson [past experience] taught me about [topic].\nSetup: [brief context of the experience]\nThe lesson: [the specific insight]\nHow I apply it now: [current behavior change]\nCTA: [Follow for more lessons from the build]",
  },
  {
    id: "transformation_story",
    name: "Transformation Story",
    description: "Before-and-after journey for yourself or a client.",
    fillInTemplate:
      "Hook: [Before] to [after] -- this is the [timeframe] transformation.\nBefore: [specific starting details]\nThe turning point: [what changed]\nAfter: [specific current details]\nCTA: [Follow / DM keyword for how]",
  },
  {
    id: "challenge_story",
    name: "Challenge Story",
    description: "A personal challenge and the step-by-step journey to complete it.",
    fillInTemplate:
      "Hook: I'm committing to [challenge] -- documenting every step.\nWhy: [the reason behind the challenge]\nThe plan: [how you'll do it]\nProgress so far: [current status]\nCTA: [Follow to watch this play out]",
  },
  {
    id: "big_goal",
    name: "Big Goal / Dream Journey",
    description: "A major long-term objective plus the actionable game plan.",
    fillInTemplate:
      "Hook: My goal is [big goal] by [date] -- here's the exact plan.\nWhy this goal: [motivation]\nThe plan: [milestones/steps]\nWhere I am now: [current progress]\nCTA: [Follow to watch me build toward this]",
  },
];

export const JOURNEY_SERIES_FORMATS = [
  { id: "daily", name: "Daily Series", description: "Daily progress updates tracking a specific goal (\"Day 1 of completing X\")." },
  { id: "progress", name: "Progress Update Series", description: "Sporadic updates on ongoing projects or long-term goals." },
  { id: "lessons", name: "Lessons Series", description: "One specific lesson learned per episode." },
  { id: "step_by_step", name: "Step-by-Step Series", description: "Breaking down one stage of a multi-step project per episode." },
  { id: "metrics", name: "Number & Metric Updates", description: "Transparent income/revenue/performance figures." },
  { id: "cost_breakdown", name: "Cost Breakdowns", description: "Exact financial spend for building a product, business, or project." },
  { id: "retrospect", name: "What I Would Do Differently", description: "Reflecting on mistakes and takeaways after a business phase." },
];

export const AUTHORITY_CONTENT_FORMATS = [
  "Step-by-step tutorials (frameworks, formulas, actionable processes)",
  "Comparisons (side-by-side methods, actions, products, services)",
  "Myth busting & common mistakes",
  "Do vs Don't (right vs wrong)",
  "Educational tips & hacks",
  "Q&A, rankings & tier lists",
  "Transformations (before/after for you or clients)",
  "Celebrity / brand fake case studies (\"if I were hired by X\")",
  "\"Starting from scratch\" fake case studies (\"if I reset to zero\")",
];

export const FILMING_FORMATS = [
  { id: "talking_back_forth", name: "Talking Back & Forth", description: "Smart character vs naive character dialogue." },
  { id: "visual_format", name: "Visual Format", description: "Teaching using props or physical visuals." },
  { id: "voiceover_broll", name: "Voiceover Format", description: "Narrating over B-roll/images." },
  { id: "multitasking", name: "Multitasking Format", description: "Teaching while cooking, cleaning, doing another activity." },
  { id: "setting_changes", name: "Setting Changes", description: "Switching locations across cuts." },
  { id: "shot_angle_changes", name: "Shot / Angle Changes", description: "Changing camera angle every ~2 seconds." },
  { id: "clone", name: "Clone Format", description: "Doubling yourself on screen for comparison." },
  { id: "whiteboard", name: "Whiteboard Format", description: "Explaining concepts visually on a whiteboard." },
  { id: "qa", name: "Q&A Format", description: "Off-camera interviewer asking questions." },
  { id: "green_screen", name: "Green Screen Format", description: "Speaking with relevant background media." },
  { id: "reaction", name: "Reaction Format", description: "Reacting to niche viral clips with expert commentary." },
];

export const UNIVERSAL_HOOK_TEMPLATES = [
  "Is it possible to [outcome]...",
  "[X] days/years ago vs today...",
  "Did you know if you [action]...",
  "3 levels of [topic]...",
  "Smart [role] vs dumb [role] when it comes to [topic]",
  "This is a picture of my first [experience] with [topic]",
];

export const PROFILE_RIGHT_WRONG = [
  { field: "Link in bio", wrong: "Linktree with multiple links (kills conversion up to 50%)", right: "1 single destination link (landing page or freebie)" },
  { field: "Username", wrong: "Random or confusing handle", right: "Your full personal name or business name" },
  { field: "Tagline / name field", wrong: "Only your name", right: "[Name] | [Searchable keyword / niche / occupation]" },
  { field: "Profile picture", wrong: "Far-away shot, multiple people, busy background", right: "Clear close-up headshot, solid background" },
  { field: "Bio structure", wrong: "Messy, unstructured, ambiguous text", right: "4-line structured framework -- clear in 5 seconds" },
];

export const FIVE_X_OUTLIER_RULE =
  "An outlier is a reel from a small-to-midsize creator that got at least 5x more views than their total follower count. That's the bar for 'proven' before you model it.";

export const TRANSCRIPT_TEMPLATIZE_PROMPT =
  "This is a transcript from a viral video. Please make it into a script template that can be used for any niche. Keep the overall format/structure of the video and just make it the fill-in-the-blank version.";

export const CONTENT_TYPES = ["educational", "storytelling", "authority", "other"] as const;
export const PILLARS = ["authority", "journey"] as const;
export const FUNNEL_STAGES = ["tofu", "mofu", "bofu"] as const;
export const CTA_TYPES = ["follow", "engagement", "manychat", "none"] as const;
export const CALENDAR_STATUSES = ["idea", "researched", "scripted", "filmed", "edited", "posted"] as const;
export const CONCEPT_BUCKETS = ["proven", "double_down", "experimental"] as const;

# chillchai — content pipeline OS

A personal content-operating-system for planning, researching, and scripting your next 60–100
Instagram videos — built directly from your growth-blueprint playbook (hooks, outlier research,
the 70/20/10 ratio system, storytelling frameworks, etc.).

Every generator in the app assembles the exact prompt from your brand config and playbook rules,
shows it to you, and gives you two options:

- **Generate with Gemini** — calls the Gemini API directly (needs `GEMINI_API_KEY`).
- **Copy prompt** — paste it into Gemini / Claude / ChatGPT yourself.

Nothing is locked behind the API key — it's a convenience, not a requirement.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — add your Gemini API key here
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Data (calendar items, hook stacks, scripts, research log, analytics) is stored locally in
`data/chillchai.db` (SQLite, created automatically on first run). It's git-ignored — back it up
yourself if you want to keep it long-term.

## Sections

| # | Section | What it does |
|---|---|---|
| 00 | Dashboard | Level progress, ratio meters, upcoming batch |
| 01 | Brand Foundation | Niche, sub-niches, founder story, visual identity, profile checklist |
| 02 | Calendar & Batching | Plan batches, track the 70/20/10 (or 90/10) ratio live, AI batch ideation |
| 03 | Outlier Research | 5x-outlier log with auto multiple calc, keyword bank generator |
| 04 | Hook Lab | Hook stack generator/library, 7 hook angles, universal cross-niche templates |
| 05 | Script Studio | Authority/educational + storytelling generators, transcript→template tool, signature "How to Enter an Industry" series builder, script bank |
| 06 | Production Planner | 11 filming formats, equipment checklist, shot list pulled from a saved script, batch folder namer |
| 07 | CTA & Funnel Mapper | TOFU/MOFU/BOFU distribution, CTA decision guide, caption generator |
| 08 | Master Prompt Library | Directory of every generator + raw topic/problem research prompts |
| 09 | Analytics & Levels | Log posted videos, top/bottom 5, double-down variant generator |

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4 + better-sqlite3 + `@google/generative-ai`.
All mutations run through Server Actions in `lib/actions.ts`; the playbook's static reference
content (hook angles, story types, filming formats, etc.) lives in `lib/reference.ts`; your brand
config lives in `lib/brand.ts` and is editable from the Brand Foundation page.

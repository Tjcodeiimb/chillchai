# Upcreate

A personal content-operating-system for planning, researching, and scripting your next 60–100
Instagram videos — built directly from your growth-blueprint playbook (hooks, outlier research,
the 70/20/10 ratio system, storytelling frameworks, etc.).

Every generator in the app assembles the exact prompt from your brand config and playbook rules,
shows it to you, and gives you two options:

- **Generate with Gemini** — calls the Gemini API directly (needs `GEMINI_API_KEY`).
- **Copy prompt** — paste it into Gemini / Claude / ChatGPT yourself.

Nothing is locked behind the API key — it's a convenience, not a requirement.

## Where to run this

**Stack: Vercel (hosting) + Supabase (Postgres database).** The app is a standard Next.js app
with no filesystem dependency, so it fits Vercel's serverless model cleanly — all state lives in
Postgres, not on disk.

**Local, on your own machine:**

```bash
npm install
cp .env.example .env.local   # add DATABASE_URL, optionally GEMINI_API_KEY
npm run dev
```

`DATABASE_URL` can point at a local Postgres (`postgres://postgres:postgres@localhost:5432/chillchai`)
or directly at your Supabase project — either works for local dev. Tables are created
automatically on first request; there's no separate migration step.

**Deployed on Vercel** — see [Deployment](#deployment) below. Set `APP_PASSWORD` first (see
[Authentication](#authentication)), since the app has no login by default and would otherwise be
open to anyone with the URL.

## Data storage

Calendar items, hook stacks, scripts, research log, and analytics all live in Postgres, via the
`postgres` (postgres.js) client in `lib/db.ts`. Schema is created idempotently on first query
(`ensureSchema()`), so there's nothing to run manually after setting `DATABASE_URL`.

## Authentication

The app ships with a single-password gate, off by default:

- **No `APP_PASSWORD` set** → the app is fully open. Fine for local development.
- **`APP_PASSWORD` set** → every page redirects to `/login` until the right password is entered.
  A signed, httpOnly session cookie (valid 30 days) is issued on success; "Log out" is in the
  sidebar. Set `SESSION_SECRET` too for a signing key independent of the login password
  (`openssl rand -base64 32`) — it falls back to `APP_PASSWORD` if you skip it.

This is a single shared password for a single-user tool, not a multi-user account system — that's
deliberate, since only one person (you) needs in. Set `APP_PASSWORD` **before** deploying this
anywhere reachable from the open internet.

## Deployment

### 1. Create the Supabase project

- Create a project at [supabase.com](https://supabase.com).
- Go to **Project Settings → Database → Connection string** and copy the **Transaction pooler**
  string (port `6543`) — this is the one to use on Vercel, since serverless functions open many
  short-lived connections and the pooler handles that; a direct connection (port `5432`) would
  exhaust Postgres's connection limit under load.
- That string is your `DATABASE_URL`.

### 2. Deploy to Vercel

- Import this repo at [vercel.com/new](https://vercel.com/new) (or `vercel deploy` via the CLI).
- Add environment variables in the Vercel project's **Settings → Environment Variables**:
  - `DATABASE_URL` — the Supabase pooler string from step 1.
  - `APP_PASSWORD` — required before this is public; pick a real password.
  - `SESSION_SECRET` — `openssl rand -base64 32`.
  - `GEMINI_API_KEY` / `GEMINI_MODEL` — optional, enables live "Generate with Gemini".
- Deploy. Vercel builds and hosts the app; tables are created automatically the first time any
  page hits the database.

No Docker, no persistent volume, no long-running process to manage — Vercel's serverless
functions and Supabase's connection pooler are built for exactly this combination.

## Exporting to Word

Every part of the app that produces long-form content can be exported as a `.docx`:

- **A single script** — "Export to Word" on any saved script in Script Studio's Script Bank.
- **The whole script bank** (every saved script + every fill-in-the-blank template) — "Export all
  to Word" at the top of the Script Bank.
- **Your content calendar** — "Export to Word" on the Calendar page (a formatted table: date,
  pillar, concept bucket, topic, angle, format, CTA, funnel stage, status).
- **The entire Master Prompt Library** — the big "Export to Word" button on the Prompts page.
  Every prompt is pre-filled with your real brand context, alongside the full reference library
  (7 hook/script angles with fill-in templates, 7 story types, journey series formats, universal
  hook templates, authority content formats, filming formats, profile checklist). Good for
  printing, annotating, or handing to an editor/VA.

Exports are generated server-side with the `docx` package — no third-party service involved.

## Sections

| # | Section | What it does |
|---|---|---|
| 00 | Dashboard | Level progress, ratio meters, upcoming batch |
| 01 | Brand Foundation | Niche, sub-niches, founder story, visual identity, profile checklist |
| 02 | Calendar & Batching | Plan batches, track the 70/20/10 (or 90/10) ratio live, AI batch ideation, export to Word |
| 03 | Outlier Research | 5x-outlier log with auto multiple calc, keyword bank generator |
| 04 | Hook Lab | Hook stack generator/library, 7 hook angles, universal cross-niche templates |
| 05 | Script Studio | Authority/educational + storytelling generators (with a reach-vs-conversion depth control), transcript→template tool, signature "How to Enter an Industry" series builder, script bank, export to Word |
| 06 | Production Planner | 12 filming formats, equipment checklist, shot list pulled from a saved script, batch folder namer |
| 07 | CTA & Funnel Mapper | TOFU/MOFU/BOFU distribution, CTA decision guide, ManyChat setup checklist, caption generator |
| 08 | Master Prompt Library | Every generator runnable inline (bio, keyword bank, topic/problem research, raw-idea developer, outlier deconstruction, hooks, captions, ManyChat DM writer, calendar ideation, double-down) plus the full static reference library — export the whole thing to Word |
| 09 | Analytics & Levels | Log posted videos, top/bottom 5, double-down variant generator |

## Stack

Next.js 16 (App Router, Proxy for auth) + TypeScript + Tailwind CSS v4 + Postgres (via
[`postgres`](https://github.com/porsager/postgres), typically Supabase) + `@google/generative-ai`
+ `docx`, deployed on Vercel. All mutations run through Server Actions in `lib/actions.ts`; the
Postgres client and schema live in `lib/db.ts`; prompt templates live in `lib/prompts.ts`; the
playbook's static reference content (hook angles, story types, filming formats, etc.) lives in
`lib/reference.ts`; your brand config lives in `lib/brand.ts` and is editable from the Brand
Foundation page; Word export builders live in `lib/docx-export.ts`; auth lives in `lib/auth.ts` /
`proxy.ts`.

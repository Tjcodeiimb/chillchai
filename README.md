# chillchai — content pipeline OS

A personal content-operating-system for planning, researching, and scripting your next 60–100
Instagram videos — built directly from your growth-blueprint playbook (hooks, outlier research,
the 70/20/10 ratio system, storytelling frameworks, etc.).

Every generator in the app assembles the exact prompt from your brand config and playbook rules,
shows it to you, and gives you two options:

- **Generate with Gemini** — calls the Gemini API directly (needs `GEMINI_API_KEY`).
- **Copy prompt** — paste it into Gemini / Claude / ChatGPT yourself.

Nothing is locked behind the API key — it's a convenience, not a requirement.

## Where to run this

**Local, on your own machine** — the simplest option, and all you need if you're the only one
using it:

```bash
npm install
cp .env.example .env.local   # optional — add your Gemini API key here
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Data lives in a local SQLite file (see
below) — nothing leaves your machine unless you turn on Gemini generation.

**Deployed somewhere you can reach from your phone** — see [Deployment](#deployment) below. Set
`APP_PASSWORD` first (see [Authentication](#authentication)) if you do this, since the app has no
login by default and would otherwise be open to anyone with the URL.

## Data storage

Calendar items, hook stacks, scripts, research log, and analytics are stored locally in
`data/chillchai.db` (SQLite, created automatically on first run). It's git-ignored. This matters
for deployment: SQLite is a single file on disk, so **the app needs a persistent filesystem and a
single long-running process** — see the platform notes below.

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

The app is a standard Next.js server (`output: "standalone"` is already configured) plus a local
SQLite file. That combination means:

- ✅ **Good fits**: Railway, Fly.io, Render, a plain VPS (DigitalOcean/Hetzner/etc.), or Replit —
  anywhere that gives you one long-running Node process with a persistent disk/volume you can
  mount at `/app/data`.
- ❌ **Avoid serverless platforms as configured** (Vercel's default serverless functions, AWS
  Lambda, etc.). Their filesystem is ephemeral and/or split across multiple instances, so the
  SQLite file would reset or go out of sync between requests. You'd need to swap SQLite for a
  hosted database (e.g. Turso/libSQL, Neon/Supabase Postgres) to run there — not set up in this
  repo.

### Docker

A multi-stage `Dockerfile` is included:

```bash
docker build -t chillchai .
docker run -p 3000:3000 \
  -e APP_PASSWORD=your-password \
  -e GEMINI_API_KEY=your-key \
  -v chillchai_data:/app/data \
  chillchai
```

The `-v chillchai_data:/app/data` volume is what makes your data survive restarts/redeploys —
without it, every new container starts with an empty database. Point Railway/Fly.io/Render's
volume feature at `/app/data` the same way.

### Plain Node (no Docker)

Works the same way on a VPS:

```bash
npm ci
npm run build
APP_PASSWORD=your-password GEMINI_API_KEY=your-key npm run start
```

Put a reverse proxy (nginx, Caddy) in front for TLS; see Next.js's own
[self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting) for the general pattern.

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
| 06 | Production Planner | 11 filming formats, equipment checklist, shot list pulled from a saved script, batch folder namer |
| 07 | CTA & Funnel Mapper | TOFU/MOFU/BOFU distribution, CTA decision guide, ManyChat setup checklist, caption generator |
| 08 | Master Prompt Library | Every generator runnable inline (bio, keyword bank, topic/problem research, raw-idea developer, outlier deconstruction, hooks, captions, ManyChat DM writer, calendar ideation, double-down) plus the full static reference library — export the whole thing to Word |
| 09 | Analytics & Levels | Log posted videos, top/bottom 5, double-down variant generator |

## Stack

Next.js 16 (App Router, Proxy for auth) + TypeScript + Tailwind CSS v4 + better-sqlite3 +
`@google/generative-ai` + `docx`. All mutations run through Server Actions in `lib/actions.ts`;
prompt templates live in `lib/prompts.ts`; the playbook's static reference content (hook angles,
story types, filming formats, etc.) lives in `lib/reference.ts`; your brand config lives in
`lib/brand.ts` and is editable from the Brand Foundation page; Word export builders live in
`lib/docx-export.ts`; auth lives in `lib/auth.ts` / `proxy.ts`.

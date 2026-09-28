import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add your Supabase/Postgres connection string to .env.local (see .env.example)."
  );
}

const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

declare global {
  var __chillchaiSql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  globalThis.__chillchaiSql ??
  postgres(connectionString, {
    ssl: isLocal ? false : "require",
    // Supabase's pooled connection (pgbouncer, transaction mode) doesn't support
    // server-side prepared statements.
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalThis.__chillchaiSql = sql;

let schemaReady: Promise<void> | null = null;

// Cheap to call repeatedly -- memoized after the first successful run, so
// every query helper can safely call this before doing real work.
export function ensureSchema(): Promise<void> {
  if (!schemaReady) schemaReady = initSchema();
  return schemaReady;
}

async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS brand_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS calendar_items (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      pillar TEXT NOT NULL DEFAULT 'authority',
      concept_bucket TEXT NOT NULL DEFAULT 'proven',
      content_type TEXT NOT NULL DEFAULT 'educational',
      topic TEXT NOT NULL DEFAULT '',
      angle TEXT DEFAULT '',
      format TEXT DEFAULT '',
      cta_type TEXT DEFAULT 'follow',
      funnel_stage TEXT DEFAULT 'tofu',
      status TEXT NOT NULL DEFAULT 'idea',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS outlier_research (
      id SERIAL PRIMARY KEY,
      source_type TEXT NOT NULL DEFAULT 'keyword',
      creator_handle TEXT DEFAULT '',
      link TEXT DEFAULT '',
      niche_keyword TEXT DEFAULT '',
      follower_count INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      hook_written TEXT DEFAULT '',
      hook_verbal TEXT DEFAULT '',
      hook_visual TEXT DEFAULT '',
      angle TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hook_stacks (
      id SERIAL PRIMARY KEY,
      written TEXT DEFAULT '',
      verbal TEXT DEFAULT '',
      visual TEXT DEFAULT '',
      angle TEXT DEFAULT '',
      topic TEXT DEFAULT '',
      saved BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS scripts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled script',
      pillar TEXT NOT NULL DEFAULT 'authority',
      content_type TEXT NOT NULL DEFAULT 'educational',
      angle_or_story_type TEXT DEFAULT '',
      format TEXT DEFAULT '',
      body_black TEXT DEFAULT '',
      body_red TEXT DEFAULT '',
      body_green TEXT DEFAULT '',
      cta_type TEXT DEFAULT 'follow',
      funnel_stage TEXT DEFAULT 'tofu',
      status TEXT NOT NULL DEFAULT 'draft',
      series_name TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS script_templates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Untitled template',
      pillar TEXT NOT NULL DEFAULT 'authority',
      angle TEXT DEFAULT '',
      source_note TEXT DEFAULT '',
      template_text TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS own_posts (
      id SERIAL PRIMARY KEY,
      title TEXT DEFAULT '',
      posted_date TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      followers_at_post INTEGER DEFAULT 0,
      pillar TEXT DEFAULT 'authority',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

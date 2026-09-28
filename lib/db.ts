import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "chillchai.db");

declare global {
  var __chillchaiDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS brand_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calendar_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      pillar TEXT NOT NULL DEFAULT 'authority',
      concept_bucket TEXT NOT NULL DEFAULT 'proven',
      content_type TEXT NOT NULL DEFAULT 'educational',
      topic TEXT NOT NULL DEFAULT '',
      angle TEXT DEFAULT '',
      hook_stack_id INTEGER,
      script_id INTEGER,
      format TEXT DEFAULT '',
      cta_type TEXT DEFAULT 'follow',
      funnel_stage TEXT DEFAULT 'tofu',
      status TEXT NOT NULL DEFAULT 'idea',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS outlier_research (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hook_stacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      written TEXT DEFAULT '',
      verbal TEXT DEFAULT '',
      visual TEXT DEFAULT '',
      angle TEXT DEFAULT '',
      topic TEXT DEFAULT '',
      source_outlier_id INTEGER,
      saved INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scripts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT 'Untitled script',
      pillar TEXT NOT NULL DEFAULT 'authority',
      content_type TEXT NOT NULL DEFAULT 'educational',
      angle_or_story_type TEXT DEFAULT '',
      format TEXT DEFAULT '',
      body_black TEXT DEFAULT '',
      body_red TEXT DEFAULT '',
      body_green TEXT DEFAULT '',
      hook_stack_id INTEGER,
      cta_type TEXT DEFAULT 'follow',
      funnel_stage TEXT DEFAULT 'tofu',
      status TEXT NOT NULL DEFAULT 'draft',
      series_name TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS script_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Untitled template',
      pillar TEXT NOT NULL DEFAULT 'authority',
      angle TEXT DEFAULT '',
      source_note TEXT DEFAULT '',
      template_text TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS own_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      calendar_item_id INTEGER,
      title TEXT DEFAULT '',
      posted_date TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      followers_at_post INTEGER DEFAULT 0,
      pillar TEXT DEFAULT 'authority',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

export const db = globalThis.__chillchaiDb ?? createConnection();
if (process.env.NODE_ENV !== "production") globalThis.__chillchaiDb = db;

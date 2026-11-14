-- Cloudflare D1 Schema for THE FITRAH SHIELD (เกราะพิทักษ์ฟิฏเราะฮฺ)
-- Run with: npx wrangler d1 execute fitrah-shield-db --remote --file=./migrations/0001_init.sql

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  member_number INTEGER NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free_tier_1',
  role TEXT NOT NULL DEFAULT 'member',
  payment_status TEXT NOT NULL DEFAULT 'free',
  payment_slip_url TEXT,
  payment_amount REAL DEFAULT 0,
  billing_cycle TEXT DEFAULT 'free',
  ebook_claimed INTEGER DEFAULT 0,
  ebook_claimed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS article_overrides (
  key TEXT PRIMARY KEY,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  status TEXT DEFAULT 'published',
  published_at TEXT,
  is_unlocked INTEGER,
  cover_image TEXT,
  audio_url TEXT,
  is_deleted INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS store_products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  price_thb REAL NOT NULL DEFAULT 0,
  compare_at_price_thb REAL,
  image_url TEXT,
  badge TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  reply_email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_note TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ebook_dispatches (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  member_number INTEGER NOT NULL,
  recipient_email TEXT NOT NULL,
  tier TEXT NOT NULL,
  subject TEXT NOT NULL,
  attachment TEXT NOT NULL,
  status TEXT NOT NULL,
  claimed_at TEXT NOT NULL
);

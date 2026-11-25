-- Cloudflare D1 Migration 0003: Discord OAuth2 Member Linking
-- Run with: npx wrangler d1 execute fitrah-shield-db --remote --file=./migrations/0003_discord_link.sql

ALTER TABLE members ADD COLUMN discord_user_id TEXT;
ALTER TABLE members ADD COLUMN discord_username TEXT;
ALTER TABLE members ADD COLUMN discord_linked_at TEXT;

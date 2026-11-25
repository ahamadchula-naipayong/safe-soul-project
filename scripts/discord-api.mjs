import fs from 'fs';
import path from 'path';

export const DISCORD_API_BASE = 'https://discord.com/api/v10';
export const DEFAULT_SITE_URL = 'https://thefitrahshield.hardynaipayong.cloud';
export const STATE_FILE_PATH = path.join(process.cwd(), 'data', 'discord_state.json');

/**
 * Load variables from .env.local into process.env without overwriting existing env values.
 */
export function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

/**
 * Insert or update keys in .env.local while preserving comments and unrelated keys.
 */
export function upsertEnvLocal(updates) {
  const envPath = path.join(process.cwd(), '.env.local');
  let lines = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
    : [];

  const remaining = { ...updates };
  lines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return line;
    const key = trimmed.slice(0, eqIdx).trim();
    if (Object.prototype.hasOwnProperty.call(remaining, key)) {
      const nextVal = remaining[key];
      delete remaining[key];
      return `${key}=${nextVal}`;
    }
    return line;
  });

  const extraEntries = Object.entries(remaining);
  if (extraEntries.length > 0) {
    if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
      lines.push('');
    }
    for (const [k, v] of extraEntries) {
      lines.push(`${k}=${v}`);
    }
  }

  fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
}

export function getDiscordConfig() {
  loadEnvLocal();
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const clientId = process.env.DISCORD_CLIENT_ID || '';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

  if (!token || !guildId) {
    throw new Error(
      'Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID in .env.local or environment.'
    );
  }

  return { token, guildId, clientId, siteUrl };
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a Discord REST API v10 request with automatic 429 rate-limit retries.
 */
export async function discordApi(endpoint, options = {}) {
  const { token } = getDiscordConfig();
  const { method = 'GET', body, headers = {}, retries = 5 } = options;

  const url = `${DISCORD_API_BASE}${endpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bot ${token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 429) {
      let retryAfterMs = 2000;
      try {
        const rateData = await res.json();
        if (rateData && typeof rateData.retry_after === 'number') {
          retryAfterMs = Math.ceil(rateData.retry_after * 1000) + 500;
        }
      } catch {
        const headerRetry = parseFloat(res.headers.get('retry-after') || '2');
        if (!Number.isNaN(headerRetry)) {
          retryAfterMs = Math.ceil(headerRetry * 1000) + 500;
        }
      }
      if (attempt < retries) {
        console.warn(`⏳ Discord rate limit on ${method} ${endpoint}, waiting ${retryAfterMs}ms...`);
        await sleep(retryAfterMs);
        continue;
      }
    }

    // Proactively pause briefly if bucket remaining is 0
    const remaining = res.headers.get('x-ratelimit-remaining');
    const resetAfter = parseFloat(res.headers.get('x-ratelimit-reset-after') || '0');
    if (remaining === '0' && resetAfter > 0) {
      await sleep(Math.ceil(resetAfter * 1000) + 250);
    }

    if (res.status === 204) {
      return null;
    }

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const err = new Error(
        `Discord API ${res.status} on ${method} ${endpoint}: ${
          typeof data === 'object' && data ? JSON.stringify(data) : text
        }`
      );
      err.status = res.status;
      err.discordData = data;
      throw err;
    }

    return data;
  }

  throw new Error(`Exceeded retry attempts for ${method} ${endpoint}`);
}

export function loadDiscordState() {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    return {
      guildId: null,
      roles: {},
      categories: {},
      channels: {},
      forumTags: {},
      infoMessages: {},
      syncedItems: {},
    };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf8'));
    return {
      guildId: parsed.guildId || null,
      roles: parsed.roles || {},
      categories: parsed.categories || {},
      channels: parsed.channels || {},
      forumTags: parsed.forumTags || {},
      infoMessages: parsed.infoMessages || {},
      syncedItems: parsed.syncedItems || {},
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return {
      guildId: null,
      roles: {},
      categories: {},
      channels: {},
      forumTags: {},
      infoMessages: {},
      syncedItems: {},
    };
  }
}

export function saveDiscordState(state) {
  const dir = path.dirname(STATE_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const payload = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(payload, null, 2), 'utf8');
}

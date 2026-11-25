/**
 * Hybrid Content Sync Script for THE FITRAH SHIELD -> Discord Forum Channels
 *
 * Publishes rich Summary Cards + Key Points + Direct Website Links (Hybrid Mode C)
 * across Free & Member Discord Forum channels while respecting the official
 * W1-W23 release schedule and maintaining idempotency in data/discord_state.json.
 *
 * Usage:
 *   npm run discord:sync
 *   node scripts/discord-sync.mjs [--dry-run] [--news-limit=10] [--include-unreleased]
 */
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import {
  getDiscordConfig,
  discordApi,
  loadDiscordState,
  saveDiscordState,
  sleep,
} from './discord-api.mjs';

const DEEP_OCEAN_FALLBACK_SCHEDULE = {
  '1/1': '2026-11-24T05:00:00+07:00',
  '2/1': '2026-11-25T05:00:00+07:00',
  '3/1': '2026-11-26T05:00:00+07:00',
  '4/1': '2026-11-27T05:00:00+07:00',
  '5/1': '2026-11-28T05:00:00+07:00',
  '1/2': '2026-12-01T05:00:00+07:00',
  '1/3': '2026-12-03T05:00:00+07:00',
  '1/4': '2026-12-08T05:00:00+07:00',
  '1/5': '2026-12-10T05:00:00+07:00',
  '2/2': '2026-12-15T05:00:00+07:00',
  '2/3': '2026-12-17T05:00:00+07:00',
  '2/4': '2026-12-22T05:00:00+07:00',
  '2/5': '2026-12-24T05:00:00+07:00',
  '3/2': '2026-12-29T05:00:00+07:00',
  '3/3': '2026-12-31T05:00:00+07:00',
  '3/4': '2027-01-05T05:00:00+07:00',
  '3/5': '2027-01-07T05:00:00+07:00',
  '4/2': '2027-01-12T05:00:00+07:00',
  '4/3': '2027-01-14T05:00:00+07:00',
  '4/4': '2027-01-19T05:00:00+07:00',
  '4/5': '2027-01-21T05:00:00+07:00',
  '5/2': '2027-01-26T05:00:00+07:00',
  '5/3': '2027-01-28T05:00:00+07:00',
  '5/4': '2027-02-02T05:00:00+07:00',
  '5/5': '2027-02-04T05:00:00+07:00',
  '6/1': '2027-02-09T05:00:00+07:00',
  '7/1': '2027-02-10T05:00:00+07:00',
  '8/1': '2027-02-11T05:00:00+07:00',
  '9/1': '2027-02-12T05:00:00+07:00',
  '10/1': '2027-02-13T05:00:00+07:00',
  '6/2': '2027-02-16T05:00:00+07:00',
  '6/3': '2027-02-18T05:00:00+07:00',
  '6/4': '2027-02-23T05:00:00+07:00',
  '6/5': '2027-02-25T05:00:00+07:00',
  '7/2': '2027-03-02T05:00:00+07:00',
  '7/3': '2027-03-04T05:00:00+07:00',
  '7/4': '2027-03-09T05:00:00+07:00',
  '7/5': '2027-03-11T05:00:00+07:00',
  '8/2': '2027-03-16T05:00:00+07:00',
  '8/3': '2027-03-18T05:00:00+07:00',
  '8/4': '2027-03-23T05:00:00+07:00',
  '8/5': '2027-03-25T05:00:00+07:00',
  '9/2': '2027-03-30T05:00:00+07:00',
  '9/3': '2027-04-01T05:00:00+07:00',
  '9/4': '2027-04-06T05:00:00+07:00',
  '9/5': '2027-04-08T05:00:00+07:00',
  '10/2': '2027-04-13T05:00:00+07:00',
  '10/3': '2027-04-15T05:00:00+07:00',
  '10/4': '2027-04-20T05:00:00+07:00',
  '10/5': '2027-04-22T05:00:00+07:00',
};

const ARCHIPELAGO_TAG_MAP = {
  1: '1. Dunya',
  2: '2. Haram',
  3: '3. Nafsu',
  4: '4. Rizq',
  5: '5. Hijab',
  6: '6. Hype',
  7: '7. Fake Idol',
  8: '8. Shirk',
  9: '9. Shia Being',
  10: '10. Barzakh',
};

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const THAI_SHORT_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

function parseArgs() {
  const argv = process.argv.slice(2);
  let dryRun = false;
  let includeUnreleased = false;
  let updateExisting = false;
  let noPrune = false;
  let openDays = 30;
  let openActiveDays = 5;
  let deepdiveActiveLimit = 600;
  let batchSize = 0;

  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg === '--include-unreleased') includeUnreleased = true;
    else if (arg === '--update-existing') updateExisting = true;
    else if (arg === '--no-prune') noPrune = true;
    else if (arg.startsWith('--open-days=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(val) && val >= 0) openDays = val;
    } else if (arg.startsWith('--open-active-days=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(val) && val >= 0) openActiveDays = val;
    } else if (arg.startsWith('--deepdive-active-limit=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(val) && val >= 0) deepdiveActiveLimit = val;
    } else if (arg.startsWith('--batch-size=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(val) && val >= 0) batchSize = val;
    }
  }
  return {
    dryRun,
    includeUnreleased,
    updateExisting,
    noPrune,
    openDays,
    openActiveDays,
    deepdiveActiveLimit,
    batchSize,
  };
}

const FORUM_CHANNEL_NAMES = {
  shallowForum: 'ทะเลน้ำตื้น-7-เกาะ',
  deepSampleForum: 'ชิมลางทะเลน้ำลึก',
  newsOpenForum: 'ข่าวสาร-west-asia',
  deepOceanForum: 'ทะเลน้ำลึก-10-หมู่เกาะ',
  newsDeepdiveForum: 'news-deepdive',
};

async function ensureForumMetadataFromDiscord(guildId, state) {
  const hasAllChannels = Object.keys(FORUM_CHANNEL_NAMES).every((k) => state.channels?.[k]);
  if (hasAllChannels && state.forumTags && Object.keys(state.forumTags).length >= 5) {
    return state;
  }

  console.log('🔍 กำลังค้นหาห้อง Forum และ Tags จาก Discord API โดยตรง...');
  const guildChannels = await discordApi(`/guilds/${guildId}/channels`);
  state.guildId = guildId;
  state.channels = state.channels || {};
  state.forumTags = state.forumTags || {};

  for (const [key, chName] of Object.entries(FORUM_CHANNEL_NAMES)) {
    const ch = guildChannels.find((c) => c.type === 15 && c.name === chName);
    if (ch) {
      state.channels[key] = ch.id;
      state.forumTags[key] = Object.fromEntries(
        (ch.available_tags || []).map((t) => [t.name, t.id])
      );
    }
  }
  return state;
}

async function fetchExistingThreadsIndex(guildId, forumIds) {
  const byChannel = new Map();
  const listsByChannel = new Map();
  const seenIds = new Set();

  const recordThread = (t) => {
    if (!t?.parent_id || !t?.name || !t?.id) return;
    const entry = {
      id: t.id,
      name: t.name,
      archived: Boolean(t.thread_metadata?.archived),
    };
    if (!byChannel.has(t.parent_id)) byChannel.set(t.parent_id, new Map());
    if (!byChannel.get(t.parent_id).has(t.name)) {
      byChannel.get(t.parent_id).set(t.name, entry);
    }
    if (!seenIds.has(t.id)) {
      seenIds.add(t.id);
      if (!listsByChannel.has(t.parent_id)) listsByChannel.set(t.parent_id, []);
      listsByChannel.get(t.parent_id).push(entry);
    }
  };

  try {
    const activeData = await discordApi(`/guilds/${guildId}/threads/active`);
    for (const t of activeData?.threads || []) {
      recordThread(t);
    }
  } catch (err) {
    console.warn('⚠️ ไม่สามารถดึงรายการกระทู้ Active จาก Discord ได้:', err.message);
  }

  for (const chId of forumIds.filter(Boolean)) {
    try {
      let before = null;
      for (let page = 0; page < 25; page++) {
        const qs = before
          ? `?limit=100&before=${encodeURIComponent(before)}`
          : '?limit=100';
        const archData = await discordApi(`/channels/${chId}/threads/archived/public${qs}`);
        const threads = archData?.threads || [];
        for (const t of threads) {
          recordThread(t);
        }
        if (!archData?.has_more || threads.length === 0) break;
        before = threads[threads.length - 1]?.thread_metadata?.archive_timestamp;
        if (!before) break;
      }
    } catch {
      // Skip archived lookup if channel has no archived threads or permissions restrict
    }
  }

  return { byChannel, listsByChannel };
}

function truncateText(str, maxLen) {
  if (!str) return '';
  const clean = String(str).replace(/\s+/g, ' ').trim();
  const chars = Array.from(clean);
  if (chars.length <= maxLen) return clean;
  return chars.slice(0, Math.max(0, maxLen - 3)).join('').trimEnd() + '...';
}

function truncateBlock(str, maxLen) {
  if (!str) return '';
  const chars = Array.from(String(str).trim());
  if (chars.length <= maxLen) return String(str).trim();
  return chars.slice(0, Math.max(0, maxLen - 3)).join('').trimEnd() + '...';
}

function stripMarkdownToSummary(md, maxLen = 520) {
  if (!md) return '';
  const plain = String(md)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/[*_~`>]/g, '')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  return truncateBlock(plain, maxLen);
}

function extractHeadingHighlights(md, maxItems = 4) {
  if (!md) return [];
  const lines = String(md).split(/\r?\n/);
  const headings = [];
  for (const raw of lines) {
    const t = raw.trim();
    const match = t.match(/^#{2,3}\s+(.+)$/);
    if (!match) continue;
    const label = match[1].replace(/[*_`]/g, '').trim();
    if (!label || /แหล่งอ้างอิง|เอกสารอ้างอิง|อ้างอิงท้ายบท/i.test(label)) continue;
    headings.push(label);
    if (headings.length >= maxItems) break;
  }
  return headings;
}

function extractSafeTopicsBullets(topicsContent) {
  if (!topicsContent) return '';
  const bullets = String(topicsContent)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('* ') || l.startsWith('- '))
    .slice(0, 4)
    .map((l) => `• ${l.slice(2).trim()}`);
  return bullets.join('\n');
}

function resolveValidUrl(rawUrl, siteUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const full = trimmed.startsWith('/') ? `${siteUrl}${trimmed}` : trimmed;
  if (!/^https?:\/\//i.test(full)) return null;
  try {
    const parsed = new URL(full);
    const encoded = parsed.toString();
    return encoded.length <= 2048 ? encoded : null;
  } catch {
    try {
      const parsed = new URL(encodeURI(full));
      const encoded = parsed.toString();
      return encoded.length <= 2048 ? encoded : null;
    } catch {
      return null;
    }
  }
}

function formatThaiShortDate(iso) {
  if (!iso) return '-';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  const bkk = new Date(dt.getTime() + 7 * 60 * 60 * 1000);
  const d = bkk.getUTCDate();
  const m = THAI_SHORT_MONTHS[bkk.getUTCMonth()] || '';
  const y = bkk.getUTCFullYear();
  const hh = String(bkk.getUTCHours()).padStart(2, '0');
  const mm = String(bkk.getUTCMinutes()).padStart(2, '0');
  return `${d} ${m} ${y} (${hh}:${mm} น.)`;
}

function isReleased(iso) {
  if (!iso) return true;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) || Date.now() >= t;
}

function parseNewsDate(val) {
  let y = 2026, m = 1, d = 1;
  if (typeof val === 'number') {
    const ssf = XLSX.SSF || XLSX.default?.SSF;
    if (ssf && ssf.parse_date_code) {
      const parsed = ssf.parse_date_code(val);
      y = parsed.y; m = parsed.m; d = parsed.d;
    } else {
      const dt = new Date(Math.round((val - 25569) * 86400 * 1000));
      y = dt.getUTCFullYear(); m = dt.getUTCMonth() + 1; d = dt.getUTCDate();
    }
  } else if (typeof val === 'string' && val.trim()) {
    const dt = new Date(val);
    if (!Number.isNaN(dt.getTime())) {
      y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
    }
  }
  return {
    iso: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    formatted: `${d} ${THAI_MONTHS[m - 1] || ''} ${y}`,
    timestamp: new Date(y, m - 1, d).getTime(),
  };
}

function loadNewsFromExcel() {
  const excelPath = path.join(process.cwd(), 'Assets', 'News Deepdive.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.warn('⚠️ ไม่พบไฟล์ Assets/News Deepdive.xlsx ข้ามการซิงค์ข่าว');
    return [];
  }

  const buf = fs.readFileSync(excelPath);
  const workbook = XLSX.read(buf, { type: 'buffer' });
  const sheetName =
    workbook.SheetNames.find((s) => s.toLowerCase() === 'deepdive') || workbook.SheetNames[0];
  const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const items = [];
  rawRows.forEach((r, idx) => {
    const rawTitle = r.Title ? String(r.Title).trim() : '';
    if (!rawTitle) return;

    const cleanTitle = (s) => String(s || '').replace(/^\*\*|\*\*$/g, '').trim();
    const korNo = r['KOR No.'] ? String(r['KOR No.']).trim() : `NEWS-${idx + 1}`;
    const slug = korNo.toLowerCase();
    const subcategory = r.Subcategory ? String(r.Subcategory).trim() : 'Deepdive';
    const dateParsed = parseNewsDate(r.Date);
    const mainImage = r.Image ? String(r.Image).trim() : '';
    const source = r.Source && String(r.Source).trim() ? String(r.Source).trim() : null;

    const c1Raw = r['Content 1'] ? String(r['Content 1']).trim() : '';
    let headline = '';
    let c1Body = c1Raw;
    const tripleStarIndex = c1Raw.indexOf('***');
    if (tripleStarIndex !== -1) {
      headline = c1Raw.substring(0, tripleStarIndex).trim();
      c1Body = c1Raw.substring(tripleStarIndex + 3).trim();
    } else {
      const match = c1Raw.match(/^\s*(\*\*[^\n]+\*\*)\s*\n*([\s\S]*)$/);
      if (match) {
        headline = match[1].trim();
        c1Body = match[2].trim();
      }
    }

    const title = headline ? cleanTitle(headline) : cleanTitle(rawTitle);
    const topicLead = cleanTitle(rawTitle);

    const sectionsCount = [c1Body || c1Raw, r['Content 2'], r['Content 3'], r['Content 4'], r['Content 5']]
      .filter((c) => c && String(c).trim()).length;

    items.push({
      korNo,
      slug,
      title,
      topicLead,
      subcategory,
      dateFormatted: dateParsed.formatted,
      dateTimestamp: dateParsed.timestamp,
      image: mainImage,
      source,
      summary: stripMarkdownToSummary(c1Body || c1Raw, 550),
      sectionsCount: sectionsCount || 1,
    });
  });

  items.sort((a, b) => {
    const diff = b.dateTimestamp - a.dateTimestamp;
    return diff !== 0 ? diff : b.korNo.localeCompare(a.korNo);
  });

  const seenSlugs = new Set();
  const deduped = [];
  for (const it of items) {
    if (seenSlugs.has(it.slug)) continue;
    seenSlugs.add(it.slug);
    deduped.push(it);
  }
  return deduped;
}

function buildPendingThreads(
  state,
  siteUrl,
  { includeUnreleased, openDays, openActiveDays, deepdiveActiveLimit }
) {
  const jobs = [];
  const tags = state.forumTags || {};

  // 1. Shallow Waters (7 Islands) -> #ทะเลน้ำตื้น-7-เกาะ
  const oneshotPath = path.join(process.cwd(), 'public', 'api-data', 'oneshot.json');
  if (fs.existsSync(oneshotPath)) {
    const oneshot = JSON.parse(fs.readFileSync(oneshotPath, 'utf8'));
    const forumId = state.channels.shallowForum;
    const chTags = tags.shallowForum || {};
    for (const ch of oneshot.chapters || []) {
      const url = `${siteUrl}/oneshot/${ch.slug}`;
      const bullets = extractSafeTopicsBullets(ch.sections?.topics?.content);
      const introExcerpt = stripMarkdownToSummary(ch.sections?.intro?.content || ch.excerpt, 360);
      const descParts = [
        ch.coreFocus ? `**แก่นสาระสำคัญ:** ${ch.coreFocus}` : '',
        bullets ? `\n**4 มิติแห่งปัญญา (S.A.F.E.):**\n${bullets}` : '',
        introExcerpt ? `\n${introExcerpt}` : '',
        `\n📖 **[อ่านฉบับเต็ม (Easy & Deep Mode) และฟังเสียงพอดแคสต์บนเว็บไซต์](${url})**`,
      ].filter(Boolean);

      const appliedTags = [chTags['S.A.F.E. Series'], chTags['Free']];
      if (ch.audioUrl && chTags['Audio Podcast']) appliedTags.push(chTags['Audio Podcast']);

      const img = resolveValidUrl(ch.image, siteUrl);

      jobs.push({
        syncKey: `oneshot:${ch.chapterNumber}`,
        categoryLabel: 'ทะเลน้ำตื้น 7 เกาะ',
        channelId: forumId,
        payload: {
          name: truncateText(`เกาะที่ ${ch.chapterNumber}: ${ch.titleEn} — ${ch.titleTh}`, 100),
          auto_archive_duration: 10080,
          applied_tags: appliedTags.filter(Boolean).slice(0, 5),
          message: {
            content: `🌊 **ทะเลน้ำตื้น เกาะที่ ${ch.chapterNumber}** • อ่านสรุปแก่นแล้วชวนแลกเปลี่ยนความคิดเห็นใต้กระทู้นี้ได้เลยครับ`,
            embeds: [
              {
                title: truncateText(`เกาะที่ ${ch.chapterNumber}: ${ch.titleEn} • ${ch.titleTh}`, 256),
                url,
                color: 0x0e5a3e,
                description: truncateBlock(descParts.join('\n'), 3900),
                fields: [
                  { name: 'ระดับสิทธิ์', value: 'Free + Member (ทะเลเปิด)', inline: true },
                  { name: 'เวลาอ่านโดยประมาณ', value: `~${ch.readingTimeMinutes || 15} นาที`, inline: true },
                  {
                    name: 'เสียงพอดแคสต์',
                    value: ch.audioUrl ? '🎧 มีให้ฟังบนเว็บ' : 'เตรียมอัปโหลดเร็วๆ นี้',
                    inline: true,
                  },
                ],
                ...(img ? { image: { url: img } } : {}),
                footer: { text: 'The Fitrah Shield • พื้นที่เสวนาด้านล่างกระทู้นี้' },
              },
            ],
          },
        },
      });
    }
  }

  // 2. Deep Ocean (10 Archipelagos) -> #ชิมลางทะเลน้ำลึก (Free Ch1 of 1-7) & #ทะเลน้ำลึก-10-หมู่เกาะ (Member)
  const oceanPath = path.join(process.cwd(), 'public', 'api-data', 'ocean.json');
  if (fs.existsSync(oceanPath)) {
    const ocean = JSON.parse(fs.readFileSync(oceanPath, 'utf8'));
    const sampleForumId = state.channels.deepSampleForum;
    const sampleTags = tags.deepSampleForum || {};
    const deepForumId = state.channels.deepOceanForum;
    const deepTags = tags.deepOceanForum || {};

    for (const arch of ocean.deepOcean?.items || []) {
      const archNum = arch.archipelagoNumber;
      const archTagId = deepTags[ARCHIPELAGO_TAG_MAP[archNum]];

      for (const sub of arch.subIslands || []) {
        if (sub.status === 'draft') continue;
        const key = `${archNum}/${sub.chapterNumber}`;
        const scheduledIso = sub.publishedAt || DEEP_OCEAN_FALLBACK_SCHEDULE[key];
        if (!includeUnreleased && !isReleased(scheduledIso)) continue;

        const url = `${siteUrl}/ocean/${arch.slug}/${sub.chapterNumber}`;
        const summary = stripMarkdownToSummary(sub.content || sub.excerpt, 580);
        const headings = extractHeadingHighlights(sub.content, 4);
        const headingsBlock = headings.length
          ? `\n**ประเด็นสำคัญในบทนี้:**\n${headings.map((h) => `• ${h}`).join('\n')}`
          : '';
        const img = resolveValidUrl(sub.coverImage || arch.coverImage, siteUrl);
        const scheduleText = formatThaiShortDate(scheduledIso);

        // 2A. Free Sample Forum (Chapter 1 of Archipelagos 1-7)
        if (archNum <= 7 && sub.chapterNumber === 1) {
          jobs.push({
            syncKey: `sample:${key}`,
            categoryLabel: 'ชิมลางทะเลน้ำลึก',
            channelId: sampleForumId,
            payload: {
              name: truncateText(`หมู่เกาะ ${archNum} (${arch.titleEn}) • ${sub.title}`, 100),
              auto_archive_duration: 10080,
              applied_tags: [sampleTags['บทที่ 1 ทดลองอ่าน'], sampleTags['Free Tier']]
                .filter(Boolean)
                .slice(0, 5),
              message: {
                content: `⛵ **ชิมลางทะเลน้ำลึก (${key})** • สมาชิก Free ทดลองอ่านบทที่ 1 ได้แล้ว! อ่านจบแล้วมาพูดคุยใต้กระทู้นี้กันครับ`,
                embeds: [
                  {
                    title: truncateText(`${arch.titleEn} • ${sub.title}`, 256),
                    url,
                    color: 0x34d399,
                    description: truncateBlock(
                      `${summary}${headingsBlock}\n\n⛵ **[ทดลองอ่านบทที่ 1 ฉบับเต็มบนเว็บไซต์ (เข้าสู่ระบบฟรี)](${url})**`,
                      3900
                    ),
                    fields: [
                      { name: 'หมู่เกาะ', value: `${archNum}. ${arch.titleEn}`, inline: true },
                      { name: 'ระดับสิทธิ์', value: 'Free + Member (บททดลองอ่าน)', inline: true },
                      { name: 'เผยแพร่เมื่อ', value: scheduleText, inline: true },
                    ],
                    ...(img ? { image: { url: img } } : {}),
                    footer: { text: 'The Fitrah Shield • พื้นที่เสวนาด้านล่างกระทู้นี้' },
                  },
                ],
              },
            },
          });
        }

        // 2B. Member Deep Ocean Forum (All released chapters of Archipelagos 1-10)
        jobs.push({
          syncKey: `deep:${key}`,
          categoryLabel: 'ทะเลน้ำลึก (Member)',
          channelId: deepForumId,
          payload: {
            name: truncateText(`[${key}] ${arch.titleEn} — ${sub.title}`, 100),
            auto_archive_duration: 10080,
            applied_tags: archTagId ? [archTagId] : [],
            message: {
              content: `🌌 **ทะเลน้ำลึก ${key} (${arch.titleEn})** • เปิดบทเรียนใหม่สำหรับสมาชิกแล้ว ชวนวิเคราะห์เจาะลึกใต้กระทู้นี้ได้เลยครับ`,
              embeds: [
                {
                  title: truncateText(`หมู่เกาะที่ ${archNum} (${arch.titleEn}) • ${sub.title}`, 256),
                  url,
                  color: 0xd9a94f,
                  description: truncateBlock(
                    `${summary}${headingsBlock}\n\n🌌 **[อ่านฉบับเต็ม (Dual-Mode) & ฟังเสียงบนเว็บไซต์](${url})**`,
                    3900
                  ),
                  fields: [
                    { name: 'หมู่เกาะ', value: `${archNum}. ${arch.titleEn}`, inline: true },
                    { name: 'ระดับสิทธิ์', value: 'Member & Founding 100', inline: true },
                    {
                      name: 'เสียงบรรยาย',
                      value: sub.audioUrl ? `🎧 ${sub.audioDuration || 'พร้อมฟังบนเว็บ'}` : 'ไม่มีเสียง',
                      inline: true,
                    },
                    { name: 'เวลาอ่าน', value: `~${sub.readingTimeMinutes || 15} นาที`, inline: true },
                    { name: 'กำหนดเผยแพร่', value: scheduleText, inline: true },
                  ],
                  ...(img ? { image: { url: img } } : {}),
                  footer: { text: 'The Fitrah Shield • พื้นที่เสวนาด้านล่างกระทู้นี้' },
                },
              ],
            },
          },
        });
      }
    }
  }

  // 3. News from Assets/News Deepdive.xlsx
  // - Open / West Asia: rolling window (default 30 days); newest openActiveDays stay Active, rest Auto-Archived
  // - Deepdive: ALL articles synced; newest deepdiveActiveLimit (600) stay Active, older Auto-Archived
  const allNews = loadNewsFromExcel();
  const deepdiveNews = allNews.filter((n) => n.subcategory.toLowerCase().includes('deepdive'));
  const openNews = allNews.filter((n) => !n.subcategory.toLowerCase().includes('deepdive'));

  const nowMs = Date.now();
  const dayMs = 86400000;
  const openNewsSlice =
    openDays > 0
      ? openNews.filter((n) => (nowMs - n.dateTimestamp) / dayMs <= openDays)
      : openNews;
  const deepdiveSlice = deepdiveNews;

  const openJobs = [];
  const openForumTags = tags.newsOpenForum || {};
  for (const item of openNewsSlice) {
    const url = `${siteUrl}/news/${item.slug}`;
    const img = resolveValidUrl(item.image, siteUrl);
    const tagId = item.subcategory.toLowerCase().includes('west asia')
      ? openForumTags['West Asia']
      : openForumTags['ข่าวทั่วไป'];
    const leadLine =
      item.topicLead && item.topicLead !== item.title
        ? `🎯 **ประเด็นสำคัญ:** ${item.topicLead}\n\n`
        : '';
    const ageDays = (nowMs - item.dateTimestamp) / dayMs;
    const shouldArchive = ageDays > openActiveDays;

    openJobs.push({
      syncKey: `news:${item.slug}`,
      categoryLabel: shouldArchive ? 'ข่าวเปิด / West Asia (Archive)' : 'ข่าวเปิด / West Asia',
      channelId: state.channels.newsOpenForum,
      shouldArchive,
      payload: {
        name: truncateText(`[${item.korNo}] ${item.title}`, 100),
        auto_archive_duration: 10080,
        applied_tags: tagId ? [tagId] : [],
        message: {
          content: `📰 **รายงานข่าว ${item.korNo} (${item.subcategory})** • ร่วมแสดงทัศนะต่อเหตุการณ์นี้ได้ที่ใต้กระทู้ครับ`,
          embeds: [
            {
              title: truncateText(item.title, 256),
              url,
              color: 0x22d3ee,
              description: truncateBlock(
                `${leadLine}${item.summary}\n\n📰 **[อ่านรายงานฉบับเต็ม (${item.sectionsCount} ส่วน) บนเว็บไซต์](${url})**`,
                3900
              ),
              fields: [
                { name: 'รหัสข่าว', value: item.korNo, inline: true },
                { name: 'หมวดหมู่', value: item.subcategory, inline: true },
                { name: 'วันที่', value: item.dateFormatted, inline: true },
                { name: 'สิทธิ์การอ่าน', value: 'Free + Member', inline: true },
                ...(item.source ? [{ name: 'แหล่งที่มา', value: truncateText(item.source, 200), inline: true }] : []),
              ],
              ...(img ? { image: { url: img } } : {}),
              footer: { text: 'The Key of Return • The Fitrah Shield' },
            },
          ],
        },
      },
    });
  }

  // Post oldest -> newest so newest Open News appears on top of Forum while older items archive immediately
  for (const j of [...openJobs].reverse()) {
    jobs.push(j);
  }

  const deepdiveJobs = [];
  const ddForumTags = tags.newsDeepdiveForum || {};
  deepdiveSlice.forEach((item, rank) => {
    const url = `${siteUrl}/news/${item.slug}`;
    const img = resolveValidUrl(item.image, siteUrl);
    const appliedTags = [ddForumTags['Deepdive'], ddForumTags['วิเคราะห์เชิงลึก']].filter(Boolean);
    const leadLine =
      item.topicLead && item.topicLead !== item.title
        ? `🎯 **Core Strategic Focus:** ${item.topicLead}\n\n`
        : '';
    const shouldArchive = deepdiveActiveLimit >= 0 && rank >= deepdiveActiveLimit;

    deepdiveJobs.push({
      syncKey: `news:${item.slug}`,
      categoryLabel: shouldArchive ? 'ข่าว Deepdive (Auto-Archive)' : 'ข่าว Deepdive (Member)',
      channelId: state.channels.newsDeepdiveForum,
      shouldArchive,
      payload: {
        name: truncateText(`[${item.korNo}] ${item.title}`, 100),
        auto_archive_duration: 10080,
        applied_tags: appliedTags.slice(0, 5),
        message: {
          content: `🔎 **ข่าววิเคราะห์เชิงลึก ${item.korNo}** • เฉพาะสมาชิก Member & Founding 100 ร่วมวิพากษ์เชิงลึกใต้กระทู้นี้ครับ`,
          embeds: [
            {
              title: truncateText(item.title, 256),
              url,
              color: 0xd9a94f,
              description: truncateBlock(
                `${leadLine}${item.summary}\n\n🔎 **[อ่านบทวิเคราะห์ Deepdive ฉบับเต็ม (${item.sectionsCount} ส่วน) บนเว็บไซต์](${url})**`,
                3900
              ),
              fields: [
                { name: 'รหัสข่าว', value: item.korNo, inline: true },
                { name: 'หมวดหมู่', value: item.subcategory, inline: true },
                { name: 'วันที่', value: item.dateFormatted, inline: true },
                { name: 'สิทธิ์การอ่าน', value: 'Member & Founding 100', inline: true },
                ...(item.source ? [{ name: 'แหล่งที่มา', value: truncateText(item.source, 200), inline: true }] : []),
              ],
              ...(img ? { image: { url: img } } : {}),
              footer: { text: 'The Key of Return • Deepdive Sanctuary' },
            },
          ],
        },
      },
    });
  });

  // Post oldest -> newest so archived #601..#922 finish first and newest Deepdive lands on top
  for (const j of [...deepdiveJobs].reverse()) {
    jobs.push(j);
  }

  return {
    jobs,
    validOpenKeys: new Set(openJobs.map((j) => j.syncKey)),
    validOpenNames: new Set(openJobs.map((j) => j.payload.name)),
    newsTotals: {
      totalRows: allNews.length,
      openTotal: openNews.length,
      openSelected: openNewsSlice.length,
      openActiveCount: openJobs.filter((j) => !j.shouldArchive).length,
      openArchivedCount: openJobs.filter((j) => j.shouldArchive).length,
      deepdiveTotal: deepdiveNews.length,
      deepdiveSelected: deepdiveSlice.length,
      deepdiveActiveCount: deepdiveJobs.filter((j) => !j.shouldArchive).length,
      deepdiveArchivedCount: deepdiveJobs.filter((j) => j.shouldArchive).length,
    },
  };
}

async function createForumThreadSafe(job) {
  try {
    return await discordApi(`/channels/${job.channelId}/threads`, {
      method: 'POST',
      body: job.payload,
    });
  } catch (err) {
    // Fallback without embed image if an external image URL fails Discord validation
    if (err.status === 400 && job.payload?.message?.embeds?.[0]?.image) {
      const cloned = JSON.parse(JSON.stringify(job.payload));
      delete cloned.message.embeds[0].image;
      return await discordApi(`/channels/${job.channelId}/threads`, {
        method: 'POST',
        body: cloned,
      });
    }
    throw err;
  }
}

async function main() {
  const opts = parseArgs();
  const { guildId, siteUrl } = getDiscordConfig();
  const state = await ensureForumMetadataFromDiscord(guildId, loadDiscordState());

  if (!state.channels?.shallowForum || !state.channels?.deepOceanForum) {
    throw new Error(
      'ไม่พบห้อง Forum บน Discord กรุณารัน "npm run discord:setup" ก่อน'
    );
  }

  console.log(
    `🛡️ เริ่มต้น Discord Hybrid Content Sync${opts.dryRun ? ' [DRY-RUN MODE]' : ''}${
      opts.updateExisting ? ' [UPDATE-EXISTING]' : ''
    } (ข่าวเปิดย้อนหลัง ${opts.openDays} วัน / Active ${opts.openActiveDays} วัน | Deepdive Active ${
      opts.deepdiveActiveLimit
    } บท + Auto-Archive ส่วนเกิน)...`
  );
  const { jobs, validOpenKeys, validOpenNames, newsTotals } = buildPendingThreads(
    state,
    siteUrl,
    opts
  );
  const alreadySynced = state.syncedItems || {};

  // Live Discord deduplication so CI/stateless runs never create duplicates
  const forumIds = Object.keys(FORUM_CHANNEL_NAMES).map((k) => state.channels[k]);
  const { byChannel: liveThreadsByChannel, listsByChannel } = await fetchExistingThreadsIndex(
    guildId,
    forumIds
  );

  // Detect expired Open News threads (> openDays) to prune
  const pendingPrune = [];
  const seenPruneThreadIds = new Set();
  if (!opts.noPrune && state.channels.newsOpenForum) {
    for (const [syncKey, info] of Object.entries(alreadySynced)) {
      if (
        info?.channelId === state.channels.newsOpenForum &&
        syncKey.startsWith('news:') &&
        !validOpenKeys.has(syncKey) &&
        info.threadId &&
        !seenPruneThreadIds.has(info.threadId)
      ) {
        seenPruneThreadIds.add(info.threadId);
        pendingPrune.push({ syncKey, threadId: info.threadId, name: info.title || syncKey });
      }
    }
    for (const t of listsByChannel.get(state.channels.newsOpenForum) || []) {
      if (
        /^\[(KOR|NEWS)[^\]]+\]/i.test(t.name) &&
        !validOpenNames.has(t.name) &&
        !seenPruneThreadIds.has(t.id)
      ) {
        seenPruneThreadIds.add(t.id);
        pendingPrune.push({ syncKey: null, threadId: t.id, name: t.name });
      }
    }
  }

  const pendingCreate = [];
  const pendingUpdate = [];
  const pendingArchive = [];

  for (const job of jobs) {
    const saved = alreadySynced[job.syncKey];
    const liveMatch = liveThreadsByChannel.get(job.channelId)?.get(job.payload.name);
    const knownThreadId = saved?.threadId || liveMatch?.id;

    if (knownThreadId) {
      if (!saved) {
        state.syncedItems[job.syncKey] = {
          threadId: knownThreadId,
          channelId: job.channelId,
          title: job.payload.name,
          archived: Boolean(liveMatch?.archived),
          syncedAt: new Date().toISOString(),
        };
      }
      if (job.shouldArchive && liveMatch && !liveMatch.archived) {
        pendingArchive.push({ syncKey: job.syncKey, threadId: knownThreadId });
      }
      if (opts.updateExisting) {
        pendingUpdate.push({
          job,
          threadId: knownThreadId,
          archived: Boolean(liveMatch?.archived),
          shouldArchiveAfter: Boolean(job.shouldArchive),
        });
      }
    } else {
      pendingCreate.push(job);
    }
  }

  const batchCreate =
    opts.batchSize > 0 ? pendingCreate.slice(0, opts.batchSize) : pendingCreate;

  console.log(
    `📊 สถิติคลังข่าวใน Excel: ทั้งหมด ${newsTotals.totalRows} รายการ ` +
      `(เปิด/West Asia ${newsTotals.openTotal} → เก็บ ${opts.openDays} วัน ${newsTotals.openSelected} [Active ${newsTotals.openActiveCount} / Archive ${newsTotals.openArchivedCount}], ` +
      `Deepdive ${newsTotals.deepdiveTotal} → ลงทั้งหมด ${newsTotals.deepdiveSelected} [Active ${newsTotals.deepdiveActiveCount} / Archive ${newsTotals.deepdiveArchivedCount}])`
  );
  console.log(
    `📋 สรุปรอบนี้: เป้าหมาย ${jobs.length} | มีแล้ว ${
      jobs.length - pendingCreate.length
    } | รอสร้างใหม่ ${pendingCreate.length}${
      opts.batchSize > 0 ? ` (รันชุดนี้ ${batchCreate.length})` : ''
    } | รอ Archive เพิ่ม ${pendingArchive.length} | รอลบข่าวเกิน ${opts.openDays} วัน ${
      pendingPrune.length
    }`
  );

  if (opts.dryRun) {
    const byCat = {};
    for (const j of batchCreate) {
      byCat[j.categoryLabel] = (byCat[j.categoryLabel] || 0) + 1;
    }
    console.log('\n🧪 [DRY-RUN] จำนวนที่รอสร้างแยกตามหมวดหมู่:', byCat);
    if (batchCreate.length > 0) {
      console.log('🧪 ตัวอย่าง 5 รายการแรก:', batchCreate.slice(0, 5).map((j) => `${j.syncKey} -> ${j.payload.name}`));
      console.log('🧪 ตัวอย่าง 5 รายการสุดท้าย:', batchCreate.slice(-5).map((j) => `${j.syncKey} -> ${j.payload.name}`));
    }
    if (pendingPrune.length > 0) {
      console.log('🧹 ข่าวเปิดที่เก่าเกินกำหนดที่จะถูกลบ:', pendingPrune.slice(0, 5));
    }
    return;
  }

  saveDiscordState(state);

  // Step A: Prune expired Open News (> openDays)
  let prunedCount = 0;
  for (const item of pendingPrune) {
    try {
      await discordApi(`/channels/${item.threadId}`, { method: 'DELETE' });
      prunedCount++;
      console.log(`   🧹 [Prune ${prunedCount}/${pendingPrune.length}] ลบข่าวเกิน ${opts.openDays} วัน: "${item.name}"`);
    } catch (err) {
      if (err.status !== 404) {
        console.warn(`   ⚠️ ลบข่าว "${item.name}" ไม่สำเร็จ: ${err.message}`);
      }
    }
    if (item.syncKey && state.syncedItems[item.syncKey]) {
      delete state.syncedItems[item.syncKey];
      saveDiscordState(state);
    }
    await sleep(1000);
  }

  // Step B: Archive any existing active threads that aged past active threshold
  let archivedExistingCount = 0;
  for (const item of pendingArchive) {
    try {
      await discordApi(`/channels/${item.threadId}`, {
        method: 'PATCH',
        body: { archived: true },
      });
      if (state.syncedItems[item.syncKey]) {
        state.syncedItems[item.syncKey].archived = true;
        saveDiscordState(state);
      }
      archivedExistingCount++;
      await sleep(450);
    } catch (err) {
      console.warn(`   ⚠️ Auto-archive ${item.syncKey} (${item.threadId}) ไม่สำเร็จ: ${err.message}`);
    }
  }
  if (archivedExistingCount > 0) {
    console.log(`📦 ย้ายกระทู้เดิมเข้า Auto-Archive แล้ว ${archivedExistingCount} กระทู้`);
  }

  if (batchCreate.length === 0 && pendingUpdate.length === 0) {
    console.log('✅ เนื้อหาทั้งหมดบน Discord ตรงกับคลังล่าสุดแล้ว');
    return;
  }

  // Step C: Create new threads with safe rate-limit pacing
  let createdCount = 0;
  let skippedCount = 0;
  for (let i = 0; i < batchCreate.length; i++) {
    const job = batchCreate[i];
    try {
      const thread = await createForumThreadSafe(job);
      let archivedOk = false;
      if (job.shouldArchive) {
        try {
          await discordApi(`/channels/${thread.id}`, {
            method: 'PATCH',
            body: { archived: true },
          });
          archivedOk = true;
          await sleep(350);
        } catch (archErr) {
          console.warn(`   ⚠️ สร้างแล้วแต่ Archive ${job.syncKey} ไม่สำเร็จ: ${archErr.message}`);
        }
      }
      state.syncedItems[job.syncKey] = {
        threadId: thread.id,
        channelId: job.channelId,
        title: job.payload.name,
        archived: archivedOk,
        syncedAt: new Date().toISOString(),
      };
      saveDiscordState(state);
      createdCount++;
      if (createdCount <= 5 || createdCount % 25 === 0 || createdCount === batchCreate.length) {
        console.log(
          `   ✅ [${createdCount}/${batchCreate.length}] ${job.syncKey}${
            archivedOk ? ' [Archived]' : ' [Active]'
          } → "${job.payload.name}"`
        );
      }
      await sleep(1100);
      if ((i + 1) % 50 === 0 && i + 1 < batchCreate.length) {
        console.log(`   ⏸️ พักช่วงลดภาระ Rate Limit 5 วินาที (ดำเนินการแล้ว ${i + 1}/${batchCreate.length})...`);
        await sleep(5000);
      }
    } catch (err) {
      if (err.status === 400) {
        skippedCount++;
        console.warn(`   ⚠️ ข้าม ${job.syncKey} ("${job.payload.name}") เนื่องจาก Discord 400: ${err.message}`);
        await sleep(1000);
        continue;
      }
      console.error(`   ❌ Failed ${job.syncKey} ("${job.payload.name}"):`, err.message);
      throw err;
    }
  }

  let updatedCount = 0;
  for (const { job, threadId, archived, shouldArchiveAfter } of pendingUpdate) {
    try {
      if (archived) {
        await discordApi(`/channels/${threadId}`, {
          method: 'PATCH',
          body: { archived: false },
        });
      }
      await discordApi(`/channels/${threadId}/messages/${threadId}`, {
        method: 'PATCH',
        body: {
          content: job.payload.message.content,
          embeds: job.payload.message.embeds,
        },
      });
      if (shouldArchiveAfter || archived) {
        await discordApi(`/channels/${threadId}`, {
          method: 'PATCH',
          body: { archived: true },
        });
      }
      updatedCount++;
      console.log(`   🔄 [Update ${updatedCount}/${pendingUpdate.length}] ${job.syncKey} (${threadId})`);
      await sleep(1500);
    } catch (err) {
      console.warn(`   ⚠️ Skipped update ${job.syncKey} (${threadId}): ${err.message}`);
    }
  }

  console.log(
    `\n🎉 ซิงค์เสร็จสิ้น! สร้างใหม่ ${createdCount} | ข้าม ${skippedCount} | อัปเดต ${updatedCount} | ลบข่าวเก่า ${prunedCount}`
  );
}

main().catch((err) => {
  console.error('❌ Discord Sync ล้มเหลว:', err?.message || err);
  process.exit(1);
});

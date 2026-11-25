/**
 * Reorganize & Provision "Birds of Paradise - บินสู่ความสงบในหัวใจ" Discord Server
 *
 * Preserves ALL existing channels, messages, and threads while cleanly organizing them
 * into 4 categories open to @everyone (no member tier gating):
 *   1. 🕊️ แนะนำช่อง & สนับสนุน
 *   2. 🕌 ศาสนกิจ & ดุอาอฺ
 *   3. 📰 สำนักข่าว The Key of Return (#ข่าวสาร-west-asia, #news-deepdive + archives)
 *   4. 🌊 คลังปัญญา & พื้นที่เสวนา (#ksf_basic-thoughts🫶 + voice)
 *
 * Usage:
 *   npm run discord:birds:setup
 *   node scripts/discord-birds-setup.mjs
 */
import path from 'path';
import {
  getDiscordConfig,
  discordApi,
  loadDiscordState,
  saveDiscordState,
  sleep,
} from './discord-api.mjs';

export const DEFAULT_BIRDS_GUILD_ID = '1473338926164086915';
export const BIRDS_STATE_FILE_PATH = path.join(process.cwd(), 'data', 'discord_birds_state.json');

const PERM = {
  ADD_REACTIONS: 1n << 6n,
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  CREATE_PUBLIC_THREADS: 1n << 35n,
  SEND_MESSAGES_IN_THREADS: 1n << 38n,
};

function bits(...flags) {
  return flags.reduce((acc, f) => acc | f, 0n).toString();
}

const CHANNEL_TYPE = {
  TEXT: 0,
  VOICE: 2,
  CATEGORY: 4,
  FORUM: 15,
};

function mergeForumTags(desiredTags, existingTags = []) {
  return desiredTags.map((tag) => {
    const found = existingTags.find((t) => t.name === tag.name);
    const entry = {
      name: tag.name,
      moderated: false,
    };
    if (found?.id) entry.id = found.id;
    if (tag.emoji_name) entry.emoji_name = tag.emoji_name;
    return entry;
  });
}

async function ensureCategory(guildId, existingChannels, state, spec) {
  const savedId = state.categories?.[spec.key];
  const match =
    (savedId && existingChannels.find((c) => c.id === savedId && c.type === CHANNEL_TYPE.CATEGORY)) ||
    existingChannels.find((c) => c.type === CHANNEL_TYPE.CATEGORY && c.name === spec.name);

  if (match) {
    const updated = await discordApi(`/channels/${match.id}`, {
      method: 'PATCH',
      body: { name: spec.name, position: spec.position },
    });
    console.log(`   🔄 Synced category "${spec.name}" (${updated.id})`);
    await sleep(350);
    return updated;
  }

  const created = await discordApi(`/guilds/${guildId}/channels`, {
    method: 'POST',
    body: {
      name: spec.name,
      type: CHANNEL_TYPE.CATEGORY,
      position: spec.position,
    },
  });
  existingChannels.push(created);
  console.log(`   ✅ Created category "${spec.name}" (${created.id})`);
  await sleep(400);
  return created;
}

async function moveExistingChannel(existingChannels, { id, fallbackNames = [], parentId, position }) {
  const match =
    (id && existingChannels.find((c) => c.id === id)) ||
    existingChannels.find((c) => fallbackNames.includes(c.name));

  if (!match) {
    console.warn(`   ⚠️ ไม่พบช่องเดิม (${fallbackNames[0] || id}) ข้ามการย้าย`);
    return null;
  }

  const updated = await discordApi(`/channels/${match.id}`, {
    method: 'PATCH',
    body: { parent_id: parentId, position },
  });
  console.log(`   📦 Moved #${updated.name} (${updated.id}) → parent ${parentId}`);
  await sleep(350);
  return updated;
}

async function ensureOpenForum(guildId, existingChannels, state, spec) {
  const savedId = state.channels?.[spec.key];
  const match =
    (savedId && existingChannels.find((c) => c.id === savedId)) ||
    (spec.knownId && existingChannels.find((c) => c.id === spec.knownId)) ||
    existingChannels.find(
      (c) => c.type === CHANNEL_TYPE.FORUM && (c.name === spec.name || (spec.altNames || []).includes(c.name))
    );

  const payload = {
    name: match ? match.name : spec.name,
    parent_id: spec.parentId,
    position: spec.position,
    topic: spec.topic,
    permission_overwrites: spec.overwrites,
    available_tags: mergeForumTags(spec.availableTags, match?.available_tags || []),
    default_auto_archive_duration: 10080,
    default_sort_order: 1,
    default_forum_layout: 2,
  };

  if (match) {
    const updated = await discordApi(`/channels/${match.id}`, {
      method: 'PATCH',
      body: payload,
    });
    console.log(`   🔄 Synced Forum #${updated.name} (${updated.id})`);
    await sleep(400);
    return updated;
  }

  try {
    const created = await discordApi(`/guilds/${guildId}/channels`, {
      method: 'POST',
      body: {
        ...payload,
        type: CHANNEL_TYPE.FORUM,
      },
    });
    existingChannels.push(created);
    console.log(`   ✅ Created Forum #${created.name} (${created.id})`);
    await sleep(500);
    return created;
  } catch (err) {
    if (err.status === 400 && /community|type/i.test(err.message)) {
      const e = new Error(
        `COMMUNITY_MODE_REQUIRED: เซิร์ฟเวอร์ ${guildId} ต้องเปิด Community Mode ก่อนสร้างห้อง Forum ใหม่ (${err.message})`
      );
      e.code = 'COMMUNITY_MODE_REQUIRED';
      throw e;
    }
    throw err;
  }
}

async function main() {
  const birdsGuildId = process.env.DISCORD_BIRDS_GUILD_ID || DEFAULT_BIRDS_GUILD_ID;
  const { siteUrl } = getDiscordConfig(birdsGuildId);
  const state = loadDiscordState(BIRDS_STATE_FILE_PATH);
  state.guildId = birdsGuildId;

  console.log(`🕊️ กำลังสำรวจและจัดระเบียบเซิร์ฟเวอร์ Birds of Paradise (${birdsGuildId})...`);
  const guild = await discordApi(`/guilds/${birdsGuildId}`);
  console.log(`✅ เชื่อมต่อ "${guild.name}" สำเร็จ (features: ${(guild.features || []).join(', ') || 'none'})`);

  const existingChannels = await discordApi(`/guilds/${birdsGuildId}/channels`);

  const openForumOverwrites = [
    {
      id: birdsGuildId, // @everyone
      type: 0,
      allow: bits(
        PERM.VIEW_CHANNEL,
        PERM.READ_MESSAGE_HISTORY,
        PERM.ADD_REACTIONS,
        PERM.SEND_MESSAGES_IN_THREADS
      ),
      deny: bits(PERM.SEND_MESSAGES, PERM.CREATE_PUBLIC_THREADS),
    },
  ];

  // 1. Create / Sync the 4 clean categories
  console.log('\n🏛️ ขั้นตอนที่ 1/3: จัดโครงสร้าง 4 หมวดหมู่หลัก...');
  const catSupport = await ensureCategory(birdsGuildId, existingChannels, state, {
    key: 'support',
    name: '🕊️ แนะนำช่อง & สนับสนุน',
    position: 0,
  });
  const catIbadah = await ensureCategory(birdsGuildId, existingChannels, state, {
    key: 'ibadah',
    name: '🕌 ศาสนกิจ & ดุอาอฺ',
    position: 1,
  });
  const catNews = await ensureCategory(birdsGuildId, existingChannels, state, {
    key: 'news',
    name: '📰 สำนักข่าว The Key of Return',
    position: 2,
  });
  const catWisdom = await ensureCategory(birdsGuildId, existingChannels, state, {
    key: 'wisdom',
    name: '🌊 คลังปัญญา & พื้นที่เสวนา',
    position: 3,
  });

  state.categories = {
    support: catSupport.id,
    ibadah: catIbadah.id,
    news: catNews.id,
    wisdom: catWisdom.id,
  };

  // 2. Move existing channels safely into categories & provision News/Basic-Thoughts Forums
  console.log('\n📦 ขั้นตอนที่ 2/3: จัดเรียงห้องเดิมและตั้งค่าห้องข่าว + ksf_basic-thoughts...');

  await moveExistingChannel(existingChannels, {
    id: '1473338931230670954',
    fallbackNames: ['support-ช่อง'],
    parentId: catSupport.id,
    position: 0,
  });

  await moveExistingChannel(existingChannels, {
    id: '1473342200443175156',
    fallbackNames: ['namaz_เวลานมาซ'],
    parentId: catIbadah.id,
    position: 0,
  });
  await moveExistingChannel(existingChannels, {
    id: '1473339249360244878',
    fallbackNames: ['dua_ดุอาอฺรายวัน'],
    parentId: catIbadah.id,
    position: 1,
  });
  await moveExistingChannel(existingChannels, {
    id: '1473341981957820556',
    fallbackNames: ['dua_ดุอาอฺสำคัญในเดือน'],
    parentId: catIbadah.id,
    position: 2,
  });
  await moveExistingChannel(existingChannels, {
    id: '1478065100152770630',
    fallbackNames: ['บทเรียนแห่งรอมฎอน-บทความ-สื่อเสียง-คลิปสรุป'],
    parentId: catIbadah.id,
    position: 3,
  });

  const newsOpenForum = await ensureOpenForum(birdsGuildId, existingChannels, state, {
    key: 'newsOpenForum',
    name: 'ข่าวสาร-west-asia',
    parentId: catNews.id,
    position: 0,
    topic: `รายงานข่าวสถานการณ์โลกและ West Asia (30 วันล่าสุด อัปเดตตรงกับ ${siteUrl}/news เปิดอ่านทุกคน)`,
    overwrites: openForumOverwrites,
    availableTags: [
      { name: 'West Asia', emoji_name: '🌍' },
      { name: 'ข่าวทั่วไป', emoji_name: '📰' },
    ],
  });

  const newsDeepdiveForum = await ensureOpenForum(birdsGuildId, existingChannels, state, {
    key: 'newsDeepdiveForum',
    name: 'news-deepdive',
    parentId: catNews.id,
    position: 1,
    topic: `บทวิเคราะห์ข่าวเชิงลึก Deepdive (30 วันล่าสุด อัปเดตเท่ากับ The Fitrah Shield เปิดให้สมาชิกทุกคนในห้องนี้)`,
    overwrites: openForumOverwrites,
    availableTags: [
      { name: 'Deepdive', emoji_name: '🔎' },
      { name: 'วิเคราะห์เชิงลึก', emoji_name: '🧠' },
    ],
  });

  await moveExistingChannel(existingChannels, {
    id: '1477362457998528582',
    fallbackNames: ['เกาะติดสถานการณ์อิหร่าน-2026'],
    parentId: catNews.id,
    position: 2,
  });
  await moveExistingChannel(existingChannels, {
    id: '1473341440804262033',
    fallbackNames: ['news_ข่าวสารรอบโลก'],
    parentId: catNews.id,
    position: 3,
  });

  const shallowForum = await ensureOpenForum(birdsGuildId, existingChannels, state, {
    key: 'shallowForum',
    knownId: '1555601115087896576',
    name: 'ksf_basic-thoughts🫶',
    altNames: ['ksf_basic-thoughts'],
    parentId: catWisdom.id,
    position: 0,
    topic: `7 เกาะแห่งปัญญา (ทะเลน้ำตื้น S.A.F.E. Series) • อ่านสรุปแก่นและเชิญชวนเจาะลึกต่อสู่ทะเลน้ำลึก 10 หมู่เกาะที่ ${siteUrl}/ocean`,
    overwrites: openForumOverwrites,
    availableTags: [
      { name: 'S.A.F.E. Series', emoji_name: '🏝️' },
      { name: 'Audio Podcast', emoji_name: '🎧' },
      { name: 'Free', emoji_name: '🌊' },
      { name: 'ทะเลน้ำลึก (CTA)', emoji_name: '🌌' },
    ],
  });

  await moveExistingChannel(existingChannels, {
    id: '1473338931230670955',
    fallbackNames: ['ทั่วไป'],
    parentId: catWisdom.id,
    position: 1,
  });

  state.channels = {
    ...state.channels,
    shallowForum: shallowForum.id,
    newsOpenForum: newsOpenForum.id,
    newsDeepdiveForum: newsDeepdiveForum.id,
  };

  state.forumTags = {
    ...state.forumTags,
    shallowForum: Object.fromEntries((shallowForum.available_tags || []).map((t) => [t.name, t.id])),
    newsOpenForum: Object.fromEntries((newsOpenForum.available_tags || []).map((t) => [t.name, t.id])),
    newsDeepdiveForum: Object.fromEntries(
      (newsDeepdiveForum.available_tags || []).map((t) => [t.name, t.id])
    ),
  };

  // 3. Remove empty legacy default categories (only if 0 child channels remain)
  console.log('\n🧹 ขั้นตอนที่ 3/3: ตรวจสอบหมวดหมู่เริ่มต้นที่ว่างเปล่า...');
  const refreshed = await discordApi(`/guilds/${birdsGuildId}/channels`);
  const legacyCategoryNames = new Set(['ช่องข้อความ', 'ช่องสำหรับพูด']);
  for (const cat of refreshed.filter((c) => c.type === CHANNEL_TYPE.CATEGORY && legacyCategoryNames.has(c.name))) {
    const hasKids = refreshed.some((c) => c.parent_id === cat.id);
    if (!hasKids) {
      await discordApi(`/channels/${cat.id}`, { method: 'DELETE' });
      console.log(`   🧹 ลบหมวดหมู่ว่าง "${cat.name}" (${cat.id}) แล้ว`);
      await sleep(350);
    }
  }

  saveDiscordState(state, BIRDS_STATE_FILE_PATH);
  console.log(`\n🎉 จัดระเบียบเซิร์ฟเวอร์ Birds of Paradise สำเร็จและบันทึกสถานะลง ${BIRDS_STATE_FILE_PATH} แล้ว!`);
}

main().catch((err) => {
  console.error('❌ Birds of Paradise Setup ล้มเหลว:', err?.message || err);
  process.exit(1);
});

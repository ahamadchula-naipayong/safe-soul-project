/**
 * Idempotent Discord Server Structure Provisioner for THE FITRAH SHIELD
 * Creates/updates Roles (Free, Member, Founding 100 Gold), 3 Categories, 11 Channels,
 * Forum Tags, Permission Overwrites, and Onboarding/Schedule Embeds.
 *
 * Usage:
 *   npm run discord:setup
 *   node scripts/discord-setup.mjs
 */
import fs from 'fs';
import path from 'path';
import {
  getDiscordConfig,
  discordApi,
  loadDiscordState,
  saveDiscordState,
  upsertEnvLocal,
  sleep,
} from './discord-api.mjs';

function loadLogoDataUri() {
  const candidates = [
    path.join(process.cwd(), 'public', 'images', 'logo', 'logo-normal.png'),
    path.join(process.cwd(), 'public', 'images', 'logo', 'logo-transparent.png'),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      const b64 = fs.readFileSync(filePath).toString('base64');
      return `data:image/png;base64,${b64}`;
    }
  }
  return null;
}

const PERM = {
  ADD_REACTIONS: 1n << 6n,
  STREAM: 1n << 9n,
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  EMBED_LINKS: 1n << 14n,
  ATTACH_FILES: 1n << 15n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  CONNECT: 1n << 20n,
  SPEAK: 1n << 21n,
  USE_VAD: 1n << 25n,
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

const ROLE_DEFS = [
  {
    key: 'free',
    name: 'Free',
    color: 0x34d399, // Emerald
    hoist: false,
    mentionable: false,
  },
  {
    key: 'member',
    name: 'Member',
    color: 0x22d3ee, // Deep Ocean Cyan
    hoist: true,
    mentionable: false,
  },
  {
    key: 'founding100',
    name: 'Founding 100',
    color: 0xd9a94f, // Regal Gold
    hoist: true,
    mentionable: true,
  },
];

async function ensureRoles(guildId, state) {
  const existingRoles = await discordApi(`/guilds/${guildId}/roles`);
  const resolved = {};

  for (const def of ROLE_DEFS) {
    const savedId = state.roles?.[def.key];
    let match =
      (savedId && existingRoles.find((r) => r.id === savedId)) ||
      existingRoles.find((r) => r.name === def.name);

    const payload = {
      name: def.name,
      color: def.color,
      hoist: def.hoist,
      mentionable: def.mentionable,
    };

    if (match) {
      match = await discordApi(`/guilds/${guildId}/roles/${match.id}`, {
        method: 'PATCH',
        body: payload,
      });
      console.log(`   🔄 Updated role "${def.name}" (${match.id})`);
    } else {
      match = await discordApi(`/guilds/${guildId}/roles`, {
        method: 'POST',
        body: payload,
      });
      console.log(`   ✅ Created role "${def.name}" (${match.id})`);
    }

    resolved[def.key] = match.id;
    await sleep(400);
  }

  // Enforce visual & permission hierarchy: Founding 100 (3) > Member (2) > Free (1)
  try {
    await discordApi(`/guilds/${guildId}/roles`, {
      method: 'PATCH',
      body: [
        { id: resolved.founding100, position: 3 },
        { id: resolved.member, position: 2 },
        { id: resolved.free, position: 1 },
      ],
    });
    console.log('   📐 จัดลำดับยศสำเร็จ: Founding 100 (3) > Member (2) > Free (1)');
  } catch (err) {
    console.warn('   ⚠️ ไม่สามารถจัดลำดับยศอัตโนมัติได้:', err.message);
  }

  return resolved;
}

function mergeForumTags(desiredTags, existingTags = []) {
  return desiredTags.map((tag) => {
    const found = existingTags.find((t) => t.name === tag.name);
    const entry = {
      name: tag.name,
      moderated: false,
    };
    if (found?.id) {
      entry.id = found.id;
    }
    if (tag.emoji_name) {
      entry.emoji_name = tag.emoji_name;
    }
    return entry;
  });
}

async function ensureChannel(guildId, existingChannels, state, spec) {
  const savedId =
    spec.type === CHANNEL_TYPE.CATEGORY
      ? state.categories?.[spec.key]
      : state.channels?.[spec.key];

  let match =
    (savedId && existingChannels.find((c) => c.id === savedId)) ||
    existingChannels.find(
      (c) =>
        c.name === spec.name &&
        c.type === spec.type &&
        (c.parent_id || null) === (spec.parentId || null)
    );

  const payload = {
    name: spec.name,
    type: spec.type,
    permission_overwrites: spec.overwrites || [],
  };

  if (spec.parentId) payload.parent_id = spec.parentId;
  if (spec.topic) payload.topic = spec.topic;
  if (spec.position !== undefined) payload.position = spec.position;

  if (spec.type === CHANNEL_TYPE.FORUM) {
    payload.available_tags = mergeForumTags(
      spec.availableTags || [],
      match?.available_tags || []
    );
    payload.default_auto_archive_duration = 10080; // 7 days
    payload.default_sort_order = 1; // Creation date
    payload.default_forum_layout = 2; // Gallery card view
  }

  if (match) {
    // PATCH does not accept `type` across incompatible conversions, omit `type` on PATCH
    const { type: _omitType, ...patchBody } = payload;
    const updated = await discordApi(`/channels/${match.id}`, {
      method: 'PATCH',
      body: patchBody,
    });
    console.log(`   🔄 Synced ${spec.type === 4 ? 'category' : 'channel'} "${spec.name}" (${updated.id})`);
    await sleep(400);
    return updated;
  }

  const created = await discordApi(`/guilds/${guildId}/channels`, {
    method: 'POST',
    body: payload,
  });
  existingChannels.push(created);
  console.log(`   ✅ Created ${spec.type === 4 ? 'category' : 'channel'} "${spec.name}" (${created.id})`);
  await sleep(500);
  return created;
}

async function upsertInfoMessage(channelId, savedMsgId, payload) {
  if (savedMsgId) {
    try {
      const updated = await discordApi(`/channels/${channelId}/messages/${savedMsgId}`, {
        method: 'PATCH',
        body: payload,
      });
      return updated.id;
    } catch (err) {
      if (err.status !== 404) throw err;
    }
  }
  const posted = await discordApi(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: payload,
  });
  return posted.id;
}

async function cleanupStarterPlaceholders(guildId, existingChannels, resolvedChannelIds) {
  const starterNames = new Set(['ทั่วไป', 'ช่องข้อความ', 'ช่องสำหรับพูด', 'rules', 'general']);
  const protectedIds = new Set(Object.values(resolvedChannelIds));

  // Delete child channels first, then empty default categories
  const candidates = existingChannels
    .filter((c) => starterNames.has(c.name) && !protectedIds.has(c.id))
    .sort((a, b) => (a.type === 4 ? 1 : 0) - (b.type === 4 ? 1 : 0));

  for (const ch of candidates) {
    try {
      if (ch.type === CHANNEL_TYPE.TEXT) {
        const msgs = await discordApi(`/channels/${ch.id}/messages?limit=5`);
        if (Array.isArray(msgs) && msgs.length > 0) {
          continue; // Do not remove channels that already contain user messages
        }
      }
      await discordApi(`/channels/${ch.id}`, { method: 'DELETE' });
      console.log(`   🧹 Removed empty starter channel "${ch.name}" (${ch.id})`);
      await sleep(400);
    } catch (err) {
      console.warn(`   ⚠️ Skipped starter channel "${ch.name}": ${err.message}`);
    }
  }
}

async function main() {
  const { guildId, siteUrl } = getDiscordConfig();
  const state = loadDiscordState();
  state.guildId = guildId;

  console.log('🛡️ กำลังตรวจสอบเซิร์ฟเวอร์ Discord และโหมด Community...');
  const guild = await discordApi(`/guilds/${guildId}`);
  const features = guild.features || [];
  if (!features.includes('COMMUNITY')) {
    throw new Error(
      `เซิร์ฟเวอร์ "${guild.name}" ยังไม่ได้เปิด Community Mode (features: ${features.join(', ')}). กรุณาเปิด Community Mode ก่อนสร้างห้อง Forum`
    );
  }
  console.log(`✅ เชื่อมต่อเซิร์ฟเวอร์ "${guild.name}" สำเร็จ (Community Mode เปิดใช้งานแล้ว)`);

  // 1. Roles
  console.log('\n🎭 ขั้นตอนที่ 1/4: ตั้งค่ายศสมาชิก (Free / Member / Founding 100 สีทอง)...');
  const roleIds = await ensureRoles(guildId, state);
  state.roles = roleIds;

  const everyoneId = guildId;
  const publicReadOnlyOverwrites = [
    {
      id: everyoneId,
      type: 0,
      allow: bits(PERM.VIEW_CHANNEL, PERM.READ_MESSAGE_HISTORY),
      deny: bits(PERM.SEND_MESSAGES, PERM.CREATE_PUBLIC_THREADS, PERM.SEND_MESSAGES_IN_THREADS),
    },
  ];

  const freeForumOverwrites = [
    {
      id: everyoneId,
      type: 0,
      allow: '0',
      deny: bits(PERM.VIEW_CHANNEL),
    },
    ...[roleIds.free, roleIds.member, roleIds.founding100].map((id) => ({
      id,
      type: 0,
      allow: bits(
        PERM.VIEW_CHANNEL,
        PERM.READ_MESSAGE_HISTORY,
        PERM.ADD_REACTIONS,
        PERM.SEND_MESSAGES_IN_THREADS
      ),
      deny: bits(PERM.SEND_MESSAGES, PERM.CREATE_PUBLIC_THREADS),
    })),
  ];

  const freeChatOverwrites = [
    {
      id: everyoneId,
      type: 0,
      allow: '0',
      deny: bits(PERM.VIEW_CHANNEL),
    },
    ...[roleIds.free, roleIds.member, roleIds.founding100].map((id) => ({
      id,
      type: 0,
      allow: bits(
        PERM.VIEW_CHANNEL,
        PERM.READ_MESSAGE_HISTORY,
        PERM.ADD_REACTIONS,
        PERM.SEND_MESSAGES,
        PERM.SEND_MESSAGES_IN_THREADS,
        PERM.EMBED_LINKS,
        PERM.ATTACH_FILES
      ),
      deny: '0',
    })),
  ];

  const memberForumOverwrites = [
    {
      id: everyoneId,
      type: 0,
      allow: '0',
      deny: bits(PERM.VIEW_CHANNEL),
    },
    {
      id: roleIds.free,
      type: 0,
      allow: '0',
      deny: bits(PERM.VIEW_CHANNEL),
    },
    ...[roleIds.member, roleIds.founding100].map((id) => ({
      id,
      type: 0,
      allow: bits(
        PERM.VIEW_CHANNEL,
        PERM.READ_MESSAGE_HISTORY,
        PERM.ADD_REACTIONS,
        PERM.SEND_MESSAGES_IN_THREADS
      ),
      deny: bits(PERM.SEND_MESSAGES, PERM.CREATE_PUBLIC_THREADS),
    })),
  ];

  const memberChatOverwrites = [
    {
      id: everyoneId,
      type: 0,
      allow: '0',
      deny: bits(PERM.VIEW_CHANNEL),
    },
    {
      id: roleIds.free,
      type: 0,
      allow: '0',
      deny: bits(PERM.VIEW_CHANNEL),
    },
    ...[roleIds.member, roleIds.founding100].map((id) => ({
      id,
      type: 0,
      allow: bits(
        PERM.VIEW_CHANNEL,
        PERM.READ_MESSAGE_HISTORY,
        PERM.ADD_REACTIONS,
        PERM.SEND_MESSAGES,
        PERM.SEND_MESSAGES_IN_THREADS,
        PERM.EMBED_LINKS,
        PERM.ATTACH_FILES
      ),
      deny: '0',
    })),
  ];

  const memberVoiceOverwrites = [
    {
      id: everyoneId,
      type: 0,
      allow: '0',
      deny: bits(PERM.VIEW_CHANNEL),
    },
    {
      id: roleIds.free,
      type: 0,
      allow: '0',
      deny: bits(PERM.VIEW_CHANNEL),
    },
    ...[roleIds.member, roleIds.founding100].map((id) => ({
      id,
      type: 0,
      allow: bits(PERM.VIEW_CHANNEL, PERM.CONNECT, PERM.SPEAK, PERM.USE_VAD, PERM.STREAM),
      deny: '0',
    })),
  ];

  // 2. Categories & Channels
  console.log('\n🏛️ ขั้นตอนที่ 2/4: สร้างหมวดหมู่และห้องสนทนา (3 หมวดหมู่ / 11 ห้อง)...');
  const existingChannels = await discordApi(`/guilds/${guildId}/channels`);

  const catWelcome = await ensureChannel(guildId, existingChannels, state, {
    key: 'welcome',
    name: '⚓ ท่าเรือต้อนรับ',
    type: CHANNEL_TYPE.CATEGORY,
    position: 0,
    overwrites: publicReadOnlyOverwrites,
  });

  const catFree = await ensureChannel(guildId, existingChannels, state, {
    key: 'shallowAndOpen',
    name: '🌊 ทะเลน้ำตื้น & ข่าวเปิด',
    type: CHANNEL_TYPE.CATEGORY,
    position: 1,
    overwrites: freeForumOverwrites,
  });

  const catMember = await ensureChannel(guildId, existingChannels, state, {
    key: 'deepOceanMember',
    name: '🌌 ทะเลน้ำลึก & เจาะลึก',
    type: CHANNEL_TYPE.CATEGORY,
    position: 2,
    overwrites: memberForumOverwrites,
  });

  state.categories = {
    welcome: catWelcome.id,
    shallowAndOpen: catFree.id,
    deepOceanMember: catMember.id,
  };

  const channelSpecs = [
    // Category 1: Welcome
    {
      key: 'welcomeRules',
      name: 'welcome-กติกา',
      type: CHANNEL_TYPE.TEXT,
      parentId: catWelcome.id,
      position: 0,
      topic: 'ยินดีต้อนรับสู่ The Fitrah Shield • เกราะพิทักษ์ฟิฏเราะฮฺ และกติกาพื้นที่ปลอดภัยทางจิตวิญญาณ',
      overwrites: publicReadOnlyOverwrites,
    },
    {
      key: 'verifyAccount',
      name: 'verify-เชื่อมบัญชีเว็บ',
      type: CHANNEL_TYPE.TEXT,
      parentId: catWelcome.id,
      position: 1,
      topic: `เชื่อมบัญชีสมาชิก ${siteUrl}/login เพื่อรับยศ Free, Member หรือ Founding 100 สีทอง`,
      overwrites: publicReadOnlyOverwrites,
    },
    {
      key: 'releaseSchedule',
      name: 'ประกาศ-ตารางเดินเรือ',
      type: CHANNEL_TYPE.TEXT,
      parentId: catWelcome.id,
      position: 2,
      topic: 'ตารางปล่อยเนื้อหา W1–W23 ทุกวันอังคาร/พฤหัสบดี เวลา 05:00 น. (ICT)',
      overwrites: publicReadOnlyOverwrites,
    },
    // Category 2: Free + Member
    {
      key: 'shallowForum',
      name: 'ทะเลน้ำตื้น-7-เกาะ',
      type: CHANNEL_TYPE.FORUM,
      parentId: catFree.id,
      position: 3,
      topic: '7 เกาะแห่งปัญญา (S.A.F.E. Series) — ทะเลเปิดอ่านฟรีทุกคน ชวนแลกเปลี่ยนใต้กระทู้แต่ละเกาะได้เลย',
      overwrites: freeForumOverwrites,
      availableTags: [
        { name: 'S.A.F.E. Series', emoji_name: '🏝️' },
        { name: 'Audio Podcast', emoji_name: '🎧' },
        { name: 'Free', emoji_name: '🌊' },
      ],
    },
    {
      key: 'deepSampleForum',
      name: 'ชิมลางทะเลน้ำลึก',
      type: CHANNEL_TYPE.FORUM,
      parentId: catFree.id,
      position: 4,
      topic: 'ทดลองอ่านฟรี บทที่ 1 ของหมู่เกาะ 1–7 ตามตารางเดินเรือ สำหรับสมาชิก Free และ Member',
      overwrites: freeForumOverwrites,
      availableTags: [
        { name: 'บทที่ 1 ทดลองอ่าน', emoji_name: '🧭' },
        { name: 'Free Tier', emoji_name: '⛵' },
      ],
    },
    {
      key: 'newsOpenForum',
      name: 'ข่าวสาร-west-asia',
      type: CHANNEL_TYPE.FORUM,
      parentId: catFree.id,
      position: 5,
      topic: 'รายงานข่าวสารสถานการณ์โลกและภูมิรัฐศาสตร์ West Asia สำหรับสมาชิก Free และ Member',
      overwrites: freeForumOverwrites,
      availableTags: [
        { name: 'West Asia', emoji_name: '🌍' },
        { name: 'ข่าวทั่วไป', emoji_name: '📰' },
      ],
    },
    {
      key: 'generalChat',
      name: 'เสวนาทั่วไป',
      type: CHANNEL_TYPE.TEXT,
      parentId: catFree.id,
      position: 6,
      topic: 'ห้องพูดคุยแลกเปลี่ยนสำหรับสมาชิกทุกคน (Free + Member + Founding 100)',
      overwrites: freeChatOverwrites,
    },
    // Category 3: Member + Founding 100
    {
      key: 'deepOceanForum',
      name: 'ทะเลน้ำลึก-10-หมู่เกาะ',
      type: CHANNEL_TYPE.FORUM,
      parentId: catMember.id,
      position: 7,
      topic: 'คลังปัญญาทะเลน้ำลึก 10 หมู่เกาะ 50 บท (เฉพาะสมาชิก Member และ Founding 100)',
      overwrites: memberForumOverwrites,
      availableTags: [
        { name: '1. Dunya', emoji_name: '🌌' },
        { name: '2. Haram', emoji_name: '🛡️' },
        { name: '3. Nafsu', emoji_name: '🔥' },
        { name: '4. Rizq', emoji_name: '🌿' },
        { name: '5. Hijab', emoji_name: '🕊️' },
        { name: '6. Hype', emoji_name: '⚡' },
        { name: '7. Fake Idol', emoji_name: '🪞' },
        { name: '8. Shirk', emoji_name: '🧭' },
        { name: '9. Shia Being', emoji_name: '📜' },
        { name: '10. Barzakh', emoji_name: '⏳' },
      ],
    },
    {
      key: 'newsDeepdiveForum',
      name: 'news-deepdive',
      type: CHANNEL_TYPE.FORUM,
      parentId: catMember.id,
      position: 8,
      topic: 'บทวิเคราะห์ข่าวเชิงลึก Deepdive สงวนสิทธิ์เฉพาะสมาชิก Member และ Founding 100',
      overwrites: memberForumOverwrites,
      availableTags: [
        { name: 'Deepdive', emoji_name: '🔎' },
        { name: 'วิเคราะห์เชิงลึก', emoji_name: '🧠' },
      ],
    },
    {
      key: 'sanctuaryChat',
      name: 'sanctuary-เสวนาเชิงลึก',
      type: CHANNEL_TYPE.TEXT,
      parentId: catMember.id,
      position: 9,
      topic: 'พื้นที่เสวนาเชิงลึกด้านตรรกวิทยา จิตวิทยา และเทววิทยาสำหรับสมาชิกผู้สนับสนุน',
      overwrites: memberChatOverwrites,
    },
    {
      key: 'voiceSanctuary',
      name: 'voice-sanctuary',
      type: CHANNEL_TYPE.VOICE,
      parentId: catMember.id,
      position: 10,
      overwrites: memberVoiceOverwrites,
    },
  ];

  const resolvedChannels = {};
  const forumTags = {};

  for (const spec of channelSpecs) {
    const ch = await ensureChannel(guildId, existingChannels, state, spec);
    resolvedChannels[spec.key] = ch.id;
    if (ch.type === CHANNEL_TYPE.FORUM && Array.isArray(ch.available_tags)) {
      forumTags[spec.key] = Object.fromEntries(
        ch.available_tags.map((t) => [t.name, t.id])
      );
    }
  }

  state.channels = resolvedChannels;
  state.forumTags = forumTags;

  // Point Community rules & system channels to our curated onboarding channels, then clean up starter defaults
  try {
    const refreshBranding = process.argv.includes('--refresh-branding');
    const logoDataUri = loadLogoDataUri();
    const guildPatch = {
      rules_channel_id: resolvedChannels.welcomeRules,
      system_channel_id: resolvedChannels.releaseSchedule,
    };
    if (logoDataUri && (!guild.icon || refreshBranding)) {
      guildPatch.icon = logoDataUri;
    }

    await discordApi(`/guilds/${guildId}`, {
      method: 'PATCH',
      body: guildPatch,
    });
    console.log('✅ ตั้งค่า #welcome-กติกา และโลโก้เซิร์ฟเวอร์เรียบร้อยแล้ว');
    await cleanupStarterPlaceholders(guildId, existingChannels, resolvedChannels);

    if (logoDataUri) {
      try {
        const botUser = await discordApi('/users/@me');
        if (!botUser.avatar || refreshBranding) {
          await discordApi('/users/@me', {
            method: 'PATCH',
            body: { avatar: logoDataUri },
          });
          console.log('✅ อัปโหลดรูปโปรไฟล์บอท Fitrah Shield Guardian เรียบร้อยแล้ว');
        }
      } catch (botErr) {
        console.warn('⚠️ ข้ามการอัปโหลดรูปโปรไฟล์บอท:', botErr.message);
      }
    }

    try {
      await discordApi(`/guilds/${guildId}/welcome-screen`, {
        method: 'PATCH',
        body: {
          enabled: true,
          description:
            'พื้นที่ปลอดภัยทางจิตวิญญาณ (Digital Sanctuary) • เชื่อมบัญชีเว็บไซต์รับยศ Free / Member / Founding 100 อัตโนมัติ',
          welcome_channels: [
            {
              channel_id: resolvedChannels.welcomeRules,
              description: 'อ่านกติกาพื้นที่ปลอดภัยและภาพรวมโครงการ',
              emoji_name: '🛡️',
            },
            {
              channel_id: resolvedChannels.verifyAccount,
              description: 'เชื่อมบัญชีเว็ปรับยศ Free / Member อัตโนมัติ',
              emoji_name: '⚓',
            },
            {
              channel_id: resolvedChannels.releaseSchedule,
              description: 'เช็กตารางเดินเรือปล่อยบทความ W1–W23',
              emoji_name: '🗓️',
            },
          ],
        },
      });
      console.log('✅ ตั้งค่า Discord Welcome Screen เรียบร้อยแล้ว');
    } catch (welcomeErr) {
      console.warn('⚠️ ไม่สามารถตั้งค่า Welcome Screen (อาจใช้ Onboarding อยู่):', welcomeErr.message);
    }
  } catch (err) {
    console.warn('⚠️ ไม่สามารถอัปเดต rules_channel_id/ลบห้องเริ่มต้นบางส่วนได้:', err.message);
  }

  // 3. Post/Update Onboarding Embeds
  console.log('\n📜 ขั้นตอนที่ 3/4: โพสต์การ์ดต้อนรับ, คู่มือเชื่อมบัญชี, และตารางเดินเรือ...');
  const infoMessages = { ...(state.infoMessages || {}) };

  infoMessages.welcomeRules = await upsertInfoMessage(
    resolvedChannels.welcomeRules,
    infoMessages.welcomeRules,
    {
      embeds: [
        {
          title: '🛡️ ยินดีต้อนรับสู่ THE FITRAH SHIELD • เกราะพิทักษ์ฟิฏเราะฮฺ',
          url: siteUrl,
          color: 0x0e5a3e,
          description:
            'พื้นที่ปลอดภัยทางจิตวิญญาณ (Digital Sanctuary) ที่ผสาน **ตรรกศาสตร์ • วิทยาศาสตร์ • จิตวิทยา • เทววิทยาอิสลาม**\n\n' +
            'เซิร์ฟเวอร์นี้ใช้ระบบ **การ์ดสรุป + ลิงก์อ่านฉบับเต็ม (Hybrid)** เพื่อให้คุณเสวนาใต้แต่ละบทเรียนได้สะดวกใน Discord และกลับไปใช้งาน **Dual-Mode (Easy / Deep)** พร้อมฟัง **Audio Podcast** บนเว็บไซต์หลักได้อย่างเต็มรูปแบบ',
          fields: [
            {
              name: '🧭 กติกาพื้นที่ปลอดภัย (Sanctuary Guidelines)',
              value:
                '1. **สื่อสารด้วยเหตุผลและเมตตาธรรม:** ถกเถียงที่แก่นความคิด เคารพศักดิ์ศรีของเพื่อนร่วมเดินทางทุกคน\n' +
                '2. **ไม่สแปมหรือโฆษณา:** รักษาความสงบของพื้นที่เรียนรู้\n' +
                '3. **เคารพลิขสิทธิ์ผู้สนับสนุน:** ไม่นำเนื้อหาหรือไฟล์เสียงจากห้อง Member ออกไปเผยแพร่สาธารณะ',
            },
            {
              name: '🎖️ โครงสร้างระดับสมาชิกบน Discord',
              value:
                `• <@&${roleIds.free}> — เข้าถึงทะเลน้ำตื้น 7 เกาะ, ชิมลางบทที่ 1 ทะเลน้ำลึก, ข่าว West Asia/ทั่วไป และเสวนาทั่วไป\n` +
                `• <@&${roleIds.member}> — ปลดล็อกทะเลน้ำลึก 10 หมู่เกาะ, ข่าว Deepdive, ห้องเสวนาเชิงลึก และห้องเสียง\n` +
                `• <@&${roleIds.founding100}> — ยศสีทองประดับเกียรติสำหรับผู้ร่วมสร้างรุ่นแรก (สิทธิ์เข้าถึงห้องเทียบเท่า Member + สิทธิ์ Early Access ครบ 50 บทบนเว็บไซต์)`,
            },
          ],
          footer: { text: 'The Fitrah Shield • Safe Soul Project' },
        },
      ],
    }
  );
  await sleep(400);

  infoMessages.verifyAccount = await upsertInfoMessage(
    resolvedChannels.verifyAccount,
    infoMessages.verifyAccount,
    {
      embeds: [
        {
          title: '⚓ วิธีเชื่อมบัญชีเว็บไซต์เพื่อรับยศสมาชิก Discord',
          url: `${siteUrl}/login`,
          color: 0xd9a94f,
          description:
            'สิทธิ์ในเซิร์ฟเวอร์ Discord เชื่อมโยงกับสถานะสมาชิกของคุณบนเว็บไซต์ **The Fitrah Shield**:\n\n' +
            `• **สมัครสมาชิกฟรี (Free Tier):** [เข้าสู่ระบบ / สมัครสมาชิก](${siteUrl}/login) → รับยศ <@&${roleIds.free}>\n` +
            `• **สมาชิกรายเดือน/รายปี (Supporter):** [ดูแพ็กเกจเรือประมงน้ำลึก](${siteUrl}/pricing) → รับยศ <@&${roleIds.member}>\n` +
            `• **สมาชิกตลอดชีพ (Founding 100):** [ร่วมเป็น Founding 100](${siteUrl}/pricing) → รับยศ <@&${roleIds.member}> + ยศสีทอง <@&${roleIds.founding100}>`,
          fields: [
            {
              name: '🔗 ขั้นตอนรับยศอัตโนมัติใน 1 คลิก',
              value:
                `1. เข้าสู่ระบบสมาชิกของคุณที่ [หน้าบัตรสมาชิก (${siteUrl}/login)](${siteUrl}/login)\n` +
                '2. กดปุ่ม **"เชื่อมต่อ Discord & รับยศอัตโนมัติ"** ในการ์ด Discord Sanctuary\n' +
                '3. เมื่อแอดมินอนุมัติสลิปหรืออัปเกรดระดับเรือ ระบบจะอัปเดตยศ `Member` / `Founding 100` สีทองให้คุณอัตโนมัติทันที',
            },
          ],
          footer: { text: siteUrl },
        },
      ],
    }
  );
  await sleep(400);

  infoMessages.releaseSchedule = await upsertInfoMessage(
    resolvedChannels.releaseSchedule,
    infoMessages.releaseSchedule,
    {
      embeds: [
        {
          title: '🗓️ ประกาศตารางเดินเรือ (Official Release Schedule W1–W23)',
          url: `${siteUrl}/ocean`,
          color: 0x22d3ee,
          description:
            'เนื้อหาทั้งหมดบน Discord จะทยอยเปิดเผยตามตารางเวลา **05:00 น. (เวลาประเทศไทย +07:00)** เพื่อรักษาจังหวะการใคร่ครวญร่วมกันของชุมชน:',
          fields: [
            {
              name: '🌊 W1 (19 พ.ย. 2026)',
              value: 'ทะเลน้ำตื้น 7 เกาะ (S.A.F.E. Series) เปิดอ่านฟรีครบทุกเกาะ',
              inline: false,
            },
            {
              name: '🧭 W2 – W12 (24 พ.ย. 2026 – 4 ก.พ. 2027)',
              value: 'ทะเลน้ำลึกหมู่เกาะ 1–5 (Dunya, Haram, Nafsu, Rizq, Hijab) • ออกทุกวันอังคาร & พฤหัสบดี 05:00 น.',
              inline: false,
            },
            {
              name: '🌌 W13 – W23 (9 ก.พ. 2027 – 22 เม.ย. 2027)',
              value: 'ทะเลน้ำลึกหมู่เกาะ 6–10 (Hype, Fake Idol, Shirk, Shia Being, Barzakh) • ออกทุกวันอังคาร & พฤหัสบดี 05:00 น.',
              inline: false,
            },
            {
              name: '👑 สิทธิพิเศษ Founding 100 บนเว็บไซต์',
              value: `สมาชิก Founding 100 สามารถอ่านล่วงหน้าครบทั้ง 50 บทได้ทันทีบน [หน้าเว็บไซต์หลัก](${siteUrl}/ocean)`,
              inline: false,
            },
          ],
          footer: { text: 'The Fitrah Shield • เกราะพิทักษ์ฟิฏเราะฮฺ' },
        },
      ],
    }
  );

  state.infoMessages = infoMessages;

  // Create or reuse permanent non-expiring server invite link
  if (!state.inviteUrl) {
    try {
      const invite = await discordApi(`/channels/${resolvedChannels.welcomeRules}/invites`, {
        method: 'POST',
        body: {
          max_age: 0,
          max_uses: 0,
          temporary: false,
          unique: false,
        },
      });
      if (invite?.code) {
        state.inviteUrl = `https://discord.gg/${invite.code}`;
        console.log(`✅ สร้างลิงก์เชิญถาวรสำเร็จ: ${state.inviteUrl}`);
      }
    } catch (err) {
      console.warn('⚠️ ไม่สามารถสร้างลิงก์เชิญถาวรได้:', err.message);
    }
  } else {
    console.log(`🔗 ใช้ลิงก์เชิญถาวรเดิม: ${state.inviteUrl}`);
  }

  saveDiscordState(state);

  // 4. Persist Role IDs & Invite URL to .env.local
  console.log('\n🔐 ขั้นตอนที่ 4/4: บันทึก Role IDs ลง data/discord_state.json และ .env.local...');
  upsertEnvLocal({
    DISCORD_ROLE_FREE: roleIds.free,
    DISCORD_ROLE_MEMBER: roleIds.member,
    DISCORD_ROLE_FOUNDING_100: roleIds.founding100,
    DISCORD_ROLE_TIER2_SUPPORTER: roleIds.member,
    DISCORD_ROLE_TIER3_FOUNDING: roleIds.founding100,
    ...(state.inviteUrl ? { NEXT_PUBLIC_DISCORD_INVITE_URL: state.inviteUrl } : {}),
  });

  const finalRoles = await discordApi(`/guilds/${guildId}/roles`);
  const botRole = finalRoles.find((r) => r.managed && r.name === 'Fitrah Shield Guardian');
  const maxUserRolePos = Math.max(
    ...['Free', 'Member', 'Founding 100'].map(
      (n) => finalRoles.find((r) => r.name === n)?.position || 0
    )
  );
  if (botRole && botRole.position <= maxUserRolePos) {
    console.warn(
      `⚠️ คำเตือนลำดับ Role: บอท (${botRole.position}) ไม่ได้อยู่เหนือ Role สมาชิก (${maxUserRolePos}) — กรุณาเลื่อน Role "Fitrah Shield Guardian" ขึ้นบนสุดในการตั้งค่าเซิร์ฟเวอร์`
    );
  } else {
    console.log(
      `✅ ลำดับ Role ถูกต้อง: Fitrah Shield Guardian (pos ${botRole?.position}) อยู่เหนือยศสมาชิกทั้งหมด (max pos ${maxUserRolePos})`
    );
  }

  console.log('\n🎉 ตั้งค่าโครงสร้าง Discord Server สำเร็จครบทุกขั้นตอน!');
}

main().catch((err) => {
  console.error('❌ Discord Setup ล้มเหลว:', err?.message || err);
  process.exit(1);
});

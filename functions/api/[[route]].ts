import { getEbookEmailTemplateForTier } from '../../src/lib/emailTemplates';
import { getEffectiveMemberTier } from '../../src/lib/oceanAccess';
import { aggregateAnalyticsEvents } from '../../src/lib/analyticsAggregator';
import { Member, TierType, PaymentStatus } from '../../src/types';

interface Env {
  DB: any;
  MEDIA_BUCKET: any;
  ASSETS: any;
  EASYSLIP_API_KEY?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  GEMINI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;
  DISCORD_BOT_TOKEN?: string;
  DISCORD_GUILD_ID?: string;
  DISCORD_ROLE_FREE?: string;
  DISCORD_ROLE_MEMBER?: string;
  DISCORD_ROLE_FOUNDING_100?: string;
}

async function fetchGoogleDriveTextEdge(rawUrl: string): Promise<{ ok: boolean; text: string; sourceType: string }> {
  try {
    const docMatch = rawUrl.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch) {
      const res = await fetch(`https://docs.google.com/document/d/${docMatch[1]}/export?format=txt`);
      if (res.ok) {
        return { ok: true, text: (await res.text()).slice(0, 15000), sourceType: 'Google Docs' };
      }
    }
    const sheetMatch = rawUrl.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheetMatch) {
      const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=csv`);
      if (res.ok) {
        return { ok: true, text: (await res.text()).slice(0, 15000), sourceType: 'Google Sheets (CSV)' };
      }
    }
    const driveMatch =
      rawUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const res = await fetch(`https://drive.google.com/uc?export=download&id=${driveMatch[1]}`);
      if (res.ok) {
        return { ok: true, text: (await res.text()).slice(0, 15000), sourceType: 'Google Drive File' };
      }
    }
    return {
      ok: false,
      text: 'ไม่สามารถดึงไฟล์ได้ กรุณาตรวจสอบว่าตั้งค่าแชร์ไฟล์ใน Google Drive เป็น "ทุกคนที่มีลิงก์อ่านได้"',
      sourceType: 'Unknown',
    };
  } catch (err: any) {
    return { ok: false, text: `เกิดข้อผิดพลาดในการดึงลิงก์: ${err?.message || 'Error'}`, sourceType: 'Error' };
  }
}

async function callGeminiEdge(
  apiKey: string,
  preferredModel: string,
  systemInstruction: string,
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
) {
  const modelsToTry = Array.from(
    new Set([
      preferredModel || 'gemini-3.8-flash',
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemma-4-31b-it',
    ])
  );
  let lastError = '';
  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
        }),
      });
      const data: any = await res.json();
      if (res.ok && data?.candidates?.[0]?.content?.parts) {
        const reply = data.candidates[0].content.parts.map((p: any) => p.text || '').join('');
        return { ok: true, reply, modelUsed: model };
      }
      lastError = data?.error?.message || `HTTP ${res.status}`;
      if (res.status === 400 && lastError.toLowerCase().includes('api key not valid')) break;
    } catch (err: any) {
      lastError = err?.message || 'Network error';
    }
  }
  return { ok: false, error: lastError || 'ไม่สามารถเชื่อมต่อ Gemini API ได้' };
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendResendNotification(
  env: Env,
  params: {
    to: string[];
    fallbackTo?: string[];
    replyTo?: string;
    subject: string;
    html: string;
    text?: string;
  }
): Promise<{ sent: boolean; via: string; error?: string }> {
  if (!env.RESEND_API_KEY) {
    return { sent: false, via: 'none', error: 'RESEND_API_KEY not configured' };
  }
  const primaryFrom = env.EMAIL_FROM || 'The Fitrah Shield <sanctuary@hardynaipayong.cloud>';
  try {
    const primaryRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: primaryFrom,
        to: params.to,
        reply_to: params.replyTo,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });
    if (primaryRes.ok) {
      return { sent: true, via: primaryFrom };
    }
    // Automatic fallback when custom domain is not yet verified in Resend
    const fallbackRecipients = params.fallbackTo && params.fallbackTo.length > 0
      ? params.fallbackTo
      : ['n.ahamadchula@gmail.com'];
    const fbRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'The Fitrah Shield <onboarding@resend.dev>',
        to: fallbackRecipients,
        reply_to: params.replyTo,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });
    if (fbRes.ok) {
      return { sent: true, via: 'onboarding@resend.dev' };
    }
    const errText = await fbRes.text();
    return { sent: false, via: 'resend_error', error: errText };
  } catch (err: any) {
    return { sent: false, via: 'exception', error: err?.message || 'Resend fetch failed' };
  }
}

const CAPTAIN_RECEIVER_KEYWORDS = ['นรฤทธิ์', 'norrarit', 'อะหมัด', 'ahamad'];
const CAPTAIN_RECEIVER_SUFFIXES = ['3702', '5912', '5922', '5937'];

interface EasySlipCheckResult {
  verified: boolean;
  hardReject?: boolean;
  mode: 'easyslip_auto' | 'manual_fallback' | 'rejected';
  transRef?: string;
  slipAmount?: number;
  receiverAccount?: string;
  slipDate?: string;
  slipData?: any;
  error?: string;
}

async function verifyEasySlipEdge(
  env: Env,
  imageBase64: string,
  expectedAmount: number,
  currentMemberId?: string
): Promise<EasySlipCheckResult> {
  if (!imageBase64) {
    return { verified: false, hardReject: true, mode: 'rejected', error: 'กรุณาแนบไฟล์รูปสลิปโอนเงิน' };
  }
  const token = env.EASYSLIP_API_KEY;
  if (!token) {
    return { verified: false, mode: 'manual_fallback' };
  }

  try {
    const rawBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const verifyRes = await fetch('https://developer.easyslip.com/api/v1/verify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: rawBase64 }),
    });

    // If EasySlip API itself has a 5xx outage, gracefully fall back to manual admin review
    if (verifyRes.status >= 500) {
      return { verified: false, mode: 'manual_fallback' };
    }

    const verifyData: any = await verifyRes.json().catch(() => ({}));
    if (!verifyRes.ok || verifyData.status !== 200 || !verifyData.data) {
      const msg = String(verifyData?.message || '').toLowerCase();
      if (msg.includes('quota') || msg.includes('limit') || msg.includes('unauthorized')) {
        return { verified: false, mode: 'manual_fallback' };
      }
      return {
        verified: false,
        hardReject: true,
        mode: 'rejected',
        error: 'ไม่สามารถอ่านข้อมูล QR Code จากสลิปนี้ได้ กรุณาอัปโหลดรูปสลิปต้นฉบับจากแอปธนาคารที่มี QR ชัดเจน',
      };
    }

    const d = verifyData.data;
    const slipAmount = Number(d?.amount?.amount || 0);
    const transRef = String(d?.transRef || '').trim();
    const slipDate = String(d?.date || '').trim();

    if (expectedAmount > 0 && slipAmount < expectedAmount) {
      return {
        verified: false,
        hardReject: true,
        mode: 'rejected',
        error: `ยอดเงินในสลิป (฿${slipAmount.toLocaleString()}) น้อยกว่ายอดที่ต้องชำระ (฿${expectedAmount.toLocaleString()}) กรุณาตรวจสอบยอดโอนอีกครั้ง`,
      };
    }

    // Verify receiver belongs to Captain_Hadee / The Fitrah Shield (MAKE by KBank / PromptPay)
    const receiverNameTh = String(d?.receiver?.account?.name?.th || '').toLowerCase();
    const receiverNameEn = String(d?.receiver?.account?.name?.en || '').toLowerCase();
    const receiverBankAcc = String(d?.receiver?.account?.bank?.account || '').replace(/[^0-9]/g, '');
    const receiverProxyAcc = String(d?.receiver?.account?.proxy?.account || '').replace(/[^0-9]/g, '');
    const receiverAccountLabel =
      String(d?.receiver?.account?.proxy?.account || d?.receiver?.account?.bank?.account || '').trim();

    const hasReceiverInfo = Boolean(receiverNameTh || receiverNameEn || receiverBankAcc || receiverProxyAcc);
    if (hasReceiverInfo) {
      const nameMatches = CAPTAIN_RECEIVER_KEYWORDS.some(
        (kw) => receiverNameTh.includes(kw) || receiverNameEn.includes(kw)
      );
      const suffixMatches = CAPTAIN_RECEIVER_SUFFIXES.some(
        (suf) => receiverBankAcc.endsWith(suf) || receiverProxyAcc.endsWith(suf)
      );
      if (!nameMatches && !suffixMatches) {
        return {
          verified: false,
          hardReject: true,
          mode: 'rejected',
          error:
            'ชื่อบัญชีหรือปลายทางผู้รับเงินในสลิปไม่ตรงกับบัญชีทางการของ The Fitrah Shield (นาย นรฤทธิ์ อหะหมัดจุฬา) กรุณาสแกน QR ของทางเว็บไซต์เท่านั้น',
        };
      }
    }

    // Prevent duplicate slip reuse across accounts
    if (transRef && env.DB) {
      try {
        await env.DB.prepare(
          'CREATE TABLE IF NOT EXISTS verified_slips (trans_ref TEXT PRIMARY KEY, member_id TEXT, amount REAL, receiver_account TEXT, verified_at TEXT NOT NULL)'
        ).run();
        const dup = await env.DB.prepare('SELECT trans_ref, member_id FROM verified_slips WHERE trans_ref = ?')
          .bind(transRef)
          .first();
        if (dup && (!currentMemberId || dup.member_id !== currentMemberId)) {
          return {
            verified: false,
            hardReject: true,
            mode: 'rejected',
            error: `สลิปนี้ (Ref: ${transRef}) ถูกใช้งานยืนยันสิทธิ์ไปแล้ว ไม่สามารถใช้ซ้ำได้`,
          };
        }
      } catch (e) {
        console.error('Duplicate slip check warning:', e);
      }
    }

    return {
      verified: true,
      mode: 'easyslip_auto',
      transRef,
      slipAmount,
      receiverAccount: receiverAccountLabel,
      slipDate,
      slipData: d,
    };
  } catch (err) {
    console.error('verifyEasySlipEdge network error:', err);
    return { verified: false, mode: 'manual_fallback' };
  }
}

async function recordVerifiedSlipEdge(
  env: Env,
  transRef: string | undefined,
  memberId: string,
  amount: number,
  receiverAccount: string | undefined
) {
  if (!transRef || !env.DB) return;
  try {
    await env.DB.prepare(
      'CREATE TABLE IF NOT EXISTS verified_slips (trans_ref TEXT PRIMARY KEY, member_id TEXT, amount REAL, receiver_account TEXT, verified_at TEXT NOT NULL)'
    ).run();
    await env.DB.prepare(
      'INSERT OR REPLACE INTO verified_slips (trans_ref, member_id, amount, receiver_account, verified_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(transRef, memberId, amount, receiverAccount || '', new Date().toISOString())
      .run();
  } catch (e) {
    console.error('recordVerifiedSlipEdge warning:', e);
  }
}

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx !== -1) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        out[k] = v;
      }
    }
  }
  return out;
}

function rowToMember(r: any): Member {
  return {
    id: r.id,
    memberNumber: Number(r.member_number),
    username: r.username,
    email: r.email,
    phone: r.phone || '',
    password: r.password,
    name: r.name,
    tier: (r.tier || 'free_tier_1') as TierType,
    role: r.role || (Number(r.member_number) === 1 ? 'admin' : 'member'),
    paymentStatus: (r.payment_status || 'free') as PaymentStatus,
    paymentSlipUrl: r.payment_slip_url || undefined,
    paymentAmount: Number(r.payment_amount || 0),
    billingCycle: r.billing_cycle || 'free',
    ebookClaimed: Boolean(r.ebook_claimed),
    ebookClaimedAt: r.ebook_claimed_at || undefined,
    discordUserId: r.discord_user_id || undefined,
    discordUsername: r.discord_username || undefined,
    discordLinkedAt: r.discord_linked_at || undefined,
    notes: r.notes || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at || undefined,
  };
}

function buildMemberCookie(safeMember: Omit<Member, 'password'>): string {
  return `safesoul_member=${encodeURIComponent(JSON.stringify(safeMember))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function resolveDiscordRolesForMember(
  env: Env,
  member: Member
): { desiredRoles: string[]; managedRoles: string[] } {
  const freeRole = env.DISCORD_ROLE_FREE;
  const memberRole = env.DISCORD_ROLE_MEMBER;
  const foundingRole = env.DISCORD_ROLE_FOUNDING_100;
  const managedRoles = Array.from(
    new Set([freeRole, memberRole, foundingRole].filter(Boolean) as string[])
  );

  const { effectiveTier } = getEffectiveMemberTier(member);
  let desired: (string | undefined)[] = [];
  if (effectiveTier === 'founding_tier_3') {
    desired = [memberRole, foundingRole];
  } else if (effectiveTier === 'supporter_tier_2') {
    desired = [memberRole];
  } else {
    desired = [freeRole];
  }

  return {
    desiredRoles: Array.from(new Set(desired.filter(Boolean) as string[])),
    managedRoles,
  };
}

async function syncDiscordMemberRolesEdge(
  env: Env,
  member: Member,
  oauthAccessToken?: string
): Promise<{
  ok: boolean;
  joinedServer: boolean;
  assignedRoles: string[];
  error?: string;
}> {
  const botToken = env.DISCORD_BOT_TOKEN;
  const guildId = env.DISCORD_GUILD_ID;
  const discordUserId = member.discordUserId;

  if (!botToken || !guildId || !discordUserId) {
    return {
      ok: false,
      joinedServer: false,
      assignedRoles: [],
      error: 'Missing Discord Bot credentials or linked Discord User ID',
    };
  }

  const { desiredRoles, managedRoles } = resolveDiscordRolesForMember(env, member);
  const botHeaders = {
    Authorization: `Bot ${botToken}`,
    'Content-Type': 'application/json',
  };

  let joinedServer = false;

  try {
    if (oauthAccessToken) {
      const joinRes = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
        {
          method: 'PUT',
          headers: botHeaders,
          body: JSON.stringify({
            access_token: oauthAccessToken,
            roles: desiredRoles,
          }),
        }
      );

      if (joinRes.status === 201) {
        return {
          ok: true,
          joinedServer: true,
          assignedRoles: desiredRoles,
        };
      }

      if (!joinRes.ok && joinRes.status !== 204) {
        const errText = await joinRes.text();
        return {
          ok: false,
          joinedServer: false,
          assignedRoles: [],
          error: `Discord guild join failed (${joinRes.status}): ${errText}`,
        };
      }
      joinedServer = true;
    }

    for (const roleId of desiredRoles) {
      const addRes = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
        {
          method: 'PUT',
          headers: botHeaders,
        }
      );
      if (!addRes.ok && addRes.status !== 204) {
        const errText = await addRes.text();
        return {
          ok: false,
          joinedServer,
          assignedRoles: [],
          error: `Discord add role failed (${addRes.status}): ${errText}`,
        };
      }
    }

    const desiredSet = new Set(desiredRoles);
    for (const staleRoleId of managedRoles) {
      if (desiredSet.has(staleRoleId)) continue;
      await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${staleRoleId}`,
        {
          method: 'DELETE',
          headers: botHeaders,
        }
      );
    }

    return {
      ok: true,
      joinedServer,
      assignedRoles: desiredRoles,
    };
  } catch (err: any) {
    return {
      ok: false,
      joinedServer,
      assignedRoles: [],
      error: err?.message || 'Discord role sync error',
    };
  }
}

async function getAuthenticatedD1Member(request: Request, env: Env): Promise<Member | null> {
  const cookies = parseCookies(request.headers.get('Cookie'));
  if (!cookies.safesoul_member || !env.DB) return null;
  let parsed: any = null;
  try {
    parsed = JSON.parse(cookies.safesoul_member);
  } catch {
    return null;
  }
  if (!parsed?.id) return null;
  const row = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(parsed.id).first();
  return row ? rowToMember(row) : null;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

let cachedNewsIndex: { subcategories: string[]; total: number; items: any[] } | null = null;
let cachedNewsIndexAt = 0;
const cachedNewsShards: Record<number, { at: number; data: Record<string, any> }> = {};
const NEWS_CACHE_TTL_MS = 60_000;

async function loadNewsIndex(env: Env, requestUrl: string) {
  const now = Date.now();
  if (cachedNewsIndex && now - cachedNewsIndexAt < NEWS_CACHE_TTL_MS) {
    return cachedNewsIndex;
  }
  if (env.MEDIA_BUCKET) {
    const obj = await env.MEDIA_BUCKET.get('news/news-index.json');
    if (obj) {
      cachedNewsIndex = await obj.json();
      cachedNewsIndexAt = now;
      return cachedNewsIndex!;
    }
  }
  const assetRes = await env.ASSETS.fetch(new URL('/api-data/news-index.json', requestUrl));
  if (assetRes.ok) {
    cachedNewsIndex = await assetRes.json();
    cachedNewsIndexAt = now;
    return cachedNewsIndex!;
  }
  return { subcategories: ['ทั่วไป', 'Deepdive', 'West Asia'], total: 0, items: [] };
}

async function loadNewsShard(env: Env, shardIndex: number): Promise<Record<string, any>> {
  const now = Date.now();
  const cached = cachedNewsShards[shardIndex];
  if (cached && now - cached.at < NEWS_CACHE_TTL_MS) {
    return cached.data;
  }
  if (env.MEDIA_BUCKET) {
    const obj = await env.MEDIA_BUCKET.get(`news/news-shard-${shardIndex}.json`);
    if (obj) {
      const shardData = await obj.json();
      cachedNewsShards[shardIndex] = { at: now, data: shardData };
      return shardData;
    }
  }
  return {};
}

export const onRequest = async (context: {
  request: Request;
  env: Env;
  params: { route?: string[] };
}) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const method = request.method.toUpperCase();

  try {
    // -----------------------------------------------------------------------
    // 1. /api/ocean & /api/oneshot (Static JSON + D1 article_overrides)
    // -----------------------------------------------------------------------
    if (path === '/api/ocean' && method === 'GET') {
      const assetRes = await env.ASSETS.fetch(new URL('/api-data/ocean.json', request.url));
      const baseData = await assetRes.json();
      let overrides: Record<string, any> = {};
      if (env.DB) {
        const { results } = await env.DB.prepare('SELECT * FROM article_overrides').all();
        for (const row of results || []) {
          overrides[row.key] = row;
        }
      }
      if (Array.isArray(baseData.items)) {
        baseData.items = baseData.items.map((arch: any) => ({
          ...arch,
          subIslands: (arch.subIslands || []).map((sub: any) => {
            const ov = overrides[`${arch.slug}-${sub.chapterNumber}`];
            if (!ov) return sub;
            return {
              ...sub,
              title: ov.title || sub.title,
              excerpt: ov.excerpt || sub.excerpt,
              content: ov.content || sub.content,
              status: ov.status || sub.status,
              publishedAt: ov.published_at || sub.publishedAt,
              isUnlocked: ov.is_unlocked !== null && ov.is_unlocked !== undefined ? Boolean(ov.is_unlocked) : sub.isUnlocked,
              coverImage: ov.cover_image || sub.coverImage,
              audioUrl: ov.audio_url || sub.audioUrl,
            };
          }),
        }));
      }
      return jsonResponse(baseData);
    }

    if (path === '/api/oneshot' && method === 'GET') {
      const assetRes = await env.ASSETS.fetch(new URL('/api-data/oneshot.json', request.url));
      const baseData = await assetRes.json();
      return jsonResponse(baseData);
    }

    // -----------------------------------------------------------------------
    // 1.5 /api/news & /api/news/:id (Cloudflare R2 Sharded News Engine)
    // -----------------------------------------------------------------------
    if (path === '/api/news' && method === 'GET') {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
      const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '48', 10)));
      const search = (url.searchParams.get('search') || '').trim().toLowerCase();
      const subcategory = (url.searchParams.get('subcategory') || '').trim();
      const sortBy = (url.searchParams.get('sortBy') || 'latest').trim();

      const indexData = await loadNewsIndex(env, request.url);
      let items = indexData.items || [];

      if (subcategory && subcategory !== 'all') {
        items = items.filter((item: any) => item.subcategory === subcategory);
      }

      if (search) {
        items = items.filter(
          (item: any) =>
            (item.title || '').toLowerCase().includes(search) ||
            (item.topicLead || '').toLowerCase().includes(search) ||
            (item.korNo || '').toLowerCase().includes(search) ||
            (item.dateFormatted || '').toLowerCase().includes(search) ||
            (item.dateShort || '').toLowerCase().includes(search) ||
            (item.excerpt || '').toLowerCase().includes(search)
        );
      }

      if (sortBy === 'oldest') {
        items = [...items].sort((a: any, b: any) => (a.dateTimestamp || 0) - (b.dateTimestamp || 0));
      } else {
        items = [...items].sort((a: any, b: any) => (b.dateTimestamp || 0) - (a.dateTimestamp || 0));
      }

      const total = items.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedItems = items.slice(startIndex, startIndex + limit).map((item: any) => ({
        ...item,
        sections: item.sections || [
          {
            index: 1,
            content: item.excerpt || item.topicLead || '',
            image: item.image || '',
          },
        ],
      }));

      return jsonResponse({
        items: paginatedItems,
        total,
        totalPages,
        page,
        subcategories: indexData.subcategories || ['ทั่วไป', 'Deepdive', 'West Asia'],
      });
    }

    if (path.startsWith('/api/news/') && method === 'GET') {
      const targetSlug = decodeURIComponent(path.slice('/api/news/'.length)).trim().toLowerCase();
      const indexData = await loadNewsIndex(env, request.url);
      const items = indexData.items || [];
      const idx = items.findIndex(
        (item: any) =>
          (item.id || '').toLowerCase() === targetSlug ||
          (item.slug || '').toLowerCase() === targetSlug ||
          (item.korNo || '').toLowerCase() === targetSlug
      );

      if (idx === -1) {
        return jsonResponse({ success: false, error: 'ไม่พบบทความข่าวที่คุณค้นหา' }, 404);
      }

      const indexItem = items[idx];
      const shardData = await loadNewsShard(env, Number(indexItem.shard || 0));
      const fullArticle =
        shardData[indexItem.id] ||
        shardData[indexItem.slug] ||
        shardData[targetSlug] || {
          ...indexItem,
          sections: [
            {
              index: 1,
              content: indexItem.excerpt || indexItem.topicLead || '',
              image: indexItem.image || '',
            },
          ],
        };

      const prev = idx > 0 ? items[idx - 1] : null;
      const next = idx < items.length - 1 ? items[idx + 1] : null;

      return jsonResponse({
        success: true,
        news: fullArticle,
        prev,
        next,
      });
    }

    // -----------------------------------------------------------------------
    // 2. /api/auth/me, /api/auth/login, /api/auth/logout, /api/auth/register, /api/auth/upgrade
    // -----------------------------------------------------------------------
    if (path === '/api/auth/me' && method === 'GET') {
      const cookies = parseCookies(request.headers.get('Cookie'));
      if (!cookies.safesoul_member) {
        return jsonResponse({ authenticated: false, member: null });
      }
      let parsed: any = null;
      try {
        parsed = JSON.parse(cookies.safesoul_member);
      } catch {
        return jsonResponse({ authenticated: false, member: null });
      }
      if (env.DB && parsed?.id) {
        const row = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(parsed.id).first();
        if (row) {
          const { password: _, ...safe } = rowToMember(row);
          return jsonResponse({ authenticated: true, member: safe });
        }
      }
      return jsonResponse({ authenticated: true, member: parsed });
    }

    if (path === '/api/auth/logout' && method === 'POST') {
      return jsonResponse(
        { success: true },
        200,
        {
          'Set-Cookie': 'safesoul_member=; Path=/; Max-Age=0; SameSite=Lax',
        }
      );
    }

    if (path === '/api/auth/login' && method === 'POST') {
      const body: any = await request.json();
      const target = String(body.username || body.email || '').trim().toLowerCase();
      const pass = String(body.password || '').trim();
      const row = await env.DB.prepare(
        'SELECT * FROM members WHERE LOWER(username) = ? OR LOWER(email) = ?'
      )
        .bind(target, target)
        .first();
      if (!row || row.password !== pass) {
        return jsonResponse({ success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, 401);
      }
      const { password: _, ...safe } = rowToMember(row);
      return jsonResponse(
        { success: true, member: safe },
        200,
        {
          'Set-Cookie': `safesoul_member=${encodeURIComponent(JSON.stringify(safe))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
        }
      );
    }

    if (path === '/api/auth/register' && method === 'POST') {
      const body: any = await request.json();
      const username = String(body.username || '').trim();
      const email = String(body.email || '').trim();
      const phone = String(body.phone || '').trim();
      const password = String(body.password || '').trim();
      const name = String(body.name || username).trim();
      const tier: TierType = body.tier || 'free_tier_1';

      if (!username || !email || !password) {
        return jsonResponse({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, 400);
      }

      const existing = await env.DB.prepare(
        'SELECT id FROM members WHERE LOWER(username) = ? OR LOWER(email) = ?'
      )
        .bind(username.toLowerCase(), email.toLowerCase())
        .first();
      if (existing) {
        return jsonResponse({ success: false, error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว' }, 400);
      }

      const billingCycle =
        body.billingCycle || (tier === 'founding_tier_3' ? 'lifetime' : tier === 'supporter_tier_2' ? 'monthly' : 'free');
      const paymentAmount =
        body.paymentAmount ??
        (tier === 'founding_tier_3'
          ? 3990
          : tier === 'supporter_tier_2'
          ? billingCycle === 'yearly'
            ? 1990
            : 199
          : 0);

      let paymentStatus: PaymentStatus = tier === 'free_tier_1' ? 'free' : 'pending_verification';
      let verificationNotes = '';
      let verifiedTransRef: string | undefined;
      let verifiedReceiverAcc: string | undefined;

      // Automatically verify payment slip via EasySlip API for paid tiers!
      if (tier !== 'free_tier_1') {
        if (!body.paymentSlipDataUrl) {
          return jsonResponse(
            { success: false, error: 'กรุณาแนบไฟล์รูปสลิปโอนเงินสำหรับระดับสมาชิกที่เลือก' },
            400
          );
        }
        const slipCheck = await verifyEasySlipEdge(env, body.paymentSlipDataUrl, Number(paymentAmount));
        if (slipCheck.hardReject) {
          return jsonResponse({ success: false, error: slipCheck.error }, 400);
        }
        if (slipCheck.verified) {
          paymentStatus = 'verified';
          verifiedTransRef = slipCheck.transRef;
          verifiedReceiverAcc = slipCheck.receiverAccount;
          verificationNotes = `ตรวจสอบสลิปอัตโนมัติผ่าน EasySlip สำเร็จ • Ref: ${slipCheck.transRef || '-'} • ยอด ฿${slipCheck.slipAmount ?? paymentAmount}`;
        }
      }

      const maxRow = await env.DB.prepare('SELECT MAX(member_number) as max_num FROM members').first();
      const nextNum = (Number(maxRow?.max_num) || 0) + 1;
      const id = `mem_${String(nextNum).padStart(3, '0')}`;
      const now = new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO members (id, member_number, username, email, phone, password, name, tier, role, payment_status, payment_slip_url, payment_amount, billing_cycle, ebook_claimed, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'member', ?, ?, ?, ?, 0, ?, ?)`
      )
        .bind(
          id,
          nextNum,
          username,
          email,
          phone,
          password,
          name,
          tier,
          paymentStatus,
          body.paymentSlipDataUrl || null,
          paymentAmount,
          billingCycle,
          verificationNotes || null,
          now
        )
        .run();

      if (paymentStatus === 'verified' && verifiedTransRef) {
        await recordVerifiedSlipEdge(env, verifiedTransRef, id, Number(paymentAmount), verifiedReceiverAcc);
      }

      const created = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(id).first();
      const { password: _, ...safe } = rowToMember(created);
      return jsonResponse(
        {
          success: true,
          verified: paymentStatus === 'verified',
          member: safe,
          message:
            paymentStatus === 'verified'
              ? `ตรวจสอบสลิปผ่าน EasySlip สำเร็จ! เปิดใช้งานสิทธิ์ Member #${nextNum} อัตโนมัติทันที`
              : `ลงทะเบียน Member #${nextNum} สำเร็จ`,
        },
        200,
        {
          'Set-Cookie': `safesoul_member=${encodeURIComponent(JSON.stringify(safe))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
        }
      );
    }

    if ((path === '/api/auth/upgrade' && method === 'POST') || (path === '/api/auth/me' && method === 'PATCH')) {
      const body: any = await request.json();
      const cookies = parseCookies(request.headers.get('Cookie'));
      const sessionMember = cookies.safesoul_member ? JSON.parse(cookies.safesoul_member) : null;
      const memberId = body.memberId || sessionMember?.id;
      if (!memberId) {
        return jsonResponse({ success: false, error: 'กรุณาเข้าสู่ระบบก่อนอัปเกรด' }, 401);
      }

      const targetTier: TierType = body.tier || 'supporter_tier_2';
      const targetBillingCycle =
        body.billingCycle || (targetTier === 'founding_tier_3' ? 'lifetime' : 'monthly');
      const targetAmount = Number(
        body.paymentAmount ??
          (targetTier === 'founding_tier_3' ? 3990 : targetBillingCycle === 'yearly' ? 1990 : 199)
      );

      let paymentStatus: PaymentStatus = targetTier === 'free_tier_1' ? 'free' : 'pending_verification';
      let verificationNotes: string | null = null;
      let verifiedTransRef: string | undefined;
      let verifiedReceiverAcc: string | undefined;

      if (targetTier !== 'free_tier_1') {
        if (!body.paymentSlipDataUrl) {
          return jsonResponse(
            { success: false, error: 'กรุณาแนบไฟล์รูปสลิปโอนเงินเพื่อยืนยันการอัปเกรดระดับสมาชิก' },
            400
          );
        }
        const slipCheck = await verifyEasySlipEdge(env, body.paymentSlipDataUrl, targetAmount, memberId);
        if (slipCheck.hardReject) {
          return jsonResponse({ success: false, error: slipCheck.error }, 400);
        }
        if (slipCheck.verified) {
          paymentStatus = 'verified';
          verifiedTransRef = slipCheck.transRef;
          verifiedReceiverAcc = slipCheck.receiverAccount;
          verificationNotes = `อัปเกรดและตรวจสอบสลิปอัตโนมัติผ่าน EasySlip สำเร็จ • Ref: ${slipCheck.transRef || '-'} • ยอด ฿${slipCheck.slipAmount ?? targetAmount}`;
        }
      }

      const now = new Date().toISOString();
      await env.DB.prepare(
        `UPDATE members SET tier = ?, phone = COALESCE(NULLIF(?, ''), phone), payment_status = ?, payment_slip_url = COALESCE(?, payment_slip_url), payment_amount = ?, billing_cycle = ?, notes = COALESCE(?, notes), updated_at = ? WHERE id = ?`
      )
        .bind(
          targetTier,
          body.phone || '',
          paymentStatus,
          body.paymentSlipDataUrl || null,
          targetAmount,
          targetBillingCycle,
          verificationNotes,
          now,
          memberId
        )
        .run();

      if (paymentStatus === 'verified' && verifiedTransRef) {
        await recordVerifiedSlipEdge(env, verifiedTransRef, memberId, targetAmount, verifiedReceiverAcc);
      }

      const updated = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(memberId).first();
      const updatedMember = rowToMember(updated);
      if (updatedMember.discordUserId) {
        await syncDiscordMemberRolesEdge(env, updatedMember);
      }
      const { password: _, ...safe } = updatedMember;
      return jsonResponse(
        {
          success: true,
          verified: paymentStatus === 'verified',
          member: safe,
          message:
            paymentStatus === 'verified'
              ? 'ตรวจสอบสลิปผ่าน EasySlip สำเร็จ! อัปเกรดและเปิดใช้งานสิทธิ์ของคุณทันทีแล้ว'
              : 'บันทึกสลิปเรียบร้อยแล้ว อยู่ระหว่างรอแอดมินตรวจสอบ',
        },
        200,
        {
          'Set-Cookie': `safesoul_member=${encodeURIComponent(JSON.stringify(safe))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
        }
      );
    }

    if (path === '/api/auth/verify-my-slip' && method === 'POST') {
      const cookies = parseCookies(request.headers.get('Cookie'));
      const sessionMember = cookies.safesoul_member ? JSON.parse(cookies.safesoul_member) : null;
      const body: any = await request.json().catch(() => ({}));
      const memberId = body.memberId || sessionMember?.id;
      if (!memberId) {
        return jsonResponse({ success: false, error: 'กรุณาเข้าสู่ระบบก่อนตรวจสอบสลิป' }, 401);
      }
      const row = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(memberId).first();
      if (!row) {
        return jsonResponse({ success: false, error: 'ไม่พบข้อมูลสมาชิก' }, 404);
      }
      if (row.payment_status === 'verified') {
        const { password: _, ...safe } = rowToMember(row);
        return jsonResponse({ success: true, verified: true, member: safe, message: 'บัญชีนี้ยืนยันสิทธิ์เรียบร้อยแล้ว' });
      }
      const slipImg = body.paymentSlipDataUrl || row.payment_slip_url;
      if (!slipImg) {
        return jsonResponse({ success: false, error: 'ไม่พบไฟล์สลิปในระบบ กรุณาแนบสลิปใหม่อีกครั้ง' }, 400);
      }
      const expected = Number(row.payment_amount || (row.tier === 'founding_tier_3' ? 3990 : 199));
      const slipCheck = await verifyEasySlipEdge(env, slipImg, expected, memberId);
      if (slipCheck.hardReject || !slipCheck.verified) {
        return jsonResponse(
          { success: false, error: slipCheck.error || 'ไม่สามารถยืนยันสลิปอัตโนมัติได้ในขณะนี้ กรุณารอแอดมินตรวจสอบ' },
          400
        );
      }
      const now = new Date().toISOString();
      const note = `ตรวจสอบสลิปอัตโนมัติผ่าน EasySlip สำเร็จ • Ref: ${slipCheck.transRef || '-'} • ยอด ฿${slipCheck.slipAmount ?? expected}`;
      await env.DB.prepare(
        'UPDATE members SET payment_status = ?, notes = ?, updated_at = ? WHERE id = ?'
      )
        .bind('verified', note, now, memberId)
        .run();
      await recordVerifiedSlipEdge(env, slipCheck.transRef, memberId, expected, slipCheck.receiverAccount);

      const updated = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(memberId).first();
      const updatedMember = rowToMember(updated);
      if (updatedMember.discordUserId) {
        await syncDiscordMemberRolesEdge(env, updatedMember);
      }
      const { password: _, ...safe } = updatedMember;
      return jsonResponse(
        {
          success: true,
          verified: true,
          member: safe,
          message: 'ตรวจสอบสลิปผ่าน EasySlip สำเร็จ! ปลดล็อกสิทธิ์บัญชีของคุณทันทีแล้ว',
        },
        200,
        {
          'Set-Cookie': `safesoul_member=${encodeURIComponent(JSON.stringify(safe))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
        }
      );
    }

    // -----------------------------------------------------------------------
    // 3. /api/verify-slip (EasySlip API — with receiver & duplicate check)
    // -----------------------------------------------------------------------
    if (path === '/api/verify-slip' && method === 'POST') {
      const body: any = await request.json();
      const imageBase64: string = body.imageBase64 || '';
      const expectedAmount = Number(body.expectedAmount || 0);
      const slipCheck = await verifyEasySlipEdge(env, imageBase64, expectedAmount);

      if (slipCheck.hardReject) {
        return jsonResponse({ success: false, verified: false, error: slipCheck.error }, 400);
      }
      if (!slipCheck.verified) {
        return jsonResponse({
          success: true,
          verified: false,
          mode: 'manual_review',
          message: 'บันทึกสลิปเรียบร้อย รอแอดมินตรวจสอบ',
        });
      }

      if (slipCheck.transRef && body.recordSlip !== false) {
        await recordVerifiedSlipEdge(
          env,
          slipCheck.transRef,
          body.memberId || 'store_order',
          slipCheck.slipAmount ?? expectedAmount,
          slipCheck.receiverAccount
        );
      }

      return jsonResponse({
        success: true,
        verified: true,
        mode: 'easyslip_auto',
        transRef: slipCheck.transRef,
        slipAmount: slipCheck.slipAmount,
        slipData: slipCheck.slipData,
      });
    }

    // -----------------------------------------------------------------------
    // 4. /api/ebook/claim (Resend API + R2 PDF + D1 One-Time Claim)
    // -----------------------------------------------------------------------
    if (path === '/api/ebook/claim') {
      if (method === 'GET') {
        return jsonResponse({
          success: true,
          templates: {
            free_tier_1: getEbookEmailTemplateForTier('free_tier_1'),
            supporter_tier_2: getEbookEmailTemplateForTier('supporter_tier_2'),
            founding_tier_3: getEbookEmailTemplateForTier('founding_tier_3'),
          },
        });
      }

      if (method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const cookies = parseCookies(request.headers.get('Cookie'));
        const sessionMember = cookies.safesoul_member ? JSON.parse(cookies.safesoul_member) : null;
        const memberId = body.memberId || sessionMember?.id;

        if (!memberId) {
          return jsonResponse(
            { success: false, error: 'กรุณาเข้าสู่ระบบสมาชิกก่อนกดรับ E-Book ทางอีเมล' },
            401
          );
        }

        const row = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(memberId).first();
        if (!row) {
          return jsonResponse({ success: false, error: 'ไม่พบข้อมูลสมาชิก' }, 404);
        }

        const member = rowToMember(row);
        // Unlimited E-Book re-send enabled (allows members to re-request anytime if email delivery failed)
        const { effectiveTier } = getEffectiveMemberTier(member);
        const tierForEmail = effectiveTier === 'visitor' ? 'free_tier_1' : effectiveTier;
        const emailTemplate = getEbookEmailTemplateForTier(tierForEmail, member);

        let emailStatus = 'queued_and_logged';
        let emailSent = false;
        let emailError = '';
        if (env.RESEND_API_KEY && env.MEDIA_BUCKET) {
          try {
            const pdfObj = await env.MEDIA_BUCKET.get('private_ebooks/The_Fitrah_Shield_Openwater.pdf');
            if (pdfObj) {
              const pdfBase64 = arrayBufferToBase64(await pdfObj.arrayBuffer());
              const primaryFrom =
                env.EMAIL_FROM ||
                'The Fitrah Shield <sanctuary@hardynaipayong.cloud>';
              const resendRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${env.RESEND_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: primaryFrom,
                  to: [member.email],
                  subject: emailTemplate.subject,
                  html: emailTemplate.bodyHtml,
                  text: emailTemplate.bodyText,
                  attachments: [
                    {
                      filename: 'The_Fitrah_Shield_Openwater.pdf',
                      content: pdfBase64,
                    },
                  ],
                }),
              });
              if (resendRes.ok) {
                emailStatus = 'sent_via_resend';
                emailSent = true;
              } else {
                // Automatic fallback via onboarding@resend.dev if custom domain not yet verified
                const fbRes = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    from: 'The Fitrah Shield <onboarding@resend.dev>',
                    to: [member.email],
                    subject: emailTemplate.subject,
                    html: emailTemplate.bodyHtml,
                    text: emailTemplate.bodyText,
                    attachments: [
                      {
                        filename: 'The_Fitrah_Shield_Openwater.pdf',
                        content: pdfBase64,
                      },
                    ],
                  }),
                });
                if (fbRes.ok) {
                  emailStatus = 'sent_via_resend_fallback';
                  emailSent = true;
                } else {
                  emailError = await fbRes.text().catch(() => '');
                  emailStatus = 'resend_domain_unverified';
                }
              }
            } else {
              emailStatus = 'pdf_not_found_in_r2';
            }
          } catch (e: any) {
            emailError = e?.message || 'Resend exception';
            console.error('Edge Resend dispatch error:', e);
          }
        }

        const claimedAt = new Date().toISOString();
        // Keep ebook_claimed = 0 so members can always re-send without hitting a 1-time lock, while recording last claimed_at
        await env.DB.prepare(
          'UPDATE members SET ebook_claimed = 0, ebook_claimed_at = ?, updated_at = ? WHERE id = ?'
        )
          .bind(claimedAt, claimedAt, member.id)
          .run();

        await env.DB.prepare(
          'INSERT INTO ebook_dispatches (id, member_id, member_number, recipient_email, tier, subject, attachment, status, claimed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(
            `ebook_claim_${Date.now()}`,
            member.id,
            member.memberNumber,
            member.email,
            tierForEmail,
            emailTemplate.subject,
            'The_Fitrah_Shield_Openwater.pdf',
            emailStatus,
            claimedAt
          )
          .run();

        const updatedMember = { ...member, ebookClaimed: false, ebookClaimedAt: claimedAt };
        const { password: _, ...safe } = updatedMember;

        return jsonResponse(
          {
            success: true,
            member: safe,
            recipientEmail: member.email,
            emailSent,
            emailStatus,
            emailError: emailError || undefined,
            emailTemplate,
            message: emailSent
              ? `จัดส่ง E-Book ไปยังอีเมล (${member.email}) เรียบร้อยแล้ว! (สามารถกดส่งซ้ำได้ตลอดเวลา)`
              : `บันทึกคำขอรับ E-Book สำหรับอีเมล (${member.email}) แล้ว — หากยังไม่ได้รับอีเมล สามารถกดส่งซ้ำได้ตลอดเวลา (สถานะเซิร์ฟเวอร์: ${emailStatus})`,
          },
          200,
          {
            'Set-Cookie': `safesoul_member=${encodeURIComponent(JSON.stringify(safe))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
          }
        );
      }
    }

    // -----------------------------------------------------------------------
    // 5. /api/admin/members
    // -----------------------------------------------------------------------
    if (path === '/api/admin/members') {
      if (method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM members ORDER BY member_number ASC'
        ).all();
        const allMembers = (results || []).map(rowToMember);
        return jsonResponse({
          success: true,
          total: allMembers.length,
          counts: {
            all: allMembers.length,
            free_tier_1: allMembers.filter((m: Member) => m.tier === 'free_tier_1').length,
            supporter_tier_2: allMembers.filter((m: Member) => m.tier === 'supporter_tier_2').length,
            founding_tier_3: allMembers.filter((m: Member) => m.tier === 'founding_tier_3').length,
            pending_slip: allMembers.filter((m: Member) => m.paymentStatus === 'pending_verification').length,
          },
          items: allMembers,
        });
      }

      if (method === 'POST') {
        const body: any = await request.json();
        const maxRow = await env.DB.prepare('SELECT MAX(member_number) as max_num FROM members').first();
        const nextNum = (Number(maxRow?.max_num) || 0) + 1;
        const id = `mem_${String(nextNum).padStart(3, '0')}`;
        const now = new Date().toISOString();
        await env.DB.prepare(
          `INSERT INTO members (id, member_number, username, email, phone, password, name, tier, role, payment_status, payment_amount, billing_cycle, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            id,
            nextNum,
            body.username,
            body.email,
            body.phone || '',
            body.password || 'password123',
            body.name || body.username,
            body.tier || 'free_tier_1',
            body.role || 'member',
            body.paymentStatus || 'verified',
            Number(body.paymentAmount || 0),
            body.billingCycle || 'free',
            body.notes || '',
            now
          )
          .run();
        const created = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(id).first();
        return jsonResponse({ success: true, member: rowToMember(created) });
      }

      if (method === 'PATCH') {
        const body: any = await request.json();
        const existing = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(body.id).first();
        if (!existing) return jsonResponse({ success: false, error: 'ไม่พบข้อมูลสมาชิก' }, 404);
        const now = new Date().toISOString();
        await env.DB.prepare(
          `UPDATE members SET name = ?, username = ?, email = ?, phone = ?, tier = ?, role = ?, payment_status = ?, payment_amount = ?, notes = ?, password = ?, updated_at = ? WHERE id = ?`
        )
          .bind(
            body.name ?? existing.name,
            body.username ?? existing.username,
            body.email ?? existing.email,
            body.phone ?? existing.phone,
            body.tier ?? existing.tier,
            body.role ?? existing.role,
            body.paymentStatus ?? existing.payment_status,
            body.paymentAmount ?? existing.payment_amount,
            body.notes ?? existing.notes,
            body.password ? body.password : existing.password,
            now,
            body.id
          )
          .run();
        const updated = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(body.id).first();
        const updatedMember = rowToMember(updated);
        let discordSync: any = null;
        if (updatedMember.discordUserId) {
          discordSync = await syncDiscordMemberRolesEdge(env, updatedMember);
        }
        return jsonResponse({ success: true, member: updatedMember, discordSync });
      }

      if (method === 'DELETE') {
        const id = url.searchParams.get('id');
        await env.DB.prepare('DELETE FROM members WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }
    }

    // -----------------------------------------------------------------------
    // 6. /api/admin/store
    // -----------------------------------------------------------------------
    if (path === '/api/admin/store') {
      if (method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM store_products').all();
        const items = (results || []).map((r: any) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          description: r.description,
          type: r.type,
          price_thb: Number(r.price_thb),
          compare_at_price_thb: r.compare_at_price_thb !== null ? Number(r.compare_at_price_thb) : undefined,
          image_url: r.image_url,
          badge: r.badge || undefined,
          stock_quantity: Number(r.stock_quantity),
          is_active: Boolean(r.is_active),
          status: r.status || 'published',
          published_at: r.published_at || undefined,
        }));
        return jsonResponse({
          success: true,
          total: items.length,
          counts: {
            all: items.length,
            published: items.filter((p: any) => p.status === 'published').length,
            scheduled: items.filter((p: any) => p.status === 'scheduled').length,
            draft: items.filter((p: any) => p.status === 'draft').length,
          },
          items,
        });
      }

      if (method === 'POST') {
        const body: any = await request.json();
        const id = body.id || `prod-${Date.now()}`;
        const slug = body.slug || `support-${Date.now()}`;
        const status = body.status || 'published';
        const isActive = status !== 'draft' ? 1 : 0;
        const now = new Date().toISOString();
        const imageUrl =
          body.imageDataUrl ||
          body.image_url ||
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';

        await env.DB.prepare(
          `INSERT OR REPLACE INTO store_products (id, slug, title, description, type, price_thb, compare_at_price_thb, image_url, badge, stock_quantity, is_active, status, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            id,
            slug,
            body.title || 'สินค้าใหม่',
            body.description || '',
            body.type || 'physical',
            Number(body.price_thb || 0),
            body.compare_at_price_thb !== undefined && body.compare_at_price_thb !== null
              ? Number(body.compare_at_price_thb)
              : null,
            imageUrl,
            body.badge || null,
            Number(body.stock_quantity ?? 50),
            isActive,
            status,
            body.published_at || now.slice(0, 16),
            now
          )
          .run();

        return jsonResponse({
          success: true,
          product: { id, slug, title: body.title, status, price_thb: Number(body.price_thb || 0) },
        });
      }

      if (method === 'DELETE') {
        const id = url.searchParams.get('id');
        if (id) {
          await env.DB.prepare('DELETE FROM store_products WHERE id = ?').bind(id).run();
        }
        return jsonResponse({ success: true });
      }
    }

    // -----------------------------------------------------------------------
    // 6.5 /api/admin/articles (Cloudflare D1 article_overrides)
    // -----------------------------------------------------------------------
    if (path === '/api/admin/articles') {
      if (method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM article_overrides').all();
        return jsonResponse({ success: true, items: results || [] });
      }

      if (method === 'POST') {
        const body: any = await request.json();
        const articleKey = body.articleKey || body.key;
        const updates = body.updates || body;
        if (!articleKey) {
          return jsonResponse({ success: false, error: 'Missing articleKey' }, 400);
        }
        const now = new Date().toISOString();
        await env.DB.prepare(
          `INSERT OR REPLACE INTO article_overrides (key, title, excerpt, content, status, published_at, is_unlocked, cover_image, audio_url, is_deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            articleKey,
            updates.title || null,
            updates.excerpt || null,
            updates.content || null,
            updates.status || 'published',
            updates.publishedAt || updates.published_at || null,
            updates.isUnlocked !== undefined ? (updates.isUnlocked ? 1 : 0) : null,
            updates.coverImage || updates.cover_image || null,
            updates.audioUrl || updates.audio_url || null,
            updates.isDeleted ? 1 : 0,
            now
          )
          .run();

        return jsonResponse({ success: true, message: 'Article updated successfully' });
      }
    }

    // -----------------------------------------------------------------------
    // 7. /api/contact
    // -----------------------------------------------------------------------
    if (path === '/api/contact') {
      if (method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM contact_messages ORDER BY created_at DESC'
        ).all();
        const items = (results || []).map((r: any) => ({
          id: r.id,
          category: r.category,
          name: r.name,
          replyEmail: r.reply_email,
          phone: r.phone || '',
          subject: r.subject,
          message: r.message,
          status: r.status,
          adminNote: r.admin_note || '',
          createdAt: r.created_at,
        }));
        return jsonResponse({
          success: true,
          unreadCount: items.filter((i: any) => i.status === 'new').length,
          items,
        });
      }

      if (method === 'POST') {
        const body: any = await request.json();
        const name = String(body.name || '').trim();
        const replyEmail = String(body.replyEmail || '').trim();
        const phone = String(body.phone || '').trim();
        const category = String(body.category || 'discussion').trim();
        const subject = String(body.subject || '').trim() || `ข้อความจากหน้าติดต่อเรา โดย ${name}`;
        const message = String(body.message || '').trim();

        if (!name || !replyEmail || !message) {
          return jsonResponse(
            { success: false, error: 'กรุณากรอกชื่อ อีเมลติดต่อกลับ และรายละเอียดข้อความให้ครบถ้วน' },
            400
          );
        }

        const id = `msg_${Date.now()}`;
        const now = new Date().toISOString();
        await env.DB.prepare(
          'INSERT INTO contact_messages (id, category, name, reply_email, phone, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(id, category, name, replyEmail, phone, subject, message, 'new', now)
          .run();

        const categoryMap: Record<string, string> = {
          discussion: 'พูดคุย / แลกเปลี่ยน',
          request: 'ร้องขอเนื้อหา / เสนอแนะ',
          complaint: 'ร้องเรียน / แจ้งปัญหา',
          membership: 'เรื่องสมาชิก / การชำระเงิน',
        };
        const catLabel = categoryMap[category] || category;

        const emailHtml = `
          <div style="font-family: 'Noto Sans Thai', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #0B1912; color: #F4F1EA; padding: 24px; border-radius: 16px; border: 1px solid #D9A94F;">
            <div style="font-size: 12px; color: #F59E0B; font-weight: bold; letter-spacing: 1px;">THE FITRAH SHIELD • แจ้งเรื่องถึงทีมงาน</div>
            <h2 style="margin: 8px 0 16px; color: #FDE68A;">[${escapeHtml(catLabel)}] ${escapeHtml(subject)}</h2>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 16px;">
              <tr><td style="padding: 6px 0; color: #A7B8AD; width: 130px;">รหัสอ้างอิง:</td><td style="color: #F4F1EA; font-family: monospace;">${escapeHtml(id)}</td></tr>
              <tr><td style="padding: 6px 0; color: #A7B8AD;">ชื่อผู้ส่ง:</td><td style="color: #F4F1EA; font-weight: bold;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding: 6px 0; color: #A7B8AD;">อีเมลตอบกลับ:</td><td><a href="mailto:${escapeHtml(replyEmail)}" style="color: #FDE68A;">${escapeHtml(replyEmail)}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #A7B8AD;">เบอร์โทรศัพท์:</td><td style="color: #F4F1EA;">${escapeHtml(phone || '-')}</td></tr>
            </table>
            <div style="background: #07100C; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); white-space: pre-wrap; line-height: 1.7; font-size: 14px; color: #F4F1EA;">
              ${escapeHtml(message)}
            </div>
            <p style="font-size: 11px; color: #94A39B; margin-top: 16px;">
              คุณสามารถกด Reply อีเมลฉบับนี้เพื่อตอบกลับไปยัง ${escapeHtml(replyEmail)} ได้ทันที หรือดูข้อความทั้งหมดที่ <a href="https://thefitrahshield.hardynaipayong.cloud/admin/contacts" style="color: #F59E0B;">แผงควบคุม Admin Contacts</a>
            </p>
          </div>
        `;

        const emailText = [
          `[The Fitrah Shield - แจ้งเรื่องถึงทีมงาน]`,
          `หมวดหมู่: ${catLabel}`,
          `หัวข้อ: ${subject}`,
          `รหัสอ้างอิง: ${id}`,
          `ผู้ส่ง: ${name}`,
          `อีเมลตอบกลับ: ${replyEmail}`,
          `เบอร์โทรศัพท์: ${phone || '-'}`,
          ``,
          `รายละเอียด:`,
          message,
        ].join('\n');

        const emailDispatch = await sendResendNotification(env, {
          to: ['n_ahamadchula@hotmail.com', 'n.ahamadchula@gmail.com'],
          fallbackTo: ['n.ahamadchula@gmail.com'],
          replyTo: replyEmail,
          subject: `[Fitrah Contact • ${catLabel}] ${subject}`,
          html: emailHtml,
          text: emailText,
        });

        const item = {
          id,
          category,
          name,
          replyEmail,
          phone,
          subject,
          message,
          status: 'new',
          createdAt: now,
        };

        return jsonResponse({
          success: true,
          id,
          item,
          emailSent: emailDispatch.sent,
          emailVia: emailDispatch.via,
          message: 'ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับไปยังอีเมลที่คุณระบุโดยเร็วที่สุด',
        });
      }

      if (method === 'PATCH') {
        const body: any = await request.json();
        await env.DB.prepare(
          'UPDATE contact_messages SET status = COALESCE(?, status), admin_note = COALESCE(?, admin_note) WHERE id = ?'
        )
          .bind(body.status || null, body.adminNote ?? null, body.id)
          .run();
        return jsonResponse({ success: true });
      }

      if (method === 'DELETE') {
        const id = url.searchParams.get('id');
        if (id) {
          await env.DB.prepare('DELETE FROM contact_messages WHERE id = ?').bind(id).run();
        }
        return jsonResponse({ success: true });
      }
    }

    // -----------------------------------------------------------------------
    // 7.5 /api/analytics/track & /api/analytics/summary (Cloudflare D1 Stats)
    // -----------------------------------------------------------------------
    if (path === '/api/analytics/track' && method === 'POST') {
      if (!env.DB) return jsonResponse({ success: false, error: 'DB unavailable' }, 503);
      try {
        const body: any = await request.json();
        const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const now = new Date().toISOString();
        const eventType = String(body.eventType || 'pageview').slice(0, 40);
        const sessionId = String(body.sessionId || 'anon').slice(0, 80);
        const deviceLabel = String(body.deviceLabel || 'Unknown').slice(0, 80);
        const evPath = String(body.path || '/').slice(0, 200);
        const targetId = String(body.targetId || '').slice(0, 200);
        const targetTitle = String(body.targetTitle || '').slice(0, 200);

        await env.DB.prepare(
          `INSERT INTO site_activity_events
            (id, event_type, member_id, member_number, username, member_name, tier, session_id, device_label, path, target_id, target_title, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            id,
            eventType,
            body.memberId || null,
            body.memberNumber ?? null,
            body.username || null,
            body.memberName || null,
            body.tier || null,
            sessionId,
            deviceLabel,
            evPath,
            targetId,
            targetTitle,
            now
          )
          .run();

        return jsonResponse({ success: true, id });
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message || 'Track failed' }, 400);
      }
    }

    if (path === '/api/analytics/summary' && method === 'GET') {
      if (!env.DB) return jsonResponse({ success: false, error: 'DB unavailable' }, 503);
      const [evRes, memRes] = await Promise.all([
        env.DB.prepare(
          'SELECT * FROM site_activity_events ORDER BY created_at DESC LIMIT 8000'
        ).all(),
        env.DB.prepare(
          'SELECT id, member_number, username, name, tier FROM members ORDER BY member_number ASC'
        ).all(),
      ]);
      const summary = aggregateAnalyticsEvents(evRes.results || [], memRes.results || []);
      return jsonResponse(summary);
    }

    // -----------------------------------------------------------------------
    // 8. /api/admin/co-admin (Gemini AI Co-Admin & D1 Action Executor)
    // -----------------------------------------------------------------------
    if (path === '/api/admin/co-admin') {
      const [memRes, prodRes, contactRes, overrideRes] = await Promise.all([
        env.DB ? env.DB.prepare('SELECT * FROM members ORDER BY member_number ASC').all() : { results: [] },
        env.DB ? env.DB.prepare('SELECT * FROM store_products').all() : { results: [] },
        env.DB ? env.DB.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all() : { results: [] },
        env.DB ? env.DB.prepare('SELECT * FROM article_overrides').all() : { results: [] },
      ]);

      const members = (memRes.results || []).map(rowToMember);
      const products = prodRes.results || [];
      const contacts = contactRes.results || [];
      const overrides = overrideRes.results || [];

      if (method === 'GET') {
        return jsonResponse({
          success: true,
          hasServerKey: Boolean(env.GEMINI_API_KEY || env.GOOGLE_API_KEY),
          summary: {
            membersCount: members.length,
            pendingSlipsCount: members.filter((m: Member) => m.paymentStatus === 'pending_verification').length,
            productsCount: products.length,
            unreadContactsCount: contacts.filter((c: any) => c.status === 'new').length,
            articleOverridesCount: overrides.length,
          },
        });
      }

      if (method === 'POST') {
        const body: any = await request.json();
        const action = body.action || 'chat';
        const apiKey = String(body.apiKey || env.GEMINI_API_KEY || env.GOOGLE_API_KEY || '').trim();
        const preferredModel = body.model || 'gemini-3.8-flash';

        if (action === 'test_key') {
          if (!apiKey) {
            return jsonResponse({ success: false, error: 'กรุณาวาง Gemini API Key ก่อนทดสอบ' }, 400);
          }
          const testRes = await callGeminiEdge(
            apiKey,
            preferredModel,
            'คุณคือผู้ช่วยดูแลระบบ The Fitrah Shield',
            [
              {
                role: 'user',
                parts: [
                  {
                    text: 'ตอบสั้นๆ 1 ประโยคว่า: เชื่อมต่อ Gemini Co-Admin สำเร็จพร้อมดูแลเว็บไซต์ The Fitrah Shield แล้วครับ',
                  },
                ],
              },
            ]
          );
          if (!testRes.ok) {
            return jsonResponse({ success: false, error: testRes.error }, 400);
          }
          return jsonResponse({
            success: true,
            modelUsed: testRes.modelUsed,
            message: testRes.reply,
          });
        }

        if (action === 'fetch_drive_doc') {
          const driveUrl = String(body.driveUrl || '').trim();
          const extracted = await fetchGoogleDriveTextEdge(driveUrl);
          return jsonResponse({
            success: extracted.ok,
            sourceType: extracted.sourceType,
            content: extracted.text,
            error: extracted.ok ? undefined : extracted.text,
          });
        }

        if (action === 'execute_action') {
          const payload = body.executePayload;
          if (!payload || !payload.type || !payload.data) {
            return jsonResponse({ success: false, error: 'ข้อมูลคำสั่งไม่ครบถ้วน' }, 400);
          }
          const { type, data } = payload;
          const now = new Date().toISOString();

          if (type === 'upsert_store_product') {
            const id = data.id || `prod-${Date.now()}`;
            const slug = data.slug || `support-${Date.now()}`;
            const status = data.status || 'published';
            const isActive = status !== 'draft' ? 1 : 0;
            await env.DB.prepare(
              `INSERT OR REPLACE INTO store_products (id, slug, title, description, type, price_thb, compare_at_price_thb, image_url, badge, stock_quantity, is_active, status, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(
                id,
                slug,
                data.title || 'สินค้าใหม่ Safe for Support',
                data.description || '',
                data.type || 'physical',
                Number(data.price_thb ?? 0),
                data.compare_at_price_thb !== undefined ? Number(data.compare_at_price_thb) : null,
                data.image_url ||
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
                data.badge || 'Official Sanctuary Item',
                Number(data.stock_quantity ?? 50),
                isActive,
                status,
                data.published_at || now.slice(0, 16),
                now
              )
              .run();
            return jsonResponse({
              success: true,
              message: `บันทึกสินค้า "${data.title}" (฿${data.price_thb ?? 0}) ลงฐานข้อมูล Cloudflare D1 เรียบร้อยแล้ว`,
            });
          }

          if (type === 'update_article_override') {
            const articleKey = data.key || data.articleKey;
            if (!articleKey) return jsonResponse({ success: false, error: 'ไม่พบรหัสบทความ (key)' }, 400);
            await env.DB.prepare(
              `INSERT OR REPLACE INTO article_overrides (key, title, excerpt, content, status, is_unlocked, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(
                articleKey,
                data.title || null,
                data.excerpt || null,
                data.content || null,
                data.status || 'published',
                data.isUnlocked !== undefined ? (data.isUnlocked ? 1 : 0) : null,
                now
              )
              .run();
            return jsonResponse({
              success: true,
              message: `อัปเดตบทความ "${articleKey}" ลงฐานข้อมูล Cloudflare D1 เรียบร้อยแล้ว`,
            });
          }

          if (type === 'update_member') {
            await env.DB.prepare(
              `UPDATE members SET tier = COALESCE(?, tier), role = COALESCE(?, role), payment_status = COALESCE(?, payment_status), notes = COALESCE(?, notes), updated_at = ? WHERE id = ?`
            )
              .bind(
                data.tier || null,
                data.role || null,
                data.paymentStatus || null,
                data.notes || null,
                now,
                data.id
              )
              .run();
            const updatedRow = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(data.id).first();
            if (updatedRow) {
              const updatedMember = rowToMember(updatedRow);
              if (updatedMember.discordUserId) {
                await syncDiscordMemberRolesEdge(env, updatedMember);
              }
            }
            return jsonResponse({
              success: true,
              message: `อัปเดตสิทธิ์และสถานะสมาชิก (${data.id}) ลงฐานข้อมูล Cloudflare D1 เรียบร้อยแล้ว`,
            });
          }

          if (type === 'update_contact_status') {
            await env.DB.prepare(
              `UPDATE contact_messages SET status = COALESCE(?, status), admin_note = COALESCE(?, admin_note) WHERE id = ?`
            )
              .bind(data.status || 'replied', data.adminNote || null, data.id)
              .run();
            return jsonResponse({
              success: true,
              message: `อัปเดตสถานะข้อความติดต่อ (${data.id}) เรียบร้อยแล้ว`,
            });
          }

          return jsonResponse({ success: false, error: `ไม่รองรับคำสั่งประเภท ${type}` }, 400);
        }

        // Chat
        const userMessage = String(body.message || '').trim();
        const history = Array.isArray(body.history) ? body.history : [];

        if (!apiKey) {
          const pendingSlips = members.filter((m: Member) => m.paymentStatus === 'pending_verification');
          const unreadContacts = contacts.filter((c: any) => c.status === 'new');
          return jsonResponse({
            success: true,
            mode: 'local_assistant',
            reply: `📊 **สรุปสถานะระบบหลังบ้าน The Fitrah Shield (Cloudflare D1 Live)**\n\nขณะนี้ยังไม่ได้เชื่อมต่อ **Gemini API Key** (คลิกปุ่ม **"🔑 ตั้งค่า / ล็อกอินรับ Gemini API ฟรี"** มุมขวาบนของกล่องแชทเพื่อเชื่อมต่อได้ฟรีทันที)\n\n- **สมาชิกทั้งหมด:** ${members.length} บัญชี (รอตรวจสลิป ${pendingSlips.length} รายการ)\n- **สินค้า Safe for Support:** ${products.length} รายการ\n- **ข้อความติดต่อใหม่:** ${unreadContacts.length} รายการ\n- **บทความที่แก้ไขทับใน D1:** ${overrides.length} บทความ`,
          });
        }

        let driveAttachmentContext = '';
        const urlMatch = userMessage.match(/https?:\/\/(docs|drive)\.google\.com\/[^\s)]+/);
        const targetDriveUrl = body.driveUrl || (urlMatch ? urlMatch[0] : '');
        if (targetDriveUrl) {
          const extracted = await fetchGoogleDriveTextEdge(targetDriveUrl);
          driveAttachmentContext = extracted.ok
            ? `\n\n[เนื้อหาที่ดึงสดจากลิงก์ ${extracted.sourceType} (${targetDriveUrl})]:\n${extracted.text}\n`
            : `\n\n[หมายเหตุจากการดึงลิงก์ Google Drive (${targetDriveUrl})]: ${extracted.text}\n`;
        }

        const safeMembersSummary = members.map((m: Member) => ({
          id: m.id,
          memberNumber: m.memberNumber,
          username: m.username,
          name: m.name,
          email: m.email,
          tier: m.tier,
          role: m.role,
          paymentStatus: m.paymentStatus,
          paymentAmount: m.paymentAmount,
          notes: m.notes,
        }));

        const systemInstruction = `คุณคือ "Fitrah Shield Gemini Co-Admin" ผู้ดูแลระบบร่วมอัจฉริยะของเว็บไซต์ "เกราะพิทักษ์ฟิฏเราะฮฺ (THE FITRAH SHIELD)" (https://thefitrahshield.hardynaipayong.cloud)
ข้อมูลสดในฐานข้อมูล Cloudflare D1:
- สินค้า Safe for Support: ${JSON.stringify(products)}
- สมาชิก: ${JSON.stringify(safeMembersSummary)}
- ข้อความติดต่อล่าสุด: ${JSON.stringify(contacts.slice(0, 15))}
- บทความที่แก้ไขทับ: ${JSON.stringify(overrides.map((o: any) => o.key))}

เมื่อแอดมินสั่งให้ เพิ่ม/แก้ไขสินค้า, แก้ไขบทความ, อนุมัติสลิป/ปรับสิทธิ์สมาชิก/ตั้ง Co-Admin, หรือตอบข้อความติดต่อ ให้ตอบอธิบายและแนบโค้ดบล็อก \`\`\`co-admin-action ... \`\`\` ที่เป็น JSON หนึ่งใน 4 type: "upsert_store_product", "update_article_override", "update_member", "update_contact_status" พร้อมฟิลด์ "label" และ "data" เพื่อให้แอดมินกดปุ่มยืนยันบันทึกเข้าระบบได้ในคลิกเดียว`;

        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        for (const h of history.slice(-8)) {
          if (!h.content) continue;
          contents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: userMessage + driveAttachmentContext }],
        });

        const geminiRes = await callGeminiEdge(apiKey, preferredModel, systemInstruction, contents);
        if (!geminiRes.ok) {
          return jsonResponse({ success: false, error: `เชื่อมต่อ Gemini API ไม่สำเร็จ: ${geminiRes.error}` }, 400);
        }

        return jsonResponse({
          success: true,
          mode: 'gemini_live',
          modelUsed: geminiRes.modelUsed,
          reply: geminiRes.reply,
        });
      }
    }

    // -----------------------------------------------------------------------
    // 10. Discord OAuth2 Member Linking & Role Sync
    // -----------------------------------------------------------------------
    if (path === '/api/discord/connect' && method === 'GET') {
      const origin = url.origin;
      const member = await getAuthenticatedD1Member(request, env);
      if (!member) {
        return Response.redirect(`${origin}/login?discord=login_required`, 302);
      }

      if (!env.DISCORD_CLIENT_ID) {
        return Response.redirect(
          `${origin}/login?discord=error&reason=${encodeURIComponent('ยังไม่ได้ตั้งค่า DISCORD_CLIENT_ID บนเซิร์ฟเวอร์')}`,
          302
        );
      }

      const nonce = crypto.randomUUID();
      const stateValue = `${member.id}:${nonce}`;
      const redirectUri = `${origin}/api/discord/callback`;
      const authUrl = new URL('https://discord.com/oauth2/authorize');
      authUrl.searchParams.set('client_id', env.DISCORD_CLIENT_ID);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'identify guilds.join');
      authUrl.searchParams.set('state', stateValue);

      const isHttps = origin.startsWith('https://');
      const stateCookie = `discord_oauth_state=${encodeURIComponent(stateValue)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${isHttps ? '; Secure' : ''}`;
      const headers = new Headers({ Location: authUrl.toString() });
      headers.append('Set-Cookie', stateCookie);
      return new Response(null, { status: 302, headers });
    }

    if (path === '/api/discord/callback' && method === 'GET') {
      const origin = url.origin;
      const isHttps = origin.startsWith('https://');
      const clearStateCookie = `discord_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isHttps ? '; Secure' : ''}`;
      const redirectWithError = (reason: string) => {
        const headers = new Headers({
          Location: `${origin}/login?discord=error&reason=${encodeURIComponent(reason)}`,
        });
        headers.append('Set-Cookie', clearStateCookie);
        return new Response(null, { status: 302, headers });
      };

      const oauthError = url.searchParams.get('error');
      if (oauthError) {
        return redirectWithError(`ยกเลิกการเชื่อมต่อ Discord (${oauthError})`);
      }

      const code = url.searchParams.get('code');
      const stateParam = url.searchParams.get('state');
      const cookies = parseCookies(request.headers.get('Cookie'));
      const savedState = cookies.discord_oauth_state;

      if (!code || !stateParam || !savedState || stateParam !== savedState) {
        return redirectWithError('รหัสยืนยันความปลอดภัย OAuth State ไม่ตรงกัน กรุณาลองใหม่อีกครั้ง');
      }

      const memberId = stateParam.split(':')[0];
      if (!memberId || !env.DB) {
        return redirectWithError('ไม่พบข้อมูลบัญชีสมาชิกในระบบ');
      }

      if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) {
        return redirectWithError('ระบบยังไม่ได้ตั้งค่า Discord Client ID / Secret');
      }

      const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${origin}/api/discord/callback`,
        }),
      });

      const tokenData: any = await tokenRes.json();
      if (!tokenRes.ok || !tokenData?.access_token) {
        return redirectWithError('ไม่สามารถแลกโทเค็นกับ Discord ได้ กรุณาลองใหม่');
      }

      const userRes = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const discordUser: any = await userRes.json();
      if (!userRes.ok || !discordUser?.id) {
        return redirectWithError('ไม่สามารถดึงข้อมูลบัญชี Discord ได้');
      }

      const displayUsername = discordUser.global_name
        ? `${discordUser.global_name} (@${discordUser.username})`
        : `@${discordUser.username}`;
      const now = new Date().toISOString();

      await env.DB.prepare(
        `UPDATE members SET discord_user_id = ?, discord_username = ?, discord_linked_at = ?, updated_at = ? WHERE id = ?`
      )
        .bind(discordUser.id, displayUsername, now, now, memberId)
        .run();

      const updatedRow = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(memberId).first();
      if (!updatedRow) {
        return redirectWithError('ไม่พบข้อมูลสมาชิกหลังอัปเดต');
      }

      const updatedMember = rowToMember(updatedRow);
      const syncResult = await syncDiscordMemberRolesEdge(env, updatedMember, tokenData.access_token);
      const { password: _, ...safe } = updatedMember;

      const targetLocation = syncResult.ok
        ? `${origin}/login?discord=connected#discord-sanctuary`
        : `${origin}/login?discord=connected&sync_warning=${encodeURIComponent(syncResult.error || 'กรุณาเข้าเซิร์ฟเวอร์แล้วกดซิงค์ยศอีกครั้ง')}#discord-sanctuary`;

      const headers = new Headers({ Location: targetLocation });
      headers.append('Set-Cookie', clearStateCookie);
      headers.append('Set-Cookie', buildMemberCookie(safe));
      return new Response(null, { status: 302, headers });
    }

    if (path === '/api/discord/sync-me' && method === 'POST') {
      const member = await getAuthenticatedD1Member(request, env);
      if (!member) {
        return jsonResponse({ success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }, 401);
      }
      if (!member.discordUserId) {
        return jsonResponse({ success: false, error: 'ยังไม่ได้เชื่อมต่อบัญชี Discord' }, 400);
      }
      const discordSync = await syncDiscordMemberRolesEdge(env, member);
      const { password: _, ...safe } = member;
      return jsonResponse(
        {
          success: discordSync.ok,
          discordSync,
          member: safe,
          error: discordSync.ok ? undefined : discordSync.error,
        },
        discordSync.ok ? 200 : 400,
        { 'Set-Cookie': buildMemberCookie(safe) }
      );
    }

    if (path === '/api/discord/disconnect' && method === 'POST') {
      const member = await getAuthenticatedD1Member(request, env);
      if (!member || !env.DB) {
        return jsonResponse({ success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }, 401);
      }

      if (member.discordUserId && env.DISCORD_BOT_TOKEN && env.DISCORD_GUILD_ID) {
        const { managedRoles } = resolveDiscordRolesForMember(env, member);
        for (const roleId of managedRoles) {
          await fetch(
            `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/members/${member.discordUserId}/roles/${roleId}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
            }
          ).catch(() => {});
        }
      }

      const now = new Date().toISOString();
      await env.DB.prepare(
        `UPDATE members SET discord_user_id = NULL, discord_username = NULL, discord_linked_at = NULL, updated_at = ? WHERE id = ?`
      )
        .bind(now, member.id)
        .run();

      const updatedRow = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(member.id).first();
      const updatedMember = updatedRow ? rowToMember(updatedRow) : { ...member, discordUserId: undefined, discordUsername: undefined, discordLinkedAt: undefined };
      const { password: _, ...safe } = updatedMember;

      return jsonResponse(
        { success: true, member: safe },
        200,
        { 'Set-Cookie': buildMemberCookie(safe) }
      );
    }

    return jsonResponse({ error: `Not found: ${path}` }, 404);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err?.message || 'Internal Server Error' }, 500);
  }
};

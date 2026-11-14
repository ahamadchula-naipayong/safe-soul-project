import { getEbookEmailTemplateForTier } from '../../src/lib/emailTemplates';
import { getEffectiveMemberTier } from '../../src/lib/oceanAccess';
import { Member, TierType, PaymentStatus } from '../../src/types';

interface Env {
  DB: any;
  MEDIA_BUCKET: any;
  ASSETS: any;
  EASYSLIP_API_KEY?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
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
    notes: r.notes || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at || undefined,
  };
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
      const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '12', 10)));
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

      const maxRow = await env.DB.prepare('SELECT MAX(member_number) as max_num FROM members').first();
      const nextNum = (Number(maxRow?.max_num) || 0) + 1;
      const id = `mem_${String(nextNum).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const paymentStatus: PaymentStatus =
        tier === 'free_tier_1' ? 'free' : body.paymentStatus || 'pending_verification';
      const paymentAmount =
        body.paymentAmount ?? (tier === 'founding_tier_3' ? 3990 : tier === 'supporter_tier_2' ? 199 : 0);

      await env.DB.prepare(
        `INSERT INTO members (id, member_number, username, email, phone, password, name, tier, role, payment_status, payment_slip_url, payment_amount, billing_cycle, ebook_claimed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'member', ?, ?, ?, ?, 0, ?)`
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
          body.billingCycle || (tier === 'founding_tier_3' ? 'lifetime' : tier === 'supporter_tier_2' ? 'monthly' : 'free'),
          now
        )
        .run();

      const created = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(id).first();
      const { password: _, ...safe } = rowToMember(created);
      return jsonResponse(
        { success: true, member: safe },
        200,
        {
          'Set-Cookie': `safesoul_member=${encodeURIComponent(JSON.stringify(safe))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
        }
      );
    }

    if (path === '/api/auth/upgrade' && method === 'POST') {
      const body: any = await request.json();
      const cookies = parseCookies(request.headers.get('Cookie'));
      const sessionMember = cookies.safesoul_member ? JSON.parse(cookies.safesoul_member) : null;
      const memberId = body.memberId || sessionMember?.id;
      if (!memberId) {
        return jsonResponse({ success: false, error: 'กรุณาเข้าสู่ระบบก่อนอัปเกรด' }, 401);
      }
      const now = new Date().toISOString();
      await env.DB.prepare(
        `UPDATE members SET tier = ?, payment_status = ?, payment_slip_url = COALESCE(?, payment_slip_url), payment_amount = ?, billing_cycle = ?, updated_at = ? WHERE id = ?`
      )
        .bind(
          body.tier,
          body.paymentStatus || 'pending_verification',
          body.paymentSlipDataUrl || null,
          Number(body.paymentAmount || 199),
          body.billingCycle || 'monthly',
          now,
          memberId
        )
        .run();

      const updated = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(memberId).first();
      const { password: _, ...safe } = rowToMember(updated);
      return jsonResponse(
        { success: true, member: safe },
        200,
        {
          'Set-Cookie': `safesoul_member=${encodeURIComponent(JSON.stringify(safe))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
        }
      );
    }

    // -----------------------------------------------------------------------
    // 3. /api/verify-slip (EasySlip API)
    // -----------------------------------------------------------------------
    if (path === '/api/verify-slip' && method === 'POST') {
      const body: any = await request.json();
      const imageBase64: string = body.imageBase64 || '';
      const expectedAmount = Number(body.expectedAmount || 0);
      const token = env.EASYSLIP_API_KEY;

      if (!token) {
        return jsonResponse({
          success: true,
          verified: false,
          mode: 'manual_review',
          message: 'บันทึกสลิปเรียบร้อย รอแอดมินตรวจสอบ',
        });
      }

      const rawBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      const verifyRes = await fetch('https://developer.easyslip.com/api/v1/verify', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: rawBase64 }),
      });

      const verifyData: any = await verifyRes.json();
      if (!verifyRes.ok || verifyData.status !== 200) {
        return jsonResponse(
          { success: false, verified: false, error: 'ไม่สามารถอ่านข้อมูล QR จากสลิปนี้ได้' },
          400
        );
      }

      const slipAmount = Number(verifyData?.data?.amount?.amount || 0);
      if (expectedAmount > 0 && slipAmount < expectedAmount) {
        return jsonResponse(
          {
            success: false,
            verified: false,
            error: `ยอดเงินในสลิป (฿${slipAmount}) น้อยกว่ายอดที่ต้องชำระ (฿${expectedAmount})`,
          },
          400
        );
      }

      return jsonResponse({
        success: true,
        verified: true,
        mode: 'easyslip_auto',
        slipData: verifyData.data,
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
        if (member.ebookClaimed) {
          return jsonResponse(
            {
              success: false,
              alreadyClaimed: true,
              error: `อีเมลที่สมัครสมาชิก (${member.email}) ได้ใช้สิทธิ์รับ E-Book ฉบับเกาะทะเลน้ำตื้นไปแล้ว (จำกัด 1 ครั้งต่ออีเมลที่สมัครเท่านั้น)`,
            },
            400
          );
        }

        const { effectiveTier } = getEffectiveMemberTier(member);
        const tierForEmail = effectiveTier === 'visitor' ? 'free_tier_1' : effectiveTier;
        const emailTemplate = getEbookEmailTemplateForTier(tierForEmail, member);

        let emailStatus = 'queued_and_logged';
        if (env.RESEND_API_KEY && env.MEDIA_BUCKET) {
          try {
            const pdfObj = await env.MEDIA_BUCKET.get('private_ebooks/The_Fitrah_Shield_Openwater.pdf');
            if (pdfObj) {
              const pdfBase64 = arrayBufferToBase64(await pdfObj.arrayBuffer());
              const resendRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${env.RESEND_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from:
                    env.EMAIL_FROM ||
                    'The Fitrah Shield <sanctuary@thefitrahshield.hardynaipayong.cloud>',
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
              }
            }
          } catch (e) {
            console.error('Edge Resend dispatch error:', e);
          }
        }

        const claimedAt = new Date().toISOString();
        await env.DB.prepare(
          'UPDATE members SET ebook_claimed = 1, ebook_claimed_at = ?, updated_at = ? WHERE id = ?'
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

        const updatedMember = { ...member, ebookClaimed: true, ebookClaimedAt: claimedAt };
        const { password: _, ...safe } = updatedMember;

        return jsonResponse(
          {
            success: true,
            member: safe,
            recipientEmail: member.email,
            emailTemplate,
            message: `จัดส่ง E-Book ไปยังอีเมลที่สมัครสมาชิก (${member.email}) เรียบร้อยแล้ว!`,
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
        return jsonResponse({ success: true, member: rowToMember(updated) });
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
        const id = `msg_${Date.now()}`;
        const now = new Date().toISOString();
        await env.DB.prepare(
          'INSERT INTO contact_messages (id, category, name, reply_email, phone, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(
            id,
            body.category || 'discussion',
            body.name,
            body.replyEmail,
            body.phone || '',
            body.subject,
            body.message,
            'new',
            now
          )
          .run();
        return jsonResponse({ success: true, id });
      }
    }

    return jsonResponse({ error: `Not found: ${path}` }, 404);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err?.message || 'Internal Server Error' }, 500);
  }
};

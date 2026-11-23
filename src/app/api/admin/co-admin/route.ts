import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { saveDeepOceanArticleOverride } from '@/lib/deepOcean';

export const dynamic = 'force-dynamic';

const dataDir = path.join(process.cwd(), 'data');
const storeFilePath = path.join(dataDir, 'store_products.json');
const membersFilePath = path.join(dataDir, 'members.json');
const contactsFilePath = path.join(dataDir, 'contact_messages.json');
const overridesFilePath = path.join(dataDir, 'ocean_articles_override.json');

function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJsonSafe(filePath: string, data: unknown) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function fetchGoogleDriveText(rawUrl: string): Promise<{ ok: boolean; text: string; sourceType: string }> {
  try {
    const docMatch = rawUrl.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch) {
      const exportUrl = `https://docs.google.com/document/d/${docMatch[1]}/export?format=txt`;
      const res = await fetch(exportUrl);
      if (res.ok) {
        const text = await res.text();
        return { ok: true, text: text.slice(0, 15000), sourceType: 'Google Docs' };
      }
    }

    const sheetMatch = rawUrl.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheetMatch) {
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=csv`;
      const res = await fetch(exportUrl);
      if (res.ok) {
        const text = await res.text();
        return { ok: true, text: text.slice(0, 15000), sourceType: 'Google Sheets (CSV)' };
      }
    }

    const driveMatch = rawUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const exportUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
      const res = await fetch(exportUrl);
      if (res.ok) {
        const text = await res.text();
        return { ok: true, text: text.slice(0, 15000), sourceType: 'Google Drive File' };
      }
    }

    return {
      ok: false,
      text: 'ไม่สามารถดึงไฟล์ได้ กรุณาตรวจสอบว่าตั้งค่าแชร์ไฟล์ใน Google Drive เป็น "ทุกคนที่มีลิงก์อ่านได้ (Anyone with the link can view)"',
      sourceType: 'Unknown',
    };
  } catch (err: any) {
    return {
      ok: false,
      text: `เกิดข้อผิดพลาดในการดึงลิงก์ Google Drive: ${err?.message || 'Unknown error'}`,
      sourceType: 'Error',
    };
  }
}

async function callGeminiWithFallback(
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
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
          },
        }),
      });

      const data: any = await res.json();
      if (res.ok && data?.candidates?.[0]?.content?.parts) {
        const replyText = data.candidates[0].content.parts.map((p: any) => p.text || '').join('');
        return { ok: true, reply: replyText, modelUsed: model };
      }
      lastError = data?.error?.message || `HTTP ${res.status}`;
      if (res.status === 400 && lastError.toLowerCase().includes('api key not valid')) {
        break;
      }
    } catch (err: any) {
      lastError = err?.message || 'Network error';
    }
  }

  return { ok: false, error: lastError || 'ไม่สามารถเชื่อมต่อ Gemini API ได้' };
}

function buildLocalFallbackReply(
  userMessage: string,
  members: any[],
  products: any[],
  contacts: any[],
  overrides: Record<string, any>
) {
  const pendingSlips = members.filter((m) => m.paymentStatus === 'pending_verification');
  const unreadContacts = contacts.filter((c) => c.status === 'new');
  const publishedProducts = products.filter((p) => (p.status || 'published') === 'published');
  const draftProducts = products.filter((p) => p.status === 'draft');

  return `📊 **สรุปสถานะระบบหลังบ้าน The Fitrah Shield (โหมดผู้ช่วยอัตโนมัติในเครื่อง)**

ขณะนี้คุณยังไม่ได้เชื่อมต่อ **Gemini API Key** (สามารถกดปุ่ม **"🔑 ตั้งค่า / ล็อกอินรับ Gemini API ฟรี"** มุมขวาบนของกล่องแชทเพื่อเปิดใช้งาน AI เต็มรูปแบบได้ฟรีทันที) แต่ผมสามารถสรุปข้อมูลสดจากฐานข้อมูลให้คุณได้ดังนี้ครับ:

1. **สมาชิกทั้งหมด:** ${members.length} บัญชี
   - รอตรวจสอบสลิปโอนเงิน: **${pendingSlips.length} รายการ** ${
     pendingSlips.length > 0
       ? `(${pendingSlips.map((m) => `${m.name} [${m.id}] ยอด ฿${m.paymentAmount}`).join(', ')})`
       : '(ตรวจสอบครบทั้งหมดแล้ว)'
   }
2. **รายการสินค้า Safe for Support:** ทั้งหมด ${products.length} รายการ (เผยแพร่แล้ว ${publishedProducts.length} • ฉบับร่าง ${draftProducts.length})
   - รายการปัจจุบัน: ${products.map((p) => `${p.title} (฿${p.price_thb} / ${p.status})`).join(', ')}
3. **ข้อความติดต่อเรา (Contact Inbox):** ทั้งหมด ${contacts.length} ข้อความ (ยังไม่อ่าน **${unreadContacts.length}** รายการ)
4. **บทความที่มีการแก้ไขทับ (Overrides):** ${Object.keys(overrides).length} บทความ

💡 *คำแนะนำ:* กดปุ่ม **"🔑 เชื่อมต่อ Gemini API (ฟรี)"** ด้านบนเพื่อเปิดหน้าต่างรับคีย์จาก Google AI Studio ในคลิกเดียว แล้วคุณจะสามารถสั่งให้ผมเกลาบทความ เพิ่มสินค้า อนุมัติสมาชิก และดึงไฟล์จาก Google Drive มาอัปเดตเว็บได้ทันทีครับ!`;
}

export async function GET() {
  const members = readJsonSafe<any[]>(membersFilePath, []);
  const products = readJsonSafe<any[]>(storeFilePath, []);
  const contacts = readJsonSafe<any[]>(contactsFilePath, []);
  const overrides = readJsonSafe<Record<string, any>>(overridesFilePath, {});
  const hasServerKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

  return NextResponse.json({
    success: true,
    hasServerKey,
    summary: {
      membersCount: members.length,
      pendingSlipsCount: members.filter((m) => m.paymentStatus === 'pending_verification').length,
      productsCount: products.length,
      unreadContactsCount: contacts.filter((c) => c.status === 'new').length,
      articleOverridesCount: Object.keys(overrides).length,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'chat';
    const apiKey = (body.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    const preferredModel = body.model || 'gemini-3.8-flash';

    // 1. Test API Key
    if (action === 'test_key') {
      if (!apiKey) {
        return NextResponse.json({ success: false, error: 'กรุณาวาง Gemini API Key ก่อนทดสอบ' }, { status: 400 });
      }
      const testRes = await callGeminiWithFallback(
        apiKey,
        preferredModel,
        'คุณคือผู้ช่วยดูแลระบบ The Fitrah Shield',
        [{ role: 'user', parts: [{ text: 'ตอบสั้นๆ 1 ประโยคว่า: เชื่อมต่อ Gemini Co-Admin สำเร็จพร้อมดูแลเว็บไซต์ The Fitrah Shield แล้วครับ' }] }]
      );
      if (!testRes.ok) {
        return NextResponse.json({ success: false, error: testRes.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        modelUsed: testRes.modelUsed,
        message: testRes.reply,
      });
    }

    // 2. Fetch Google Drive / Docs / Sheets content
    if (action === 'fetch_drive_doc') {
      const driveUrl = String(body.driveUrl || '').trim();
      if (!driveUrl) {
        return NextResponse.json({ success: false, error: 'กรุณาระบุลิงก์ Google Drive / Docs / Sheets' }, { status: 400 });
      }
      const extracted = await fetchGoogleDriveText(driveUrl);
      return NextResponse.json({
        success: extracted.ok,
        sourceType: extracted.sourceType,
        content: extracted.text,
        error: extracted.ok ? undefined : extracted.text,
      });
    }

    // 3. Execute Co-Admin Database Action
    if (action === 'execute_action') {
      const payload = body.executePayload;
      if (!payload || !payload.type || !payload.data) {
        return NextResponse.json({ success: false, error: 'ข้อมูลคำสั่งไม่ครบถ้วน' }, { status: 400 });
      }

      const { type, data } = payload;

      if (type === 'upsert_store_product') {
        const products = readJsonSafe<any[]>(storeFilePath, []);
        const id = data.id || `prod-${Date.now()}`;
        const slug = data.slug || `support-${Date.now()}`;
        const status = data.status || 'published';
        const newProduct = {
          id,
          slug,
          title: data.title || 'สินค้าใหม่ Safe for Support',
          description: data.description || '',
          type: data.type || 'physical',
          price_thb: Number(data.price_thb ?? 0),
          compare_at_price_thb: data.compare_at_price_thb !== undefined ? Number(data.compare_at_price_thb) : undefined,
          image_url:
            data.image_url ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
          badge: data.badge || 'Official Sanctuary Item',
          stock_quantity: Number(data.stock_quantity ?? 50),
          is_active: status !== 'draft',
          status,
          published_at: data.published_at || new Date().toISOString().slice(0, 16),
          updated_at: new Date().toISOString(),
        };

        const idx = products.findIndex((p) => p.id === id || p.slug === slug);
        if (idx >= 0) {
          products[idx] = { ...products[idx], ...newProduct };
        } else {
          products.unshift(newProduct);
        }
        writeJsonSafe(storeFilePath, products);
        return NextResponse.json({
          success: true,
          message: `บันทึกสินค้า "${newProduct.title}" (฿${newProduct.price_thb} • สถานะ ${newProduct.status}) ลงระบบเรียบร้อยแล้ว`,
          item: newProduct,
        });
      }

      if (type === 'update_article_override') {
        const articleKey = data.key || data.articleKey;
        if (!articleKey) {
          return NextResponse.json({ success: false, error: 'ไม่พบรหัสบทความ (key)' }, { status: 400 });
        }
        const updates = {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          status: data.status || 'published',
          isUnlocked: data.isUnlocked !== undefined ? Boolean(data.isUnlocked) : undefined,
        };
        saveDeepOceanArticleOverride(articleKey, updates);
        return NextResponse.json({
          success: true,
          message: `อัปเดตบทความ "${articleKey}" ลงฐานข้อมูลเรียบร้อยแล้ว`,
          item: { key: articleKey, ...updates },
        });
      }

      if (type === 'update_member') {
        const members = readJsonSafe<any[]>(membersFilePath, []);
        const idx = members.findIndex(
          (m) =>
            m.id === data.id ||
            (data.username && m.username?.toLowerCase() === String(data.username).toLowerCase()) ||
            (data.email && m.email?.toLowerCase() === String(data.email).toLowerCase())
        );
        if (idx === -1) {
          return NextResponse.json({ success: false, error: 'ไม่พบบัญชีสมาชิกที่ระบุ' }, { status: 404 });
        }
        members[idx] = {
          ...members[idx],
          tier: data.tier ?? members[idx].tier,
          role: data.role ?? members[idx].role,
          paymentStatus: data.paymentStatus ?? members[idx].paymentStatus,
          notes: data.notes ?? members[idx].notes,
          updatedAt: new Date().toISOString(),
        };
        writeJsonSafe(membersFilePath, members);
        return NextResponse.json({
          success: true,
          message: `อัปเดตข้อมูลสมาชิก "${members[idx].name}" (${members[idx].id}) เรียบร้อยแล้ว`,
          item: members[idx],
        });
      }

      if (type === 'update_contact_status') {
        const contacts = readJsonSafe<any[]>(contactsFilePath, []);
        const idx = contacts.findIndex((c) => c.id === data.id);
        if (idx === -1) {
          return NextResponse.json({ success: false, error: 'ไม่พบข้อความติดต่อที่ระบุ' }, { status: 404 });
        }
        contacts[idx] = {
          ...contacts[idx],
          status: data.status || 'replied',
          adminNote: data.adminNote ?? contacts[idx].adminNote,
        };
        writeJsonSafe(contactsFilePath, contacts);
        return NextResponse.json({
          success: true,
          message: `อัปเดตสถานะข้อความติดต่อ "${contacts[idx].subject}" เรียบร้อยแล้ว`,
          item: contacts[idx],
        });
      }

      return NextResponse.json({ success: false, error: `ไม่รองรับคำสั่งประเภท ${type}` }, { status: 400 });
    }

    // 4. Chat with Gemini Co-Admin
    const userMessage = String(body.message || '').trim();
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = Array.isArray(body.history)
      ? body.history
      : [];

    const members = readJsonSafe<any[]>(membersFilePath, []);
    const products = readJsonSafe<any[]>(storeFilePath, []);
    const contacts = readJsonSafe<any[]>(contactsFilePath, []);
    const overrides = readJsonSafe<Record<string, any>>(overridesFilePath, {});

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        mode: 'local_assistant',
        reply: buildLocalFallbackReply(userMessage, members, products, contacts, overrides),
      });
    }

    // Check if user message contains a Google Docs / Sheets / Drive URL
    let driveAttachmentContext = '';
    const urlMatch = userMessage.match(/https?:\/\/(docs|drive)\.google\.com\/[^\s)]+/);
    const targetDriveUrl = body.driveUrl || (urlMatch ? urlMatch[0] : '');
    if (targetDriveUrl) {
      const extracted = await fetchGoogleDriveText(targetDriveUrl);
      if (extracted.ok) {
        driveAttachmentContext = `\n\n[เนื้อหาที่ดึงสดจากลิงก์ ${extracted.sourceType} (${targetDriveUrl})]:\n${extracted.text}\n`;
      } else {
        driveAttachmentContext = `\n\n[หมายเหตุจากการดึงลิงก์ Google Drive (${targetDriveUrl})]: ${extracted.text}\n`;
      }
    }

    const safeMembersSummary = members.map((m) => ({
      id: m.id,
      memberNumber: m.memberNumber,
      username: m.username,
      name: m.name,
      email: m.email,
      tier: m.tier,
      role: m.role || (m.memberNumber === 1 ? 'admin' : 'member'),
      paymentStatus: m.paymentStatus,
      paymentAmount: m.paymentAmount,
      notes: m.notes,
    }));

    const systemInstruction = `คุณคือ "Fitrah Shield Gemini Co-Admin" ผู้ดูแลระบบร่วมอัจฉริยะของเว็บไซต์ "เกราะพิทักษ์ฟิฏเราะฮฺ (THE FITRAH SHIELD / Safe Soul Project)" (https://thefitrahshield.hardynaipayong.cloud)

## 1. บทบาทและโทนเสียง (Brand Voice)
- สุภาพ ลุ่มลึก ชัดเจนด้วยเหตุผล (Sacred Rationality) ผสานตรรกศาสตร์ วิทยาศาสตร์ จิตวิทยา และเทววิทยาอิสลาม
- ช่วยผู้ดูแลระบบหลัก (Admin) จัดการเนื้อหาบทความ 57 เกาะ (ทะเลน้ำตื้น 7 เกาะ + ทะเลน้ำลึก 50 เกาะ), ร้านค้า Safe for Support, ตารางสมาชิก, การตรวจสลิป, ข้อความติดต่อเรา และการดึงเนื้อหาจาก Google Drive / GitHub

## 2. ข้อมูลสดในฐานข้อมูลเว็บไซต์ขณะนี้ (Real-time Database State)
- **รายการสินค้า Safe for Support (${products.length} รายการ):**
${JSON.stringify(products, null, 2)}

- **รายชื่อสมาชิก (${safeMembersSummary.length} บัญชี):**
${JSON.stringify(safeMembersSummary, null, 2)}

- **ข้อความติดต่อเราล่าสุด (${contacts.length} รายการ):**
${JSON.stringify(contacts.slice(0, 15), null, 2)}

- **บทความที่มีการแก้ไขทับ (Article Overrides):**
${JSON.stringify(Object.keys(overrides))}

## 3. ความสามารถพิเศษในการสั่งงานฐานข้อมูลจริง (Executable Action Cards)
เมื่อแอดมินสั่งให้คุณ **เพิ่ม/แก้ไขสินค้า**, **แก้ไข/เกลาบทความ**, **อนุมัติสลิป/ปรับระดับสมาชิก/ตั้ง Co-Admin**, หรือ **บันทึกสถานะข้อความติดต่อ** ให้คุณตอบอธิบายอย่างชัดเจน และ **ต้องแนบโค้ดบล็อก \`\`\`co-admin-action ... \`\`\`** ไว้ท้ายคำตอบเสมอ เพื่อให้หน้าเว็บสร้างปุ่ม "⚡ กดยืนยันบันทึกเข้าระบบทันที" ให้แอดมินคลิกได้ในคลิกเดียว!

รูปแบบ JSON ในบล็อก \`\`\`co-admin-action\`\`\` ที่รองรับมี 4 ประเภทดังนี้:

1) เพิ่มหรือแก้ไขสินค้าใน Safe for Support:
\`\`\`co-admin-action
{
  "type": "upsert_store_product",
  "label": "บันทึกสินค้า: ชื่อสินค้า",
  "data": {
    "id": "prod-ใหม่หรือที่มีอยู่",
    "slug": "english-slug",
    "title": "ชื่อสินค้า",
    "description": "คำอธิบายสินค้า",
    "type": "physical หรือ digital",
    "price_thb": 590,
    "compare_at_price_thb": 790,
    "badge": "ป้ายกำกับ เช่น Official Merch",
    "stock_quantity": 50,
    "status": "published หรือ draft"
  }
}
\`\`\`

2) แก้ไขหรือเกลาบทความ (Article Override):
\`\`\`co-admin-action
{
  "type": "update_article_override",
  "label": "บันทึกการแก้ไขบทความ",
  "data": {
    "key": "รหัสบทความ เช่น shallow-1 หรือ archipelago-1-1",
    "title": "ชื่อบทความใหม่",
    "excerpt": "คำโปรยสรุปแก่นปัญญา",
    "content": "เนื้อหาบทความฉบับเต็ม (Markdown)",
    "status": "published"
  }
}
\`\`\`

3) อนุมัติสลิปสมาชิก / เปลี่ยนระดับเรือ / แต่งตั้ง Co-Admin:
\`\`\`co-admin-action
{
  "type": "update_member",
  "label": "อัปเดตสิทธิ์สมาชิก",
  "data": {
    "id": "mem_002",
    "tier": "founding_tier_3 หรือ supporter_tier_2 หรือ free_tier_1",
    "role": "admin หรือ co-admin หรือ member",
    "paymentStatus": "verified",
    "notes": "บันทึกเพิ่มเติมจาก Co-Admin"
  }
}
\`\`\`

4) อัปเดตสถานะข้อความติดต่อเราพร้อมบันทึกคำตอบ:
\`\`\`co-admin-action
{
  "type": "update_contact_status",
  "label": "บันทึกสถานะตอบกลับข้อความ",
  "data": {
    "id": "รหัสข้อความ msg_...",
    "status": "replied",
    "adminNote": "ร่างคำตอบหรือบันทึกการดูแล"
  }
}
\`\`\``;

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

    const geminiRes = await callGeminiWithFallback(apiKey, preferredModel, systemInstruction, contents);
    if (!geminiRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `เชื่อมต่อ Gemini API ไม่สำเร็จ: ${geminiRes.error}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: 'gemini_live',
      modelUsed: geminiRes.modelUsed,
      reply: geminiRes.reply,
    });
  } catch (error: any) {
    console.error('POST /api/admin/co-admin error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'เกิดข้อผิดพลาดในระบบ Co-Admin' },
      { status: 500 }
    );
  }
}

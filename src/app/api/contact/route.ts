import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ContactMessage, ContactCategory } from '@/types';

export const dynamic = 'force-dynamic';

const contactFilePath = path.join(process.cwd(), 'data', 'contact_messages.json');

const SEED_MESSAGES: ContactMessage[] = [
  {
    id: 'msg_001',
    category: 'request',
    name: 'คุณอับดุลเลาะฮ์ (ตัวอย่างข้อความ)',
    replyEmail: 'abdullah.example@mail.com',
    phone: '081-234-5678',
    subject: 'ขอเสนอหัวข้อวิเคราะห์เพิ่มเติมเกี่ยวกับเทคโนโลยี AI กับจิตวิญญาณ',
    message:
      'สลามครับ ชื่นชมเนื้อหาชุด 7 เกาะแห่งปัญญามากครับ อยากขอเสนอให้ทีมงานช่วยทำบทความเจาะลึกเรื่องผลกระทบของ AI ต่อการรักษาฟิฏเราะฮฺของเยาวชนในยุคหน้าเพิ่มเติมครับ',
    status: 'new',
    createdAt: '2026-11-01T09:30:00.000Z',
  },
];

function readMessages(): ContactMessage[] {
  try {
    if (!fs.existsSync(contactFilePath)) {
      const dir = path.dirname(contactFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(contactFilePath, JSON.stringify(SEED_MESSAGES, null, 2), 'utf8');
      return SEED_MESSAGES;
    }
    const raw = fs.readFileSync(contactFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading contact messages:', error);
    return [];
  }
}

function writeMessages(messages: ContactMessage[]) {
  const dir = path.dirname(contactFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(contactFilePath, JSON.stringify(messages, null, 2), 'utf8');
}

export async function GET() {
  const messages = readMessages().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({
    success: true,
    total: messages.length,
    unreadCount: messages.filter((m) => m.status === 'new').length,
    items: messages,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category = 'discussion',
      name,
      replyEmail,
      phone,
      subject,
      message,
    } = body as {
      category?: ContactCategory;
      name?: string;
      replyEmail?: string;
      phone?: string;
      subject?: string;
      message?: string;
    };

    if (!name?.trim() || !replyEmail?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อ อีเมลติดต่อกลับ และรายละเอียดข้อความให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const messages = readMessages();
    const nextIdx = messages.length + 1;
    const newItem: ContactMessage = {
      id: `msg_${Date.now()}_${nextIdx}`,
      category,
      name: name.trim(),
      replyEmail: replyEmail.trim(),
      phone: phone?.trim() || '',
      subject: subject?.trim() || 'ข้อความจากหน้าติดต่อเรา',
      message: message.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    messages.unshift(newItem);
    writeMessages(messages);

    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับไปยังอีเมลที่คุณระบุโดยเร็วที่สุด',
    });
  } catch (error) {
    console.error('POST /api/contact error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อความติดต่อ' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, adminNote } = body as {
      id: string;
      status?: 'new' | 'read' | 'replied';
      adminNote?: string;
    };

    const messages = readMessages();
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อความ' }, { status: 404 });
    }

    if (status) messages[idx].status = status;
    if (adminNote !== undefined) messages[idx].adminNote = adminNote;

    writeMessages(messages);
    return NextResponse.json({ success: true, item: messages[idx] });
  } catch (error) {
    console.error('PATCH /api/contact error:', error);
    return NextResponse.json({ success: false, error: 'อัปเดตสถานะไม่สำเร็จ' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสข้อความ' }, { status: 400 });
    }

    const messages = readMessages();
    const filtered = messages.filter((m) => m.id !== id);
    writeMessages(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/contact error:', error);
    return NextResponse.json({ success: false, error: 'ลบข้อความไม่สำเร็จ' }, { status: 500 });
  }
}

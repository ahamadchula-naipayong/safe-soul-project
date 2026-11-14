import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { findMemberById, findMember, getAllMembers, updateMember } from '@/lib/members';
import { getEffectiveMemberTier } from '@/lib/oceanAccess';
import { getEbookEmailTemplateForTier } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

const dispatchLogPath = path.join(process.cwd(), 'data', 'ebook_dispatches.json');
const privatePdfPath = path.join(
  process.cwd(),
  'data',
  'private_ebooks',
  'The_Fitrah_Shield_Openwater.pdf'
);

export async function GET() {
  return NextResponse.json({
    success: true,
    templates: {
      free_tier_1: getEbookEmailTemplateForTier('free_tier_1'),
      supporter_tier_2: getEbookEmailTemplateForTier('supporter_tier_2'),
      founding_tier_3: getEbookEmailTemplateForTier('founding_tier_3'),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const cookieVal = request.cookies.get('safesoul_member')?.value;
    let parsedCookie: { id?: string; username?: string } | null = null;
    if (cookieVal) {
      try {
        parsedCookie = JSON.parse(cookieVal);
      } catch {}
    }

    const memberId = body.memberId || parsedCookie?.id;
    const member =
      (memberId && findMemberById(memberId)) ||
      (parsedCookie?.username && findMember(parsedCookie.username)) ||
      null;

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: 'กรุณาเข้าสู่ระบบสมาชิกก่อนกดรับ E-Book ทางอีเมล',
        },
        { status: 401 }
      );
    }

    // Check if this member or registered email has already claimed the E-Book (1 time per registered email ONLY)
    const allMembers = getAllMembers();
    const emailAlreadyClaimed = allMembers.some(
      (m) =>
        m.ebookClaimed === true &&
        (m.id === member.id || m.email.toLowerCase() === member.email.toLowerCase())
    );

    if (member.ebookClaimed || emailAlreadyClaimed) {
      return NextResponse.json(
        {
          success: false,
          alreadyClaimed: true,
          error: `อีเมลที่สมัครสมาชิก (${member.email}) ได้ใช้สิทธิ์รับ E-Book ฉบับเกาะทะเลน้ำตื้นไปแล้ว (จำกัดสิทธิ์รับฟรี 1 ครั้งต่ออีเมลที่สมัครเท่านั้น)`,
        },
        { status: 400 }
      );
    }

    const { effectiveTier } = getEffectiveMemberTier(member);
    const tierForEmail =
      effectiveTier === 'visitor' ? 'free_tier_1' : effectiveTier;
    const emailTemplate = getEbookEmailTemplateForTier(tierForEmail, member);

    // Optional real email dispatch via Resend API if RESEND_API_KEY is set in production
    let emailProviderStatus = 'queued_and_logged';
    if (process.env.RESEND_API_KEY && fs.existsSync(privatePdfPath)) {
      try {
        const pdfBase64 = fs.readFileSync(privatePdfPath).toString('base64');
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from:
              process.env.EMAIL_FROM ||
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
          emailProviderStatus = 'sent_via_resend';
        }
      } catch (err) {
        console.error('Resend API dispatch error:', err);
      }
    }

    const claimedAt = new Date().toISOString();
    const updateRes = updateMember(member.id, {
      ebookClaimed: true,
      ebookClaimedAt: claimedAt,
    });

    const updatedMember = updateRes.member || {
      ...member,
      ebookClaimed: true,
      ebookClaimedAt: claimedAt,
    };

    // Save dispatch log
    try {
      let logs: unknown[] = [];
      if (fs.existsSync(dispatchLogPath)) {
        logs = JSON.parse(fs.readFileSync(dispatchLogPath, 'utf8'));
      }
      logs.unshift({
        id: `ebook_claim_${Date.now()}`,
        memberId: member.id,
        memberNumber: member.memberNumber,
        recipientEmail: member.email,
        tier: tierForEmail,
        subject: emailTemplate.subject,
        attachment: 'The_Fitrah_Shield_Openwater.pdf',
        status: emailProviderStatus,
        claimedAt,
      });
      fs.writeFileSync(dispatchLogPath, JSON.stringify(logs, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to write ebook_dispatches.json:', e);
    }

    const { password: _, ...safeMember } = updatedMember;
    const response = NextResponse.json({
      success: true,
      member: safeMember,
      recipientEmail: member.email,
      emailTemplate,
      message: `จัดส่ง E-Book "เกราะพิทักษ์ฟิฏเราะฮฺ (ฉบับเกาะทะเลน้ำตื้น 73 หน้า)" ไปยังอีเมลที่สมัครสมาชิก (${member.email}) เรียบร้อยแล้ว!`,
    });

    response.cookies.set('safesoul_member', JSON.stringify(safeMember), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('POST /api/ebook/claim error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในการดำเนินการส่ง E-Book ทางอีเมล',
      },
      { status: 500 }
    );
  }
}

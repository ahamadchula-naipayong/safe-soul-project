import { NextRequest, NextResponse } from 'next/server';
import { findMemberById, findMember, updateMember } from '@/lib/members';
import { TierType } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberCookie = request.cookies.get('safesoul_member');
  if (!memberCookie || !memberCookie.value) {
    return NextResponse.json({ authenticated: false, member: null });
  }

  try {
    const parsed = JSON.parse(memberCookie.value);
    const fresh =
      (parsed?.id && findMemberById(parsed.id)) ||
      (parsed?.username && findMember(parsed.username)) ||
      null;

    if (!fresh) {
      return NextResponse.json({ authenticated: false, member: null });
    }

    const { password: _, ...safeMember } = fresh;
    const response = NextResponse.json({ authenticated: true, member: safeMember });
    response.cookies.set('safesoul_member', JSON.stringify(safeMember), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return response;
  } catch {
    return NextResponse.json({ authenticated: false, member: null });
  }
}

/**
 * PATCH /api/auth/me -> Allow logged-in member to submit QR Slip Upgrade or update phone
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      memberId,
      tier,
      phone,
      paymentSlipDataUrl,
      paymentAmount,
      billingCycle,
    } = body as {
      memberId: string;
      tier?: TierType;
      phone?: string;
      paymentSlipDataUrl?: string;
      paymentAmount?: number;
      billingCycle?: 'free' | 'monthly' | 'yearly' | 'lifetime';
    };

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสสมาชิก' }, { status: 400 });
    }

    if ((tier === 'supporter_tier_2' || tier === 'founding_tier_3') && !paymentSlipDataUrl) {
      return NextResponse.json(
        { success: false, error: 'กรุณาแนบสลิปการโอนเงินเพื่อยืนยันการอัปเกรดระดับสมาชิก' },
        { status: 400 }
      );
    }

    const result = updateMember(memberId, {
      ...(tier ? { tier } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(paymentAmount !== undefined ? { paymentAmount } : {}),
      ...(billingCycle ? { billingCycle } : {}),
      ...(tier && tier !== 'free_tier_1' ? { paymentStatus: 'pending_verification' } : {}),
      paymentSlipDataUrl,
    });

    if (!result.success || !result.member) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const { password: _, ...safeMember } = result.member;
    const response = NextResponse.json({
      success: true,
      member: safeMember,
      message: 'ส่งหลักฐานการโอนเงินเรียบร้อยแล้ว รอแอดมินตรวจสอบและอนุมัติสิทธิ์',
    });

    response.cookies.set('safesoul_member', JSON.stringify(safeMember), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('PATCH /api/auth/me error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลสมาชิก' },
      { status: 500 }
    );
  }
}

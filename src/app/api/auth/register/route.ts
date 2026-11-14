import { NextRequest, NextResponse } from 'next/server';
import { registerMember, getNextMemberNumber } from '@/lib/members';

export const dynamic = 'force-dynamic';

export async function GET() {
  const nextNumber = getNextMemberNumber();
  return NextResponse.json({ nextMemberNumber: nextNumber });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      phone,
      password,
      name,
      tier,
      paymentSlipDataUrl,
      paymentAmount,
      billingCycle,
    } = body;

    const result = registerMember({
      username,
      email,
      phone,
      password,
      name,
      tier,
      paymentSlipDataUrl,
      paymentAmount,
      billingCycle,
    });

    if (!result.success || !result.member) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { password: _, ...safeMember } = result.member;

    const response = NextResponse.json({
      success: true,
      member: safeMember,
      message: `ลงทะเบียนสำเร็จ! คุณได้รับการบันทึกเป็น Member ลำดับที่ #${safeMember.memberNumber}`,
    });

    response.cookies.set('safesoul_member', JSON.stringify(safeMember), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' }, { status: 500 });
  }
}

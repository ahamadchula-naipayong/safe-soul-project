import { NextRequest, NextResponse } from 'next/server';
import { authenticateMember } from '@/lib/members';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const result = authenticateMember(username, password);
    if (!result.success || !result.member) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    // Do not return password to client
    const { password: _, ...safeMember } = result.member;

    const response = NextResponse.json({
      success: true,
      member: safeMember,
      message: `เข้าสู่ระบบสำเร็จ! คุณคือ Member ลำดับที่ #${safeMember.memberNumber}`,
    });

    // Store simple auth cookie
    response.cookies.set('safesoul_member', JSON.stringify(safeMember), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}

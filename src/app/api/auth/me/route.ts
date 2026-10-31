import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberCookie = request.cookies.get('safesoul_member');
  if (!memberCookie || !memberCookie.value) {
    return NextResponse.json({ authenticated: false, member: null });
  }

  try {
    const member = JSON.parse(memberCookie.value);
    return NextResponse.json({ authenticated: true, member });
  } catch {
    return NextResponse.json({ authenticated: false, member: null });
  }
}

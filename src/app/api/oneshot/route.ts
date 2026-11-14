import { NextResponse } from 'next/server';
import { getAllOneshotChapters } from '@/lib/oneshot';

export async function GET() {
  try {
    const chapters = await getAllOneshotChapters();
    return NextResponse.json({
      success: true,
      total: chapters.length,
      chapters,
      items: chapters,
    });
  } catch (error) {
    console.error('API /api/oneshot error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load oneshot chapters' },
      { status: 500 }
    );
  }
}

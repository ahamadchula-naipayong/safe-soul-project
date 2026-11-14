import { NextRequest, NextResponse } from 'next/server';
import { getNewsById, getAdjacentNews } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const news = await getNewsById(params.id);
    if (!news) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข่าวสารที่ค้นหา' },
        { status: 404 }
      );
    }
    const { prev, next } = await getAdjacentNews(news.id);
    return NextResponse.json({
      success: true,
      news,
      prev,
      next,
    });
  } catch (error) {
    console.error('Error in /api/news/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการโหลดข่าวสาร' },
      { status: 500 }
    );
  }
}

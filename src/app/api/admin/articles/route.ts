import { NextResponse } from 'next/server';
import { saveDeepOceanArticleOverride, getAllDeepOceanArchipelagos } from '@/lib/deepOcean';

export async function GET() {
  try {
    const archipelagos = await getAllDeepOceanArchipelagos();
    return NextResponse.json({
      success: true,
      items: archipelagos,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { articleKey, updates } = body;

    if (!articleKey || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing articleKey or updates' },
        { status: 400 }
      );
    }

    const saved = saveDeepOceanArticleOverride(articleKey, updates);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save changes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article updated successfully',
    });
  } catch (error) {
    console.error('API /api/admin/articles error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

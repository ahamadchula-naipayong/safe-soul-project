import { NextRequest, NextResponse } from 'next/server';
import { getNewsList } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const search = searchParams.get('search') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const sortBy = (searchParams.get('sortBy') as 'latest' | 'oldest') || 'latest';

    const result = await getNewsList({
      page,
      limit,
      search,
      subcategory,
      sortBy,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news', items: [], total: 0, totalPages: 0, page: 1 },
      { status: 500 }
    );
  }
}

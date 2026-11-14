import { NextResponse } from 'next/server';
import { getAllOneshotChapters } from '@/lib/oneshot';
import { getAllDeepOceanArchipelagos } from '@/lib/deepOcean';

export async function GET() {
  try {
    const [shallowWaters, deepOcean] = await Promise.all([
      getAllOneshotChapters(),
      getAllDeepOceanArchipelagos(),
    ]);

    return NextResponse.json({
      success: true,
      title: 'มุ่งสู่ทะเลอันไร้ที่สิ้นสุดกัน',
      shallowWaters: {
        title: 'ทะเลน้ำตื้น',
        concept: 'หัดอ่านคลื่นลมก่อนลงสู่ทะเลหลัก — ทะเลเปิดเพื่อการเรียนรู้สำหรับทุกคน',
        totalIslands: shallowWaters.length,
        items: shallowWaters,
      },
      deepOcean: {
        title: 'ทะเลน้ำลึก',
        concept: 'มหาสมุทรที่เต็มไปด้วยความงดงาม และสิ่งล่อลวง — 10 หมู่เกาะแห่งปัญญา',
        totalArchipelagos: deepOcean.length,
        activeArchipelagos: deepOcean.filter((a) => a.status === 'published').length,
        upcomingArchipelagos: deepOcean.filter((a) => a.status === 'upcoming').length,
        items: deepOcean,
      },
    });
  } catch (error) {
    console.error('API /api/ocean error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load ocean data' },
      { status: 500 }
    );
  }
}

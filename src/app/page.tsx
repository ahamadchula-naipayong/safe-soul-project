import { getAllOneshotChapters } from '@/lib/oneshot';
import { getAllDeepOceanArchipelagos } from '@/lib/deepOcean';
import { getNewsList } from '@/lib/news';
import { HomePageClient } from './HomePageClient';

export const metadata = {
  title: 'The Fitrah Shield | 4 มิติแห่งปัญญา • เกราะกำบังจิตวิญญาณเดิมแท้',
  description:
    'มุ่งสู่ทะเลอันไร้ที่สิ้นสุดกัน: การผจญภัยผ่านทะเลน้ำตื้น (7 เกาะแห่งปัญญา) และทะเลน้ำลึก (10 หมู่เกาะ) พร้อมสำนักข่าว The Key of Return',
};

export default async function HomePage() {
  const [shallowChapters, deepArchipelagos, newsRes] = await Promise.all([
    getAllOneshotChapters(),
    getAllDeepOceanArchipelagos(),
    getNewsList({ page: 1, limit: 10, sortBy: 'latest' }),
  ]);

  return (
    <HomePageClient
      chapters={shallowChapters}
      deepArchipelagos={deepArchipelagos}
      latestNews={newsRes.items}
    />
  );
}

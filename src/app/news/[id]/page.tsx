import React from 'react';
import { Metadata } from 'next';
import { getNewsById, getAdjacentNews, getAllNews } from '@/lib/news';
import NewsDetailClient from './NewsDetailClient';

interface NewsDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const allNews = await getAllNews();
  // Pre-render the _dynamic shell (used by Cloudflare Pages Function for all 4,640 news slugs) plus the latest 24 news items
  return [
    { id: '_dynamic' },
    ...allNews.slice(0, 24).map((item) => ({
      id: item.slug,
    })),
  ];
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  if (params.id === '_dynamic') {
    return {
      title: 'รายงานข่าวเจาะลึก | สำนักข่าว The Key of Return',
      description: 'วิเคราะห์สถานการณ์โลกและภูมิรัฐศาสตร์ โดยสำนักข่าว The Key of Return',
    };
  }
  const news = await getNewsById(params.id);
  if (!news) {
    return {
      title: 'สำนักข่าว The Key of Return | The Fitrah Shield',
    };
  }

  return {
    title: `${news.title} | สำนักข่าว The Key of Return`,
    description: news.excerpt,
    openGraph: {
      title: news.title,
      description: news.excerpt,
      images: news.image ? [{ url: news.image }] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  if (params.id === '_dynamic') {
    return <NewsDetailClient slugId="_dynamic" />;
  }

  const news = await getNewsById(params.id);
  const adjacent = news ? await getAdjacentNews(news.id) : { prev: null, next: null };

  return (
    <NewsDetailClient
      slugId={params.id}
      initialNews={news}
      initialPrev={adjacent.prev}
      initialNext={adjacent.next}
    />
  );
}

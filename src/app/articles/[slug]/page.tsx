import React from 'react';
import Link from 'next/link';
import { mockChapters } from '@/lib/supabase/mockData';
import ArticlePageClient from './ArticlePageClient';

export async function generateStaticParams() {
  if (mockChapters.length === 0) {
    return [{ slug: 'safe-from-the-dunya' }];
  }
  return mockChapters.map((c) => ({
    slug: c.slug,
  }));
}

export default function ArticlePage() {
  if (mockChapters.length === 0) {
    return (
      <div className="min-h-screen bg-slate-dark text-parchment-cream flex items-center justify-center p-6 font-thai">
        <div className="max-w-md w-full p-8 rounded-3xl bg-emerald-card/70 border border-gold-warm/40 text-center space-y-4">
          <h1 className="text-2xl font-thai-serif font-bold text-gold-light">
            ย้ายคลังบทความสู่ Safe for Journey
          </h1>
          <p className="text-xs sm:text-sm text-parchment-muted">
            คุณสามารถอ่านและฟังบทความทั้ง 7 เกาะทะเลน้ำตื้น และ 10 หมู่เกาะทะเลน้ำลึก (50 บท) ได้ที่หน้าคลังบทความหลัก
          </p>
          <Link
            href="/journey"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs"
          >
            เข้าสู่คลังบทความ Safe for Journey →
          </Link>
        </div>
      </div>
    );
  }
  return <ArticlePageClient />;
}

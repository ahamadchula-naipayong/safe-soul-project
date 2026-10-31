import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  Calendar,
  ExternalLink,
  Film,
  ArrowLeft,
  ArrowDown,
  Compass,
  Share2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Layers,
} from 'lucide-react';
import { getNewsById, getAdjacentNews } from '@/lib/news';
import { NewsContentGate } from '@/components/NewsContentGate';
import { Member } from '@/types';

interface NewsDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const news = await getNewsById(params.id);
  if (!news) {
    return {
      title: 'ไม่พบข่าวสาร | The Safe Soul Project',
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
  const news = await getNewsById(params.id);

  if (!news) {
    notFound();
  }

  const { prev, next } = await getAdjacentNews(news.id);

  // Read member from session cookie (server-side)
  const cookieStore = cookies();
  const memberCookie = cookieStore.get('safesoul_member');
  let initialMember: Member | null = null;
  if (memberCookie?.value) {
    try {
      const val = memberCookie.value;
      initialMember = JSON.parse(val.startsWith('%') ? decodeURIComponent(val) : val);
    } catch {
      try {
        initialMember = JSON.parse(decodeURIComponent(memberCookie.value));
      } catch {}
    }
  }

  return (
    <div className="relative min-h-screen text-parchment-cream font-thai selection:bg-gold-warm selection:text-slate-abyss">
      {/* ------------------------------------------------------------------ */}
      {/* 1. FIXED BACKGROUND IMAGE (URL จากไฟล์ นำมาเป็น Background Fixed)    */}
      {/* ------------------------------------------------------------------ */}
      {news.image && (
        <div
          className="fixed inset-0 w-full h-full -z-30 bg-cover bg-center bg-fixed transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: `url('${news.image}')`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Hero Ambient Gradient Overlay (หน้าแรก เพื่อให้ตัวอักษรคมชัด) */}
      <div
        className="fixed inset-0 w-full h-full -z-20 bg-gradient-to-b from-black/85 via-black/60 to-black/90 pointer-events-none"
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------------ */}
      {/* 2. HERO FIRST VIEWPORT (Topic ข่าวใหญ่ / วันที่ / แหล่งอ้างอิง / คลิปลิ้งค์) */}
      {/* ------------------------------------------------------------------ */}
      <header className="min-h-screen flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-8 pb-12 relative z-10">
        {/* Top Bar: Back Link & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 hover:border-gold-warm/50 text-xs sm:text-sm font-medium text-parchment-cream hover:text-gold-light transition shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-gold-warm group-hover:-translate-x-1 transition-transform" />
            <span>ย้อนกลับไปหน้ารวมข่าว</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-xs font-bold text-gold-light border border-gold-warm/40 font-mono shadow-sm">
              {news.korNo}
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-950/80 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-emerald-500/40 shadow-sm">
              {news.subcategory}
            </span>
          </div>
        </div>

        {/* Center: Topic ข่าวใหญ่ & วันที่ */}
        <div className="my-auto py-12 max-w-5xl space-y-6">
          {/* Subtitle / Category Label */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gold-warm font-semibold tracking-wider uppercase font-thai">
            <Compass className="w-4 h-4 text-gold-warm" />
            <span>สำนักข่าว The Key of Return • วิเคราะห์สถานการณ์โลกและภูมิรัฐศาสตร์</span>
          </div>

          {/* พาดหัวข่าวใหญ่ (Large Bold Headline) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-thai-serif font-black text-parchment-cream leading-[1.2] tracking-tight drop-shadow-2xl text-balance">
            {news.title}
          </h1>

          {/* รองด้วยวันที่ขนาดพอดีอ่าน */}
          <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base text-gold-light/95 font-thai">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
              <Calendar className="w-4 h-4 text-gold-warm" />
              <time dateTime={news.date}>{news.dateFormatted}</time>
            </div>
            <span className="text-white/40">•</span>
            <span className="text-parchment-muted/90 text-xs sm:text-sm">
              {news.sections.length} ส่วนเนื้อหาเจาะลึก
            </span>
          </div>
        </div>

        {/* Bottom Area: Scroll Indicator (Center) & Reference/Video Links (Right) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
          {/* Scroll Down Indicator (ตามภาพสเก็ตช์ลูกศรชี้ลง) */}
          <a
            href="#content-body"
            className="flex items-center gap-2 text-xs sm:text-sm text-gold-light hover:text-white transition group animate-pulse"
          >
            <span>เลื่อนลงเพื่ออ่านรายละเอียด</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </a>

          {/* Bottom Right: แหล่งอ้างอิง (URL) และ/หรือ คลิปลิ้งค์ (หากมี) */}
          <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
            {/* คลิปลิ้งค์ (Video Clip Link) */}
            {news.video && (
              <a
                href={news.video}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-semibold shadow-sm transition hover:scale-105"
                title="เปิดดูคลิปวิดีโอต้นฉบับ"
              >
                <Film className="w-4 h-4" />
                <span>คลิปลิ้งค์วิดีโอ</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}

            {/* แหล่งอ้างอิง (Source Reference Link) */}
            {news.source && (
              <a
                href={news.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-emerald-border hover:border-gold-warm/40 text-xs text-parchment-muted hover:text-parchment-cream transition shadow-sm group"
                title={`เปิดแหล่งข่าวต้นฉบับ: ${news.source}`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-gold-warm group-hover:rotate-12 transition-transform" />
                <span>แหล่งอ้างอิง (Source)</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 3. SCROLLED CONTENT SECTIONS (Optical Black Drop & Content 1..5)   */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="content-body"
        className="relative z-10 bg-[#050D09]/95 backdrop-blur-2xl border-t border-emerald-border/60 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-3xl mx-auto space-y-16">
          {/* Access-Gated Content Render Component */}
          <NewsContentGate
            sections={news.sections}
            news={{
              id: news.id,
              korNo: news.korNo,
              slug: news.slug,
              title: news.title,
              topicLead: news.topicLead,
              subcategory: news.subcategory,
              excerpt: news.excerpt,
              image: news.image,
              date: news.date,
              dateFormatted: news.dateFormatted,
              source: news.source,
              video: news.video,
            }}
            initialMember={initialMember}
          />

          {/* ---------------------------------------------------------------- */}
          {/* 4. FOOTER: BIG BACK TO NEWS BUTTON (ตามที่ระบุในภาพสเก็ตช์)           */}
          {/* ---------------------------------------------------------------- */}
          <div className="pt-12 border-t border-emerald-border/60 space-y-10">
            {/* Big [Back News] Button */}
            <div className="text-center">
              <Link
                href="/news"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl gold-bevel-button text-slate-abyss text-base sm:text-lg font-thai-serif font-black shadow-gold-luxury hover:brightness-105 active:scale-95 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
                <span>ย้อนกลับไปหน้ารวมข่าว (Back to News)</span>
              </Link>
            </div>

            {/* Source Reference & Video Summary Box */}
            <div className="p-6 rounded-2xl bg-black/60 border border-emerald-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-parchment-muted">
              <div className="space-y-1">
                <div className="text-gold-light font-bold">ข้อมูลการเผยแพร่:</div>
                <div>วันที่: {news.dateFormatted} • รหัสอ้างอิง: {news.korNo}</div>
              </div>

              <div className="flex items-center gap-3">
                {news.source && (
                  <a
                    href={news.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/30 text-parchment-cream hover:text-gold-light transition flex items-center gap-1.5"
                  >
                    <span>ไปยังเว็บไซต์ต้นทาง</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Adjacent News Navigation (ก่อนหน้า / ถัดไป) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {prev ? (
                <Link
                  href={`/news/${prev.slug}`}
                  className="p-5 rounded-2xl bg-emerald-card/70 hover:bg-emerald-surface border border-emerald-border/70 hover:border-gold-warm/40 transition group space-y-1.5"
                >
                  <div className="text-[11px] text-gold-warm flex items-center gap-1 font-semibold">
                    <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    <span>ข่าวก่อนหน้า</span>
                  </div>
                  <div className="text-xs sm:text-sm font-thai-serif font-bold text-parchment-cream line-clamp-2">
                    {prev.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link
                  href={`/news/${next.slug}`}
                  className="p-5 rounded-2xl bg-emerald-card/70 hover:bg-emerald-surface border border-emerald-border/70 hover:border-gold-warm/40 transition group space-y-1.5 text-right sm:text-right"
                >
                  <div className="text-[11px] text-gold-warm flex items-center justify-end gap-1 font-semibold">
                    <span>ข่าวถัดไป</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-xs sm:text-sm font-thai-serif font-bold text-parchment-cream line-clamp-2">
                    {next.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

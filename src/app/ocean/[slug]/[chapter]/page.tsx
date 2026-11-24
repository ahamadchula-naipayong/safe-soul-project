import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Compass,
  Clock,
  Anchor,
  Layers,
  Sparkles,
  BookOpen,
  Calendar,
  Lock,
} from 'lucide-react';
import { getDeepOceanSubIsland, getAllDeepOceanArchipelagos } from '@/lib/deepOcean';
import {
  formatThaiScheduleDate,
  getDeepOceanScheduleWeek,
  isReleasedBySchedule,
} from '@/lib/releaseSchedule';
import { ArticleActionToolbar } from '@/components/ArticleActionToolbar';
import { OceanContentGate } from '@/components/OceanContentGate';
import { ArticleCoffeeSupport } from '@/components/ArticleCoffeeSupport';

interface DeepOceanReaderPageProps {
  params: {
    slug: string;
    chapter: string;
  };
}

export async function generateStaticParams() {
  const archipelagos = await getAllDeepOceanArchipelagos();
  const params: { slug: string; chapter: string }[] = [];

  archipelagos.forEach((arch) => {
    arch.subIslands.forEach((sub) => {
      params.push({
        slug: arch.slug,
        chapter: String(sub.chapterNumber),
      });
    });
  });

  return params;
}

export async function generateMetadata({
  params,
}: DeepOceanReaderPageProps): Promise<Metadata> {
  const data = await getDeepOceanSubIsland(params.slug, parseInt(params.chapter, 10));
  if (!data) {
    return {
      title: 'ไม่พบบทเรียน | The Fitrah Shield',
    };
  }

  const { archipelago, subIsland } = data;
  return {
    title: `${subIsland.title} | ${archipelago.titleEn} • The Fitrah Shield`,
    description: subIsland.excerpt,
    openGraph: {
      title: `${subIsland.title} | The Fitrah Shield`,
      description: subIsland.excerpt,
      images: archipelago.coverImage ? [{ url: archipelago.coverImage }] : [],
    },
  };
}

export default async function DeepOceanReaderPage({
  params,
}: DeepOceanReaderPageProps) {
  const chapterNumber = parseInt(params.chapter, 10);
  if (isNaN(chapterNumber)) notFound();

  const data = await getDeepOceanSubIsland(params.slug, chapterNumber);
  if (!data) notFound();

  const { archipelago, subIsland, prev, next } = data;

  return (
    <div className="relative min-h-screen text-parchment-cream font-thai selection:bg-gold-warm selection:text-slate-abyss">
      {/* ------------------------------------------------------------------ */}
      {/* 1. FIXED BACKGROUND IMAGE                                          */}
      {/* ------------------------------------------------------------------ */}
      {(subIsland.coverImage || archipelago.coverImage) && (
        <div
          className="fixed inset-0 w-full h-full -z-30 bg-cover bg-center bg-scroll lg:bg-fixed transition-all duration-700 pointer-events-none print:hidden"
          style={{
            backgroundImage: `url('${subIsland.coverImage || archipelago.coverImage}')`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Hero Ambient Gradient Overlay */}
      <div
        className="article-hero-scrim fixed inset-0 w-full h-full -z-20 bg-gradient-to-b from-black/90 via-black/75 to-black/95 pointer-events-none print:hidden"
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------------ */}
      {/* 2. HERO FIRST VIEWPORT                                             */}
      {/* ------------------------------------------------------------------ */}
      <header className="min-h-[68vh] sm:min-h-[75vh] lg:min-h-[88vh] flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-5 sm:pt-8 pb-8 sm:pb-12 relative z-10">
        {/* Top Bar: Back Link, Action Toolbar & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <Link
            href="/journey"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 hover:border-gold-warm/50 text-xs sm:text-sm font-medium text-parchment-cream hover:text-gold-light transition shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-gold-warm group-hover:-translate-x-1 transition-transform" />
            <span>ย้อนกลับสู่คลังบทความ</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ArticleActionToolbar
              title={`${subIsland.title} (${archipelago.titleEn})`}
              description={subIsland.excerpt}
              audioTrack={{
                id: `ocean-${archipelago.slug}-${subIsland.chapterNumber}`,
                title: subIsland.title,
                seriesTitle: archipelago.titleEn,
                chapterNumber: subIsland.chapterNumber,
                audioUrl: subIsland.audioUrl,
                duration: `${subIsland.readingTimeMinutes || 15} นาที`,
                coverImage: subIsland.coverImage || archipelago.coverImage,
                realm: 'deep',
                archipelagoNumber: archipelago.archipelagoNumber,
                isUnlocked: subIsland.isUnlocked,
                status: subIsland.status,
                publishedAt: subIsland.publishedAt,
              }}
            />

            <div className="hidden md:flex items-center gap-2 font-mono">
              <span className="px-3 py-1 rounded-xl bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 text-xs font-bold">
                ทะเลน้ำลึก • หมู่เกาะ {archipelago.archipelagoNumber}
              </span>
              <span className="px-3 py-1 rounded-xl bg-gold-warm text-slate-abyss text-xs font-black uppercase tracking-wider shadow-gold-sm">
                เกาะย่อยที่ {subIsland.chapterNumber} / 5
              </span>
            </div>
          </div>
        </div>

        {/* Center: Title & Subtitle */}
        <div className="my-auto py-12 max-w-5xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gold-warm font-semibold tracking-wider uppercase font-thai">
            <Anchor className="w-4 h-4 text-gold-warm" />
            <span>
              {archipelago.titleEn} • เกาะย่อยที่ {subIsland.chapterNumber}
            </span>
          </div>

          {/* พาดหัวใหญ่ (Large Bold Headline) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-thai-serif font-black text-parchment-cream leading-[1.2] tracking-tight drop-shadow-2xl text-balance">
            {subIsland.title}
          </h1>

          {/* Thai Subtitle of Archipelago */}
          <h2 className="text-lg sm:text-2xl font-thai-serif font-bold text-gold-light leading-snug max-w-4xl">
            {archipelago.titleTh}
          </h2>

          {/* Excerpt Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-gold-warm/30 max-w-3xl space-y-1.5 shadow-lg">
            <div className="text-[11px] font-mono uppercase tracking-wider text-gold-warm font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>แก่นสาระการเดินทาง (Ocean Focus):</span>
            </div>
            <p className="text-sm sm:text-base text-parchment-cream/95 font-light leading-relaxed">
              {subIsland.excerpt}
            </p>
          </div>

          {/* Reading Time & Official Publication Schedule Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gold-light/90 font-thai pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 font-mono">
              <Clock className="w-3.5 h-3.5 text-gold-warm" />
              <span>เวลาอ่านประมาณ {subIsland.readingTimeMinutes} นาที</span>
            </div>
            {subIsland.publishedAt && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md border font-thai ${
                  isReleasedBySchedule(subIsland.publishedAt)
                    ? 'bg-emerald-950/75 border-emerald-400/40 text-emerald-200'
                    : 'bg-amber-950/80 border-gold-warm/50 text-gold-light'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-gold-warm shrink-0" />
                <span>
                  {isReleasedBySchedule(subIsland.publishedAt)
                    ? 'เผยแพร่แล้วเมื่อ: '
                    : 'กำหนดเผยแพร่: '}
                  <strong>{formatThaiScheduleDate(subIsland.publishedAt, true)}</strong> (
                  {getDeepOceanScheduleWeek(
                    archipelago.archipelagoNumber,
                    subIsland.chapterNumber
                  )}
                  )
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Area: Scroll Indicator */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
          <a
            href="#chapter-content"
            className="flex items-center gap-2 text-xs sm:text-sm text-gold-light hover:text-white transition group animate-pulse"
          >
            <span>เลื่อนลงเพื่ออ่านเนื้อหาฉบับเต็ม</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </a>

          <div className="text-xs text-parchment-muted font-mono">
            {archipelago.titleEn} • Sub-Island {subIsland.chapterNumber} of 5
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 3. SCROLLED CONTENT AREA                                           */}
      {/* ------------------------------------------------------------------ */}
      <main
        id="chapter-content"
        className="relative z-10 bg-[#040C08]/95 backdrop-blur-2xl border-t border-emerald-border/60 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Sub-Island Navigation Quick Tabs */}
          <div className="p-4 rounded-2xl bg-black/60 border border-emerald-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-gold-light font-bold text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>5 เกาะย่อยของหมู่เกาะนี้:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {archipelago.subIslands.map((sub) => {
                const isCurrent = sub.chapterNumber === subIsland.chapterNumber;
                return (
                  <Link
                    key={sub.chapterNumber}
                    href={`/ocean/${archipelago.slug}/${sub.chapterNumber}`}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                      isCurrent
                        ? 'bg-gold-warm text-slate-abyss font-bold shadow-sm'
                        : 'bg-emerald-surface/60 hover:bg-gold-warm hover:text-slate-abyss text-parchment-cream'
                    }`}
                  >
                    เกาะ {sub.chapterNumber}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Tier-Gated Markdown Article Content & Deep Ocean Audio Bar */}
          <OceanContentGate
            content={subIsland.content}
            excerpt={subIsland.excerpt}
            archipelagoSlug={archipelago.slug}
            archipelagoNumber={archipelago.archipelagoNumber}
            archipelagoTitleTh={archipelago.titleTh}
            archipelagoTitleEn={archipelago.titleEn}
            chapterNumber={subIsland.chapterNumber}
            chapterTitle={subIsland.title}
            isUnlocked={subIsland.isUnlocked}
            status={subIsland.status}
            publishedAt={subIsland.publishedAt}
            audioUrl={subIsland.audioUrl}
            audioDuration={`${subIsland.readingTimeMinutes || 18} นาที`}
            coverImage={subIsland.coverImage || archipelago.coverImage}
          />

          {/* ---------------------------------------------------------------- */}
          {/* 4. FOOTER: COFFEE SUPPORT, ACTION TOOLBAR, BACK & NEXT SUB-ISLAND */}
          {/* ---------------------------------------------------------------- */}
          <div className="pt-12 border-t border-emerald-border/60 space-y-10">
            {/* End of Article Coffee Support & 10% Charity QR ("Cofffee") */}
            <ArticleCoffeeSupport articleTitle={`${subIsland.title} (${archipelago.titleEn})`} />

            {/* Share & Print Toolbar in Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-black/60 border border-emerald-border/60">
              <div className="text-xs text-parchment-muted">
                ส่งต่อความรู้และภูมิคุ้มกันทางจิตวิญญาณ:
              </div>
              <ArticleActionToolbar
                title={`${subIsland.title} (${archipelago.titleEn})`}
                description={subIsland.excerpt}
                audioTrack={{
                  id: `ocean-${archipelago.slug}-${subIsland.chapterNumber}`,
                  title: subIsland.title,
                  seriesTitle: archipelago.titleEn,
                  chapterNumber: subIsland.chapterNumber,
                  audioUrl: subIsland.audioUrl,
                  duration: `${subIsland.readingTimeMinutes || 15} นาที`,
                  coverImage: subIsland.coverImage || archipelago.coverImage,
                  realm: 'deep',
                  archipelagoNumber: archipelago.archipelagoNumber,
                  isUnlocked: subIsland.isUnlocked,
                  status: subIsland.status,
                  publishedAt: subIsland.publishedAt,
                }}
              />
            </div>

            {/* Adjacent Sub-Island Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {prev ? (
                <Link
                  href={`/ocean/${archipelago.slug}/${prev.chapterNumber}`}
                  className="p-5 rounded-2xl bg-emerald-card/70 hover:bg-emerald-surface border border-emerald-border/70 hover:border-gold-warm/40 transition group space-y-1.5 text-left"
                >
                  <div className="text-xs text-parchment-muted/70 flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>เกาะย่อยก่อนหน้า (บทที่ {prev.chapterNumber})</span>
                  </div>
                  <div className="font-bold text-sm text-gold-light group-hover:text-gold-warm transition line-clamp-1">
                    {prev.title}
                  </div>
                </Link>
              ) : (
                <div className="p-5 rounded-2xl bg-black/30 border border-white/5 text-xs text-parchment-muted/50 flex items-center justify-center">
                  นี่คือเกาะย่อยแรก (บทที่ 1) ของหมู่เกาะนี้
                </div>
              )}

              {next ? (
                <Link
                  href={`/ocean/${archipelago.slug}/${next.chapterNumber}`}
                  className="p-5 rounded-2xl bg-emerald-card/70 hover:bg-emerald-surface border border-emerald-border/70 hover:border-gold-warm/40 transition group space-y-1.5 text-right"
                >
                  <div className="text-xs text-parchment-muted/70 flex items-center justify-end gap-1">
                    <span>เกาะย่อยถัดไป (บทที่ {next.chapterNumber})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="font-bold text-sm text-gold-light group-hover:text-gold-warm transition line-clamp-1">
                    {next.title}
                  </div>
                </Link>
              ) : (
                <div className="p-5 rounded-2xl bg-black/30 border border-white/5 text-xs text-parchment-muted/50 flex items-center justify-center">
                  สิ้นสุด 5 เกาะย่อยของหมู่เกาะนี้
                </div>
              )}
            </div>

            {/* Big Back to Ocean Button */}
            <div className="text-center pt-4">
              <Link
                href="/journey"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl gold-bevel-button text-slate-abyss text-base sm:text-lg font-thai-serif font-black shadow-gold-luxury hover:brightness-105 active:scale-95 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
                <span>ย้อนกลับสู่คลังบทความ Safe for Journey</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

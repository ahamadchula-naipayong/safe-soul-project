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
  Layers,
  Sparkles,
  BookOpen,
  Share2,
  CheckCircle2,
  Anchor,
  Shield,
  Eye,
  Heart,
  Scale,
  Bookmark,
} from 'lucide-react';
import {
  getOneshotChapterBySlug,
  getAdjacentOneshotChapter,
  getAllOneshotChapters,
} from '@/lib/oneshot';
import { formatThaiScheduleDate } from '@/lib/releaseSchedule';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ArticleActionToolbar } from '@/components/ArticleActionToolbar';
import { OneshotAudioSuite } from '@/components/OneshotAudioSuite';
import { ArticleCoffeeSupport } from '@/components/ArticleCoffeeSupport';
import { OneshotSectionKey } from '@/types';

interface OneshotDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const chapters = await getAllOneshotChapters();
  return chapters.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({
  params,
}: OneshotDetailPageProps): Promise<Metadata> {
  const chapter = await getOneshotChapterBySlug(params.slug);
  if (!chapter) {
    return {
      title: 'ไม่พบบทเรียน | The Safe Soul',
    };
  }

  return {
    title: `เกาะที่ ${chapter.chapterNumber}: ${chapter.titleEn} | The Fitrah Shield`,
    description: chapter.coreFocus,
    openGraph: {
      title: `${chapter.titleEn}: ${chapter.titleTh} | The Fitrah Shield`,
      description: chapter.coreFocus,
      images: chapter.image ? [{ url: chapter.image }] : [],
    },
  };
}

const SECTION_BADGES: Record<
  OneshotSectionKey,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  topics: { label: 'TOPICS • สรุปประเด็นสำคัญ', icon: Bookmark, color: 'text-gold-light border-gold-warm/40 bg-gold-warm/15' },
  intro: { label: 'เนื้อหาเกริ่นนำ • NARRATIVE LEAD', icon: BookOpen, color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/80' },
  self: { label: 'S — SELF • มิติแห่งตน', icon: Shield, color: 'text-amber-300 border-amber-400/40 bg-amber-950/80' },
  awareness: { label: 'A — AWARENESS • มิติการตื่นรู้', icon: Eye, color: 'text-sky-300 border-sky-400/40 bg-sky-950/80' },
  faith: { label: 'F — FAITH • มิติความศรัทธา', icon: Heart, color: 'text-emerald-300 border-emerald-400/40 bg-emerald-950/80' },
  ethics: { label: 'E — ETHICS • มิติจริยธรรมเชิงประจักษ์', icon: Scale, color: 'text-indigo-300 border-indigo-400/40 bg-indigo-950/80' },
  conclusion: { label: 'บทสรุปส่งท้าย พร้อมอ้างอิงเอกสาร', icon: Sparkles, color: 'text-gold-light border-gold-warm/40 bg-black/80' },
};

export default async function OneshotDetailPage({ params }: OneshotDetailPageProps) {
  const chapter = await getOneshotChapterBySlug(params.slug);

  if (!chapter) {
    notFound();
  }

  const { prev, next } = await getAdjacentOneshotChapter(chapter.chapterNumber);

  return (
    <div className="relative min-h-screen text-parchment-cream font-thai selection:bg-gold-warm selection:text-slate-abyss">
      {/* ------------------------------------------------------------------ */}
      {/* 1. FIXED BACKGROUND IMAGE (URL จาก Assets นำมาเป็น Background Fixed) */}
      {/* ------------------------------------------------------------------ */}
      {chapter.image && (
        <div
          className="fixed inset-0 w-full h-full -z-30 bg-cover bg-center bg-scroll lg:bg-fixed transition-all duration-700 pointer-events-none print:hidden"
          style={{
            backgroundImage: `url('${chapter.image}')`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Hero Ambient Gradient Overlay (เพื่อให้ตัวอักษรคมชัด อ่านสบายตา) */}
      <div
        className="article-hero-scrim fixed inset-0 w-full h-full -z-20 bg-gradient-to-b from-black/85 via-black/65 to-black/90 pointer-events-none print:hidden"
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------------ */}
      {/* 2. HERO FIRST VIEWPORT                                             */}
      {/* ------------------------------------------------------------------ */}
      <header className="min-h-[68vh] sm:min-h-[75vh] lg:min-h-[88vh] flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-5 sm:pt-8 pb-8 sm:pb-12 relative z-10">
        {/* Top Bar: Back Link, Action Toolbar & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 hover:border-gold-warm/50 text-xs sm:text-sm font-medium text-parchment-cream hover:text-gold-light transition shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-gold-warm group-hover:-translate-x-1 transition-transform" />
            <span>ย้อนกลับไปหน้าแรก</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ArticleActionToolbar
              title={`${chapter.titleEn}: ${chapter.titleTh}`}
              description={chapter.coreFocus}
              audioTrack={{
                id: chapter.id,
                title: `${chapter.titleEn}: ${chapter.titleTh}`,
                seriesTitle: `ทะเลน้ำตื้น (S.A.F.E.) • เกาะที่ ${chapter.chapterNumber}/7`,
                chapterNumber: chapter.chapterNumber,
                audioUrl: chapter.audioUrl,
                duration: chapter.audio?.full?.duration || chapter.audioDuration || '16:30',
                coverImage: chapter.image,
                realm: 'shallow',
                isUnlocked: true,
              }}
            />

            <div className="hidden md:flex items-center gap-2 font-mono">
              <span className="px-3 py-1 rounded-xl bg-gold-warm text-slate-abyss text-xs font-black uppercase tracking-wider shadow-gold-sm">
                เกาะที่ {chapter.chapterNumber} / 7
              </span>
              <span className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-emerald-500/40">
                S.A.F.E. SERIES
              </span>
            </div>
          </div>
        </div>

        {/* Center: Topic ข่าวใหญ่ & คำอธิบายย่อย */}
        <div className="my-auto py-8 sm:py-12 max-w-5xl space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gold-warm font-semibold tracking-wider uppercase font-thai">
            <Compass className="w-4 h-4 text-gold-warm" />
            <span>การผจญภัยแห่งปัญญา • เกาะที่ {chapter.chapterNumber}</span>
          </div>

          {/* พาดหัวใหญ่ (Large Bold Headline) */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-thai-serif font-black text-parchment-cream leading-[1.18] tracking-tight drop-shadow-2xl text-balance">
            {chapter.titleEn}
          </h1>

          {/* Thai Subtitle */}
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-thai-serif font-bold text-gold-light leading-snug max-w-4xl">
            {chapter.titleTh}
          </h2>

          {/* แก่นสาระสำคัญตามตาราง */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-gold-warm/30 max-w-3xl space-y-1.5 shadow-lg">
            <div className="text-[11px] font-mono uppercase tracking-wider text-gold-warm font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>แก่นสาระสำคัญ (Core Focus):</span>
            </div>
            <p className="text-sm sm:text-base text-parchment-cream/95 font-light leading-relaxed">
              {chapter.coreFocus}
            </p>
          </div>

          {/* Reading Time & Official Publication Date Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gold-light/90 font-thai pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 font-mono">
              <Clock className="w-3.5 h-3.5 text-gold-warm" />
              <span>เวลาอ่านประมาณ {chapter.readingTimeMinutes} นาที</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/75 backdrop-blur-md border border-emerald-400/40 text-emerald-200 font-thai">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>เผยแพร่เมื่อ: {formatThaiScheduleDate(chapter.publishedAt, true)} (W1)</span>
            </div>
          </div>
        </div>

        {/* Bottom Area: Scroll Indicator */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
          <a
            href="#chapter-content"
            className="flex items-center gap-2 text-xs sm:text-sm text-gold-light hover:text-white transition group animate-pulse"
          >
            <span>เลื่อนลงเพื่ออ่านรายละเอียดทั้ง 7 ส่วน</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </a>

          <div className="text-xs text-parchment-muted font-mono">
            Chapter {chapter.chapterNumber} of 7 • The Fitrah Shield
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 3. SCROLLED CONTENT: 7 SECTIONS (Topics, Intro, Self, Awareness,   */}
      {/*    Faith, Ethics, Conclusion)                                      */}
      {/* ------------------------------------------------------------------ */}
      <main
        id="chapter-content"
        className="relative z-10 bg-[#050E0A]/95 backdrop-blur-2xl border-t border-emerald-border/60 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Audio Podcast Player Suite (Part 1, Part 2 & Full Continuous Audio) */}
          <OneshotAudioSuite chapter={chapter} />

          {/* Quick Table of Contents Jump Bar */}
          <div className="p-4 rounded-2xl bg-black/60 border border-emerald-border/60 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-gold-light font-bold text-[11px] uppercase tracking-wider mr-2 font-mono">
              ส่วนของเนื้อหา:
            </span>
            {chapter.sectionList.map((sec, i) => (
              <a
                key={sec.key}
                href={`#sec-${sec.key}`}
                className="px-2.5 py-1 rounded-lg bg-emerald-surface/60 hover:bg-gold-warm hover:text-slate-abyss text-parchment-cream transition text-[11px] font-mono"
              >
                {i + 1}. {sec.key.toUpperCase()}
              </a>
            ))}
          </div>

          {/* Render Each of the 7 Sections */}
          {chapter.sectionList.map((sec, idx) => {
            const badge = SECTION_BADGES[sec.key] || {
              label: sec.header,
              icon: BookOpen,
              color: 'text-parchment-cream border-emerald-border bg-emerald-card',
            };
            const IconComp = badge.icon;

            return (
              <section
                key={sec.key}
                id={`sec-${sec.key}`}
                className="space-y-6 pt-6 scroll-mt-24"
              >
                {/* Section Header Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-border/40">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono shadow-sm ${badge.color}`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>
                      ส่วนที่ {idx + 1} / 7: {badge.label}
                    </span>
                  </span>

                  <span className="text-xs text-parchment-muted/60 font-mono">
                    เกาะที่ {chapter.chapterNumber} • {chapter.titleEn}
                  </span>
                </div>

                {/* Section Title (if different from badge) */}
                {sec.header && !sec.header.toLowerCase().includes('topics') && (
                  <h3 className="text-xl sm:text-2xl font-thai-serif font-black text-parchment-cream leading-snug">
                    {sec.header}
                  </h3>
                )}

                {/* Markdown Content Rendering */}
                <div className="text-base sm:text-lg leading-relaxed font-light text-parchment-cream/95 font-thai">
                  <MarkdownRenderer content={sec.content} />
                </div>

                {/* Clear Section Ending Divider (ตาม Requirement) */}
                <div className="pt-8 pb-4 relative flex items-center justify-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gold-warm/40 to-transparent" />
                  <div className="absolute px-4 py-1 rounded-full bg-[#050E0A] border border-gold-warm/30 text-gold-warm/90 text-[11px] font-thai font-medium flex items-center gap-2 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-warm" />
                    <span>
                      จบส่วนที่ {idx + 1}: {sec.title}
                      {idx < chapter.sectionList.length - 1
                        ? ` • ต่อส่วนที่ ${idx + 2}`
                        : ' (สิ้นสุดบทเรียน)'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-warm" />
                  </div>
                </div>
              </section>
            );
          })}

          {/* ---------------------------------------------------------------- */}
          {/* 4. FOOTER: COFFEE SUPPORT, ACTION TOOLBAR, BACK & NEXT ISLAND     */}
          {/* ---------------------------------------------------------------- */}
          <div className="pt-12 border-t border-emerald-border/60 space-y-10">
            {/* End of Article Coffee Support & 10% Charity QR ("Cofffee") */}
            <ArticleCoffeeSupport articleTitle={`${chapter.titleEn}: ${chapter.titleTh}`} />

            {/* Share & Print Toolbar in Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-black/60 border border-emerald-border/60">
              <div className="text-xs text-parchment-muted">
                ส่งต่อความรู้และภูมิคุ้มกันทางจิตวิญญาณ:
              </div>
              <ArticleActionToolbar
                title={`${chapter.titleEn}: ${chapter.titleTh}`}
                description={chapter.coreFocus}
                audioTrack={{
                  id: chapter.id,
                  title: `${chapter.titleEn}: ${chapter.titleTh}`,
                  seriesTitle: `ทะเลน้ำตื้น (S.A.F.E.) • เกาะที่ ${chapter.chapterNumber}/7`,
                  chapterNumber: chapter.chapterNumber,
                  audioUrl: chapter.audioUrl,
                  duration: chapter.audio?.full?.duration || chapter.audioDuration || '16:30',
                  coverImage: chapter.image,
                  realm: 'shallow',
                  isUnlocked: true,
                }}
              />
            </div>

            {/* Big Back to Home Button */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl gold-bevel-button text-slate-abyss text-base sm:text-lg font-thai-serif font-black shadow-gold-luxury hover:brightness-105 active:scale-95 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
                <span>ย้อนกลับไปหน้าแรก (Back to Home)</span>
              </Link>
            </div>

            {/* Adjacent Island Navigation (เกาะก่อนหน้า / เกาะถัดไป) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {prev ? (
                <Link
                  href={`/oneshot/${prev.slug}`}
                  className="p-5 rounded-2xl bg-emerald-card/70 hover:bg-emerald-surface border border-emerald-border/70 hover:border-gold-warm/40 transition group space-y-1.5 text-left"
                >
                  <div className="text-xs text-parchment-muted/70 flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>เกาะก่อนหน้า (Island {prev.chapterNumber})</span>
                  </div>
                  <div className="font-bold text-sm text-gold-light group-hover:text-gold-warm transition line-clamp-1">
                    {prev.titleEn}
                  </div>
                  <div className="text-xs text-parchment-muted font-light line-clamp-1">
                    {prev.titleTh}
                  </div>
                </Link>
              ) : (
                <div className="p-5 rounded-2xl bg-black/30 border border-white/5 text-xs text-parchment-muted/50 flex items-center justify-center">
                  นี่คือจุดเริ่มต้นของการเดินทาง (เกาะที่ 1)
                </div>
              )}

              {next ? (
                <Link
                  href={`/oneshot/${next.slug}`}
                  className="p-5 rounded-2xl bg-emerald-card/70 hover:bg-emerald-surface border border-emerald-border/70 hover:border-gold-warm/40 transition group space-y-1.5 text-right"
                >
                  <div className="text-xs text-parchment-muted/70 flex items-center justify-end gap-1">
                    <span>เกาะถัดไป (Island {next.chapterNumber})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="font-bold text-sm text-gold-light group-hover:text-gold-warm transition line-clamp-1">
                    {next.titleEn}
                  </div>
                  <div className="text-xs text-parchment-muted font-light line-clamp-1">
                    {next.titleTh}
                  </div>
                </Link>
              ) : (
                <div className="p-5 rounded-2xl bg-black/30 border border-white/5 text-xs text-parchment-muted/50 flex items-center justify-center">
                  สิ้นสุดการเดินทาง 7 เกาะแห่งภูมิคุ้มกัน
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { mockChapters, mockSeries, mockSponsors } from '@/lib/supabase/mockData';
import { DualModeToggle } from '@/components/DualModeToggle';
import { VideoPlayer } from '@/components/VideoPlayer';
import { SponsorSlot } from '@/components/SponsorSlot';
import { useAudio } from '@/context/AudioContext';
import { ContentMode } from '@/types';
import {
  BookOpen,
  Headphones,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Share2,
  Lock,
  Crown,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [mode, setMode] = useState<ContentMode>('easy');
  const [isCopied, setIsCopied] = useState(false);

  const { playTrack, pauseTrack, currentTrack, isPlaying } = useAudio();

  // Find current chapter
  const chapter = mockChapters.find((c) => c.slug === slug) || mockChapters[0];
  const series = mockSeries.find((s) => s.id === chapter.series_id) || mockSeries[0];

  // Navigation: previous & next chapter
  const currentIndex = mockChapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? mockChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < mockChapters.length - 1 ? mockChapters[currentIndex + 1] : null;

  const topSponsor = mockSponsors.find((s) => s.placement === 'article_top');
  const bottomSponsor = mockSponsors.find((s) => s.placement === 'article_bottom');

  const isCurrentAudioPlaying = currentTrack?.id === chapter.id && isPlaying;

  const handleAudioToggle = () => {
    if (isCurrentAudioPlaying) {
      pauseTrack();
    } else {
      playTrack({
        id: chapter.id,
        title: chapter.title_th,
        seriesTitle: series.title_th,
        chapterNumber: chapter.chapter_number,
        audioUrl: chapter.audio_url,
        duration: chapter.audio_duration,
        coverImage: chapter.cover_image,
      });
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream pb-32">
      {/* ---------------------------------------------------------------------- */}
      {/* Article Header & Breadcrumbs */}
      {/* ---------------------------------------------------------------------- */}
      <section className="border-b border-emerald-border/60 bg-gradient-to-b from-emerald-dark to-slate-dark pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-parchment-muted">
            <Link href="/" className="hover:text-gold-light transition">หน้าแรก</Link>
            <span>/</span>
            <Link href="/series" className="hover:text-gold-light transition">{series.title_th}</Link>
            <span>/</span>
            <span className="text-gold-warm font-semibold">ตอนที่ {chapter.chapter_number}</span>
          </div>

          {/* Series Dimension Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-surface/80 border border-gold/30 text-gold-light text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
            <span>{series.dimension}</span>
          </div>

          {/* Chapter Titles */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-parchment-cream leading-tight">
              {chapter.title_th}
            </h1>
            <p className="text-sm sm:text-base text-gold-warm/90 font-sans tracking-wide">
              {chapter.title_en}
            </p>
          </div>

          {/* Excerpt */}
          <p className="text-base sm:text-lg text-parchment-muted leading-relaxed font-light border-l-2 border-gold/50 pl-4">
            {chapter.excerpt}
          </p>

          {/* Action Bar: Audio Player Trigger, Reading Time, Share */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-emerald-border/40">
            <div className="flex items-center gap-3">
              <button
                onClick={handleAudioToggle}
                className="px-4 py-2.5 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-xs sm:text-sm flex items-center gap-2 shadow-gold-sm hover:brightness-110 active:scale-95 transition"
              >
                {isCurrentAudioPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>หยุดเสียงชั่วคราว</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>ฟังพอดแคสต์ประจำบท ({chapter.audio_duration} นาที)</span>
                  </>
                )}
              </button>

              <span className="text-xs text-parchment-muted/80 flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-gold-warm" />
                <span>Sticky Player ด้านล่าง</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3 py-2 rounded-lg bg-emerald-dark hover:bg-emerald-surface border border-emerald-border text-xs text-parchment-muted hover:text-white transition flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isCopied ? 'คัดลอกลิงก์แล้ว!' : 'แชร์บทความ'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* Top Sponsor Banner */}
      {/* ---------------------------------------------------------------------- */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <SponsorSlot slot={topSponsor} placement="article_top" />
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* Dual Mode Switcher Bar */}
      {/* ---------------------------------------------------------------------- */}
      <div className="sticky top-20 z-20 bg-slate-dark/95 backdrop-blur-md py-4 border-b border-emerald-border/70 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <DualModeToggle mode={mode} onToggle={setMode} />
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* Main Article Body */}
      {/* ---------------------------------------------------------------------- */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* If chapter is locked (for chapters 4+) */}
        {!chapter.is_free ? (
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#183226] to-[#0A140F] border-2 border-gold/50 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-gold-warm/20 border border-gold-warm flex items-center justify-center text-gold-light">
              <Lock className="w-8 h-8 text-gold-warm" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-2xl font-serif font-bold text-parchment-cream">
                เนื้อหาพิเศษเฉพาะสมาชิก Supporter
              </h3>
              <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                บทที่ 4 เป็นต้นไป ปลดล็อกเฉพาะสมาชิก Tier 2 (฿199/เดือน) และ Tier 3 Founding 100 Lifetime เข้าถึงครบ 35 บททั้ง Easy และ Deep Mode
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-sm shadow-gold-sm hover:brightness-110 transition flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>ดูแผนสมาชิก & ปลดล็อกทันที</span>
              </Link>
              <Link
                href="/articles/art-of-self-awareness"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold/30 text-gold-light text-sm font-semibold transition"
              >
                กลับไปอ่านบทที่ 1 ฟรี
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Banner Indicator */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs transition duration-300 ${
                mode === 'easy'
                  ? 'bg-emerald-surface/50 border-emerald-400/30 text-parchment-cream'
                  : 'bg-gold-dim/20 border-gold/40 text-gold-light'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-warm" />
                <span className="font-semibold">
                  คุณกำลังอ่านใน: {mode === 'easy' ? 'Easy Mode (ภาษาเล่าเรื่อง & ครอบครัว)' : 'Deep Mode (การวิเคราะห์เชิงลึก 4 มิติแห่งปัญญา)'}
                </span>
              </div>
              <span className="text-[11px] text-parchment-muted">
                สลับโหมดได้ตลอดเวลาที่แถบด้านบน
              </span>
            </div>

            {/* Render Content Based on Mode */}
            <article className="prose prose-invert max-w-none space-y-6 text-parchment-cream/90 leading-relaxed text-base sm:text-lg font-light">
              {mode === 'easy' ? (
                <div className="space-y-6 animate-fade-in whitespace-pre-line">
                  {chapter.easy_content}
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in whitespace-pre-line font-serif">
                  {chapter.deep_content}
                </div>
              )}
            </article>

            {/* Mode Specific Supplements */}
            {mode === 'easy' && chapter.easy_takeaways && chapter.easy_takeaways.length > 0 && (
              <div className="rounded-2xl p-6 bg-emerald-card border border-emerald-border/80 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gold-warm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>สรุปข้อคิดประจำบท (Easy Takeaways)</span>
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-parchment-muted">
                  {chapter.easy_takeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-warm mt-2 shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mode === 'deep' && chapter.deep_references && chapter.deep_references.length > 0 && (
              <div className="rounded-2xl p-6 bg-slate-card border border-gold/30 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gold-warm flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-gold-warm" />
                  <span>หลักฐานเชิงวิชาการ & การอ้างอิง (Epistemic References)</span>
                </h4>
                <ul className="space-y-2 text-xs font-mono text-parchment-muted/90">
                  {chapter.deep_references.map((ref, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold-warm">[{idx + 1}]</span>
                      <span>{ref}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Video Player Component */}
            <VideoPlayer
              videoUrl={chapter.video_url}
              title={`แอนิเมชัน: ${chapter.title_th}`}
              coverImage={chapter.cover_image}
            />

            {/* Bottom Sponsor Banner */}
            <SponsorSlot slot={bottomSponsor} placement="article_bottom" />

            {/* Next / Previous Navigation */}
            <div className="pt-8 border-t border-emerald-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevChapter ? (
                <Link
                  href={`/articles/${prevChapter.slug}`}
                  className="p-4 rounded-xl bg-emerald-dark/70 hover:bg-emerald-surface border border-emerald-border text-left group transition flex items-center gap-3"
                >
                  <ChevronLeft className="w-5 h-5 text-gold-warm group-hover:-translate-x-1 transition" />
                  <div>
                    <span className="text-[11px] text-parchment-muted block">ตอนก่อนหน้า</span>
                    <span className="text-xs font-semibold text-parchment-cream group-hover:text-gold-light transition line-clamp-1">
                      {prevChapter.title_th}
                    </span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextChapter ? (
                <Link
                  href={`/articles/${nextChapter.slug}`}
                  className="p-4 rounded-xl bg-emerald-dark/70 hover:bg-emerald-surface border border-emerald-border text-right group transition flex items-center justify-end gap-3 ml-auto w-full sm:w-auto"
                >
                  <div>
                    <span className="text-[11px] text-parchment-muted block">ตอนถัดไป</span>
                    <span className="text-xs font-semibold text-parchment-cream group-hover:text-gold-light transition line-clamp-1">
                      {nextChapter.title_th}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gold-warm group-hover:translate-x-1 transition" />
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="p-4 rounded-xl bg-gradient-to-r from-emerald-surface to-emerald-dark border border-gold/30 text-right group transition flex items-center justify-end gap-3"
                >
                  <div>
                    <span className="text-[11px] text-gold-warm font-bold block">ปลดล็อกตอนที่ 4 - 35</span>
                    <span className="text-xs font-semibold text-parchment-cream group-hover:text-gold-light transition">
                      สมัครสมาชิกระดับ Supporter
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gold-warm group-hover:translate-x-1 transition" />
                </Link>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

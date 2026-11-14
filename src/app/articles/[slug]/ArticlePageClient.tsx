'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockChapters, mockSeries, mockSponsors } from '@/lib/supabase/mockData';
import { DualModeToggle } from '@/components/DualModeToggle';
import { VideoPlayer } from '@/components/VideoPlayer';
import { SponsorSlot } from '@/components/SponsorSlot';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { ContentMode } from '@/types';
import {
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
  Eye,
  EyeOff,
  Type,
  Volume2,
  VolumeX,
  Edit3,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Feather,
  Brain,
  SlidersHorizontal,
} from 'lucide-react';

type FontSize = 'sm' | 'base' | 'lg' | 'xl';

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [mode, setMode] = useState<ContentMode>('deep');
  const [isCopied, setIsCopied] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('lg');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Reflection Note State
  const [reflectionText, setReflectionText] = useState('');
  const [savedTime, setSavedTime] = useState<string | null>(null);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);

  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const { member } = useAuth();
  const { playTrack, pauseTrack, currentTrack, isPlaying } = useAudio();
  const [audioPromptMsg, setAudioPromptMsg] = useState<string | null>(null);

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

  // Track Reading Progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load Saved Reflection Note from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNote = localStorage.getItem(`safe_soul_note_${chapter.id}`);
      const storedTime = localStorage.getItem(`safe_soul_note_time_${chapter.id}`);
      if (storedNote) setReflectionText(storedNote);
      if (storedTime) setSavedTime(storedTime);
    }
  }, [chapter.id]);

  // Handle Save Reflection
  const handleSaveNote = () => {
    if (typeof window !== 'undefined') {
      const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem(`safe_soul_note_${chapter.id}`, reflectionText);
      localStorage.setItem(`safe_soul_note_time_${chapter.id}`, now);
      setSavedTime(now);
      setIsSavedFeedback(true);
      setTimeout(() => setIsSavedFeedback(false), 2000);
    }
  };

  // Toggle Ambient Soundscape
  const handleToggleAmbient = () => {
    if (!ambientAudioRef.current) {
      ambientAudioRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-meditation-flute-247.mp3');
      ambientAudioRef.current.loop = true;
      ambientAudioRef.current.volume = 0.35;
    }

    if (isAmbientPlaying) {
      ambientAudioRef.current.pause();
      setIsAmbientPlaying(false);
    } else {
      ambientAudioRef.current.play().catch(() => {});
      setIsAmbientPlaying(true);
    }
  };

  // Cleanup ambient audio on unmount
  useEffect(() => {
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    };
  }, []);

  const handleAudioToggle = () => {
    const hasAudioAccess =
      member?.tier === 'supporter_tier_2' || member?.tier === 'founding_tier_3';
    if (!hasAudioAccess) {
      setAudioPromptMsg('ระบบเสียงพอดแคสต์เปิดให้เฉพาะสมาชิกเรือประมงน้ำลึก (Supporter) และเรือสำราญทุกมรสุม (Founding 100) เท่านั้น');
      setTimeout(() => setAudioPromptMsg(null), 5000);
      return;
    }

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

  // Font Size CSS mappings
  const fontSizeClasses = {
    sm: 'text-sm sm:text-base leading-relaxed',
    base: 'text-base sm:text-lg leading-relaxed',
    lg: 'text-lg sm:text-xl leading-relaxed',
    xl: 'text-xl sm:text-2xl leading-loose',
  };

  return (
    <div className={`min-h-screen bg-[#08110D] text-parchment-cream pb-36 font-thai selection:bg-gold-warm selection:text-slate-abyss transition-colors duration-500 ${focusMode ? 'pt-6' : 'pt-0'}`}>
      {/* ---------------------------------------------------------------------- */}
      {/* Top Reading Progress Bar */}
      {/* ---------------------------------------------------------------------- */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/40 z-50">
        <div
          className="h-full bg-gold-warm transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* Sanctuary Header (Collapsible in Focus Mode) */}
      {/* ---------------------------------------------------------------------- */}
      {!focusMode && (
        <section className="border-b border-emerald-border/60 bg-gradient-to-b from-[#0F241A] to-[#08110D] pt-8 pb-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-parchment-muted">
              <Link href="/" className="hover:text-gold-light transition">หน้าแรก</Link>
              <span>/</span>
              <Link href="/series" className="hover:text-gold-light transition">{series.title_th}</Link>
              <span>/</span>
              <span className="text-gold-warm font-semibold">ตอนที่ {chapter.chapter_number}</span>
            </nav>

            {/* Series Dimension Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-surface/90 border border-gold-warm/30 text-gold-light text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
              <span>{series.dimension}</span>
            </div>

            {/* Chapter Titles */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-thai-serif font-black text-parchment-cream leading-tight">
                {chapter.title_th}
              </h1>
              <p className="text-sm sm:text-base text-gold-warm/90 font-cinzel font-semibold tracking-wide">
                {chapter.title_en}
              </p>
            </div>

            {/* Excerpt */}
            <p className="text-base sm:text-lg text-parchment-muted leading-relaxed font-light border-l border-gold-warm/60 pl-4 max-w-3xl">
              {chapter.excerpt}
            </p>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* Reader Sanctuary Sticky Toolbar */}
      {/* ---------------------------------------------------------------------- */}
      {audioPromptMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-black/95 border border-gold-warm text-gold-light text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in">
          <Headphones className="w-4 h-4 text-gold-warm shrink-0" />
          <span>{audioPromptMsg}</span>
          <Link
            href="/pricing"
            className="px-2.5 py-1 rounded-lg bg-gold-warm text-slate-abyss text-xs font-bold hover:brightness-110"
          >
            ดูแพ็กเกจ
          </Link>
        </div>
      )}
      <header className="sticky top-0 z-30 bg-[#091510]/95 backdrop-blur-md py-3 px-4 sm:px-6 lg:px-8 border-b border-emerald-border/70 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Dual-Mode Toggle */}
          <div className="flex items-center gap-2">
            <DualModeToggle mode={mode} onToggle={setMode} />
          </div>

          {/* Reader Controls: Font Size, Focus Mode, Ambient Audio, Notes */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Font Size Adjuster */}
            <div className="flex items-center bg-emerald-dark/80 rounded-xl border border-emerald-border/70 p-1 gap-1">
              <button
                onClick={() => {
                  const sizes: FontSize[] = ['sm', 'base', 'lg', 'xl'];
                  const nextIdx = Math.max(0, sizes.indexOf(fontSize) - 1);
                  setFontSize(sizes[nextIdx]);
                }}
                disabled={fontSize === 'sm'}
                aria-label="ลดขนาดตัวอักษร"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-parchment-muted hover:text-white disabled:opacity-30 transition hover:bg-emerald-surface"
              >
                <span className="font-serif text-[11px] font-bold">A-</span>
              </button>

              <span className="px-1.5 text-[11px] font-mono text-gold-light select-none">
                {fontSize.toUpperCase()}
              </span>

              <button
                onClick={() => {
                  const sizes: FontSize[] = ['sm', 'base', 'lg', 'xl'];
                  const nextIdx = Math.min(sizes.length - 1, sizes.indexOf(fontSize) + 1);
                  setFontSize(sizes[nextIdx]);
                }}
                disabled={fontSize === 'xl'}
                aria-label="เพิ่มขนาดตัวอักษร"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-parchment-muted hover:text-white disabled:opacity-30 transition hover:bg-emerald-surface"
              >
                <span className="font-serif text-xs font-bold">A+</span>
              </button>
            </div>

            {/* Ambient Soundscape Toggle */}
            <button
              onClick={handleToggleAmbient}
              title={isAmbientPlaying ? 'ปิดเสียงดนตรีบรรเลงสมาธิ' : 'เปิดเสียงดนตรีบรรเลงสมาธิคลอ (Ambient Flute)'}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                isAmbientPlaying
                  ? 'bg-gold-warm text-slate-abyss border-gold-light font-bold shadow-gold-sm'
                  : 'bg-emerald-dark/80 text-parchment-muted hover:text-white border-emerald-border/70'
              }`}
            >
              {isAmbientPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span className="hidden sm:inline">ดนตรีสมาธิ: เปิด</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ดนตรีสมาธิ</span>
                </>
              )}
            </button>

            {/* Focus Mode Toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              title={focusMode ? 'ออกจากโหมดสมาธิ' : 'เข้าสู่โหมดอ่านแบบไร้สิ่งรบกวน (Sanctuary Focus)'}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                focusMode
                  ? 'bg-emerald-light text-parchment-cream border-emerald-border font-bold'
                  : 'bg-emerald-dark/80 text-parchment-muted hover:text-white border-emerald-border/70'
              }`}
            >
              {focusMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{focusMode ? 'โหมดปกติ' : 'โหมดสมาธิ'}</span>
            </button>

            {/* Personal Notes Toggle */}
            <button
              onClick={() => setIsNoteDrawerOpen(!isNoteDrawerOpen)}
              title="เปิดสมุดบันทึกข้อคิดส่วนตัว"
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                isNoteDrawerOpen || reflectionText
                  ? 'bg-emerald-surface text-gold-light border-gold-warm/40 font-semibold'
                  : 'bg-emerald-dark/80 text-parchment-muted hover:text-white border-emerald-border/70'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">บันทึกข้อคิด</span>
            </button>

            {/* Podcast Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              title="ฟังเสียงพอดแคสต์บรรยาย (เฉพาะสมาชิก Supporter และ Founding 100)"
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                isCurrentAudioPlaying
                  ? 'bg-gold-warm text-slate-abyss border-gold-light font-bold shadow-gold-sm'
                  : 'bg-emerald-dark/80 text-parchment-muted hover:text-white border-emerald-border/70'
              }`}
            >
              {isCurrentAudioPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">หยุดเสียง</span>
                </>
              ) : (
                <>
                  <Headphones className="w-3.5 h-3.5 text-gold-warm" />
                  <span className="hidden sm:inline">พอดแคสต์</span>
                  {!(member?.tier === 'supporter_tier_2' || member?.tier === 'founding_tier_3') && (
                    <Lock className="w-3 h-3 text-parchment-muted/80 ml-0.5" />
                  )}
                </>
              )}
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              title="คัดลอกลิงก์บทความ"
              className="p-2 rounded-xl bg-emerald-dark/80 hover:bg-emerald-surface border border-emerald-border/70 text-parchment-muted hover:text-white transition"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------------- */}
      {/* Top Sponsor Banner (Hidden in Focus Mode) */}
      {/* ---------------------------------------------------------------------- */}
      {!focusMode && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <SponsorSlot slot={topSponsor} placement="article_top" />
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* Main Reader Content */}
      {/* ---------------------------------------------------------------------- */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* If chapter is locked (for chapters 4+) */}
        {!chapter.is_free ? (
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#183226] to-[#0A140F] border border-gold-warm/50 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-gold-warm/20 border border-gold-warm flex items-center justify-center text-gold-light">
              <Lock className="w-8 h-8 text-gold-warm" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-thai-serif font-bold text-parchment-cream">
                เนื้อหาพิเศษเฉพาะสมาชิก Supporter
              </h2>
              <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                บทที่ 4 เป็นต้นไป ปลดล็อกเฉพาะสมาชิก Tier 2 (฿199/เดือน) และ Tier 3 Founding 100 Lifetime เข้าถึงครบ 35 บททั้ง Easy และ Deep Mode พร้อมไฟล์เสียง Lossless
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm hover:brightness-110 transition flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>ดูแผนสมาชิก & ปลดล็อกทันที</span>
              </Link>
              <Link
                href="/articles/art-of-self-awareness"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/30 text-gold-light text-sm font-semibold transition"
              >
                กลับไปอ่านบทที่ 1 ฟรี
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Audio Sampler Bar (Quick inline listen) */}
            <div className="p-4 rounded-2xl bg-emerald-card/70 border border-gold-warm/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-gold-warm" />
                  <span>พอดแคสต์เสียงบรรยายประจำบท ({chapter.audio_duration} นาที)</span>
                </div>
                <p className="text-[11px] text-parchment-muted">
                  ฟังเสียงบรรยายคมชัด พร้อมดนตรีบำบัดสมาธิคลอเบาๆ เชื่อมต่อกับ Sticky Player ด้านล่าง
                </p>
              </div>

              <button
                onClick={handleAudioToggle}
                className="px-5 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs sm:text-sm flex items-center gap-2 shadow-gold-sm hover:brightness-105 active:scale-95 transition shrink-0"
              >
                {isCurrentAudioPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>หยุดเสียง</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>เล่นเสียง</span>
                  </>
                )}
              </button>
            </div>

            {/* Personal Reflection Drawer (Interactive Journal) */}
            {isNoteDrawerOpen && (
              <div className="p-6 rounded-2xl bg-[#0D1C14] border border-gold-warm/40 space-y-4 shadow-xl animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gold-light flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-gold-warm" />
                    <span>สมุดบันทึกการใคร่ครวญประจำบท (Sanctuary Journal)</span>
                  </h3>
                  {savedTime && (
                    <span className="text-[11px] text-parchment-muted">
                      บันทึกล่าสุดเมื่อ: {savedTime}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-border/60 text-xs text-parchment-muted italic">
                  <strong>คำถามชวนคิด:</strong> &ldquo;อะไรคือน้ำที่เริ่มรั่วเข้ามาในเรือชีวิตของคุณในสัปดาห์นี้ และคุณจะปิดรอยรั่วนั้นอย่างไร?&rdquo;
                </div>

                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="เขียนข้อคิด ตกผลึกความรู้สึก หรือสิ่งที่คุณตั้งใจจะนำไปปฏิบัติในชีวิตจริง..."
                  rows={4}
                  className="w-full p-4 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-sm text-parchment-cream outline-none resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setReflectionText('');
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem(`safe_soul_note_${chapter.id}`);
                        localStorage.removeItem(`safe_soul_note_time_${chapter.id}`);
                        setSavedTime(null);
                      }
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ล้างข้อความ</span>
                  </button>

                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 rounded-xl bg-gold-warm hover:bg-gold-light text-slate-abyss text-xs font-bold transition flex items-center gap-1.5 shadow-gold-sm"
                  >
                    {isSavedFeedback ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>บันทึกสำเร็จ!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>บันทึกข้อคิด</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Current Mode Badge */}
            <div className="flex items-center justify-between py-2 border-b border-emerald-border/40 text-xs text-parchment-muted">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-warm" />
                <span>
                  โหมด: {mode === 'easy' ? 'Easy Mode (Upcoming - อยู่ระหว่างการจัดเตรียมเนื้อหา)' : 'Deep Mode (การวิเคราะห์เชิงลึก 4 มิติแห่งปัญญา - ฉบับสมบูรณ์)'}
                </span>
              </span>
              <span className="text-[11px] text-gold-light">
                สลับโหมดได้ที่แถบด้านบน
              </span>
            </div>

            {mode === 'easy' && (
              <div className="p-5 rounded-2xl bg-[#0F281B] border border-gold-warm/40 text-xs sm:text-sm text-parchment-muted space-y-2">
                <div className="flex items-center gap-2 text-gold-light font-bold">
                  <Sparkles className="w-4 h-4 text-gold-warm" />
                  <span>อ่าน Deep Mode ก่อนนะครับ โหมดนี้จะเพิ่มให้ทีหลังนะครับ</span>
                </div>
                <p>
                  บทความในโหมดภาษาง่าย (Easy Mode) กำลังอยู่ระหว่างการจัดทำเรียบเรียง เพื่อความสมบูรณ์และถูกต้องของเนื้อหา แนะนำให้ท่านเข้าศึกษาฉบับเต็มใน <strong>Deep Mode</strong> ก่อนนะครับ
                </p>
                <button
                  onClick={() => setMode('deep')}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs shadow-sm cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>เปิดอ่านใน Deep Mode (ฉบับสมบูรณ์)</span>
                </button>
              </div>
            )}

            {/* Article Content Render with Font Scale & Full Markdown Capability */}
            <article className={`space-y-6 text-parchment-cream/90 font-light ${fontSizeClasses[fontSize]}`}>
              {mode === 'easy' ? (
                <div className="animate-fade-in opacity-80">
                  <MarkdownRenderer content={chapter.easy_content} />
                </div>
              ) : (
                <div className="animate-fade-in">
                  <MarkdownRenderer content={chapter.deep_content} isDeepMode />
                </div>
              )}
            </article>

            {/* Mode Specific Supplements */}
            {mode === 'easy' && chapter.easy_takeaways && chapter.easy_takeaways.length > 0 && (
              <section aria-labelledby="takeaways-heading" className="rounded-2xl p-6 bg-emerald-card border border-emerald-border/80 space-y-4 shadow-sm">
                <h3 id="takeaways-heading" className="text-sm font-bold uppercase tracking-wider text-gold-warm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>สรุปแก่นปัญญาประจำบท (Easy Takeaways)</span>
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-parchment-muted">
                  {chapter.easy_takeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-warm mt-2 shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {mode === 'deep' && chapter.deep_references && chapter.deep_references.length > 0 && (
              <section aria-labelledby="references-heading" className="rounded-2xl p-6 bg-slate-card border border-gold-warm/30 space-y-4 shadow-sm">
                <h3 id="references-heading" className="text-sm font-bold uppercase tracking-wider text-gold-warm flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-gold-warm" />
                  <span>หลักฐานเชิงวิชาการ & การอ้างอิง (Epistemic References)</span>
                </h3>
                <ul className="space-y-2 text-xs font-mono text-parchment-muted/90">
                  {chapter.deep_references.map((ref, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold-warm">[{idx + 1}]</span>
                      <span>{ref}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Video Player Component */}
            <VideoPlayer
              videoUrl={chapter.video_url}
              title={`แอนิเมชันสรุปบทเรียน: ${chapter.title_th}`}
              coverImage={chapter.cover_image}
            />

            {/* Bottom Sponsor Banner (Hidden in Focus Mode) */}
            {!focusMode && (
              <SponsorSlot slot={bottomSponsor} placement="article_bottom" />
            )}

            {/* Next / Previous Navigation */}
            <nav aria-label="Chapter Navigation" className="pt-8 border-t border-emerald-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="p-4 rounded-xl bg-gradient-to-r from-emerald-surface to-emerald-dark border border-gold-warm/30 text-right group transition flex items-center justify-end gap-3"
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
            </nav>
          </>
        )}
      </main>
    </div>
  );
}

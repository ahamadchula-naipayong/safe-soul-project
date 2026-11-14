'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import {
  checkOceanArticleAccess,
  checkOceanAudioAccess,
  getEffectiveMemberTier,
  getVesselDisplayName,
} from '@/lib/oceanAccess';
import {
  OneshotChapter,
  DeepOceanArchipelago,
  ArticleStatus,
} from '@/types';
import {
  Search,
  Compass,
  Anchor,
  Crown,
  Lock,
  Unlock,
  Clock,
  Headphones,
  ArrowRight,
  RotateCcw,
  LayoutGrid,
  AlignJustify,
  Rows,
  UserCheck,
  Sparkles,
  BookOpen,
  Play,
  Pause,
} from 'lucide-react';

type ViewMode = 'tiles' | 'details' | 'content';

interface UnifiedJourneyItem {
  id: string;
  realm: 'shallow' | 'deep';
  realmLabel: string;
  archipelagoNumber?: number;
  archipelagoSlug?: string;
  archipelagoTitleTh?: string;
  archipelagoTitleEn?: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  excerpt: string;
  image: string;
  href: string;
  readingTimeMinutes: number;
  isUnlocked: boolean;
  status: ArticleStatus;
  publishedAt?: string;
  audioUrl?: string;
  audioDuration?: string;
}

export default function JourneyArchivePage() {
  const { member, isLoggedIn } = useAuth();
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const [shallowChapters, setShallowChapters] = useState<OneshotChapter[]>([]);
  const [deepArchipelagos, setDeepArchipelagos] = useState<DeepOceanArchipelago[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [accessFilter, setAccessFilter] = useState<'all' | 'unlocked' | 'audio'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('tiles');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('safesoul_journey_view_mode') as ViewMode | null;
      if (saved && (saved === 'tiles' || saved === 'details' || saved === 'content')) {
        setViewMode(saved);
      }
    } catch {}
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('safesoul_journey_view_mode', mode);
    } catch {}
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/ocean')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setShallowChapters(data.shallowWaters?.items || []);
          setDeepArchipelagos(data.deepOcean?.items || []);
        }
      })
      .catch((err) => console.error('Failed to load ocean archive:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Build unified list of all 57 ocean articles
  const allItems: UnifiedJourneyItem[] = useMemo(() => {
    const items: UnifiedJourneyItem[] = [];

    shallowChapters.forEach((ch) => {
      items.push({
        id: ch.id || `shallow-${ch.chapterNumber}`,
        realm: 'shallow',
        realmLabel: 'ทะเลน้ำตื้น (7 เกาะเปิด)',
        chapterNumber: ch.chapterNumber,
        title: `เกาะที่ ${ch.chapterNumber}: ${ch.titleEn}`,
        subtitle: ch.titleTh,
        excerpt: ch.coreFocus || ch.excerpt,
        image: ch.image,
        href: `/oneshot/${ch.slug}`,
        readingTimeMinutes: ch.readingTimeMinutes || 25,
        isUnlocked: true,
        status: ch.status || 'published',
        publishedAt: ch.publishedAt,
        audioUrl: ch.audio?.full?.url || ch.audioUrl,
        audioDuration: ch.audio?.full?.duration || ch.audioDuration,
      });
    });

    deepArchipelagos.forEach((arch) => {
      arch.subIslands.forEach((sub) => {
        items.push({
          id: `deep-${arch.slug}-${sub.chapterNumber}`,
          realm: 'deep',
          realmLabel: `หมู่เกาะ ${arch.archipelagoNumber}: ${arch.titleTh}`,
          archipelagoNumber: arch.archipelagoNumber,
          archipelagoSlug: arch.slug,
          archipelagoTitleTh: arch.titleTh,
          archipelagoTitleEn: arch.titleEn,
          chapterNumber: sub.chapterNumber,
          title: sub.title,
          subtitle: `${arch.titleEn} • เกาะย่อยที่ ${sub.chapterNumber}/5`,
          excerpt: sub.excerpt,
          image: sub.coverImage || arch.coverImage,
          href: `/ocean/${arch.slug}/${sub.chapterNumber}`,
          readingTimeMinutes: sub.readingTimeMinutes || 15,
          isUnlocked: sub.isUnlocked,
          status: sub.status,
          publishedAt: sub.publishedAt,
          audioUrl: sub.audioUrl,
          audioDuration: sub.audioDuration,
        });
      });
    });

    return items;
  }, [shallowChapters, deepArchipelagos]);

  const { effectiveTier, isPendingVerification } = getEffectiveMemberTier(member);

  // Count how many items current user can access
  const unlockedCount = useMemo(() => {
    return allItems.filter((item) =>
      checkOceanArticleAccess({
        realm: item.realm,
        archipelagoNumber: item.archipelagoNumber,
        chapterNumber: item.chapterNumber,
        isUnlocked: item.isUnlocked,
        status: item.status,
        publishedAt: item.publishedAt,
        member,
      }).canAccess
    ).length;
  }, [allItems, member]);

  // Filtered items
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory === 'shallow' && item.realm !== 'shallow') return false;
      if (selectedCategory === 'deep' && item.realm !== 'deep') return false;
      if (selectedCategory.startsWith('arch-')) {
        const archNum = parseInt(selectedCategory.replace('arch-', ''), 10);
        if (item.realm !== 'deep' || item.archipelagoNumber !== archNum) return false;
      }

      // Access / Audio filter
      const access = checkOceanArticleAccess({
        realm: item.realm,
        archipelagoNumber: item.archipelagoNumber,
        chapterNumber: item.chapterNumber,
        isUnlocked: item.isUnlocked,
        status: item.status,
        publishedAt: item.publishedAt,
        member,
      });

      if (accessFilter === 'unlocked' && !access.canAccess) return false;
      if (accessFilter === 'audio' && !item.audioUrl) return false;

      // Search filter
      if (q) {
        const haystack = `${item.title} ${item.subtitle} ${item.excerpt} ${item.realmLabel}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [allItems, selectedCategory, accessFilter, search, member]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setAccessFilter('all');
  };

  const handlePlayAudio = (e: React.MouseEvent, item: UnifiedJourneyItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.audioUrl) return;
    playTrack({
      id: item.id,
      title: item.title,
      seriesTitle: item.realmLabel,
      chapterNumber: item.chapterNumber,
      audioUrl: item.audioUrl,
      duration: item.audioDuration || `${item.readingTimeMinutes} นาที`,
      coverImage: item.image,
    });
  };

  return (
    <div className="min-h-screen bg-[#08110D] text-parchment-cream font-thai selection:bg-gold-warm selection:text-slate-abyss pb-28">
      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO HEADER & ACTIVE VESSEL ACCESS BAR                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative pt-12 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-border/60 bg-gradient-to-b from-[#0F241A] via-[#0A1812] to-[#08110D] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[320px] bg-radial-gradient from-gold-warm/12 via-emerald-deep/20 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-card/80 border border-gold-warm/40 text-gold-light text-xs font-semibold shadow-gold-sm">
              <Compass className="w-3.5 h-3.5 text-gold-warm" />
              <span className="font-cinzel tracking-wider">SAFE FOR JOURNEY • OCEAN ARCHIVE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-cinzel font-black text-parchment-cream tracking-wide leading-tight">
              Safe for Journey
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-2xl text-gold-light font-thai-serif font-bold">
              มุ่งสู่ทะเลอันไร้ที่สิ้นสุดกัน
            </p>

            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-parchment-muted font-light leading-relaxed">
              คลังรวมบทความสำรวจจิตวิญญาณและเกราะพิทักษ์ฟิฏเราะฮฺครบทั้ง 2 น่านน้ำ —{' '}
              <strong className="text-gold-light">ทะเลน้ำตื้น (7 เกาะแห่งปัญญา)</strong> และ{' '}
              <strong className="text-cyan-300">ทะเลน้ำลึก (10 หมู่เกาะ • 50 เกาะย่อย)</strong>{' '}
              พร้อมจัดสรรสิทธิ์การเข้าถึงตามระดับเรือสมาชิกของคุณโดยอัตโนมัติ
            </p>
          </div>

          {/* Member Vessel Status Card */}
          <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-[#0D2118]/90 border border-gold-warm/35 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gold-warm/15 border border-gold-warm/40 flex items-center justify-center text-gold-warm shrink-0">
                {effectiveTier === 'founding_tier_3' ? (
                  <Crown className="w-5 h-5 fill-current" />
                ) : effectiveTier === 'supporter_tier_2' ? (
                  <Anchor className="w-5 h-5 text-cyan-300" />
                ) : (
                  <Compass className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-gold-light">
                  <span>สถานะเรือปัจจุบัน: {getVesselDisplayName(effectiveTier)}</span>
                  {member && (
                    <span className="px-2 py-0.5 rounded-full bg-gold-warm/20 border border-gold-warm/40 text-[11px] font-mono">
                      Member #{member.memberNumber}
                    </span>
                  )}
                  {isPendingVerification && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-400/50 text-amber-300 text-[11px]">
                      รอแอดมินตรวจสลิป
                    </span>
                  )}
                </div>
                <p className="text-xs text-parchment-muted font-light">
                  คุณสามารถเปิดอ่านฉบับเต็มได้ทันที{' '}
                  <strong className="text-emerald-300 font-semibold">
                    {unlockedCount} จาก {allItems.length || 57} บทความ
                  </strong>
                  {effectiveTier !== 'founding_tier_3' && (
                    <span> • อัปเกรดระดับเรือเพื่อปลดล็อกทะเลน้ำลึกเพิ่มเติม</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5 shadow-gold-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ / สมัครฟรี</span>
                </Link>
              ) : effectiveTier !== 'founding_tier_3' ? (
                <Link
                  href="/pricing"
                  className="px-4 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5 shadow-gold-sm"
                >
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>อัปเกรดระดับเรือ</span>
                </Link>
              ) : (
                <Link
                  href="/portal"
                  className="px-4 py-2.5 rounded-xl bg-emerald-surface border border-gold-warm/40 text-gold-light font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-light transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
                  <span>คลังสัมภาระบนเรือ</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. STICKY SEARCH, VIEW MODES & REALM FILTER TOOLBAR                */}
      {/* ------------------------------------------------------------------ */}
      <section className="sticky top-20 z-20 backdrop-blur-xl bg-[#08110D]/92 border-b border-emerald-border/50 py-4 px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อเกาะ, หมู่เกาะ, หรือหัวข้อบทความ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-emerald-card/70 border border-emerald-border focus:border-gold-warm focus:outline-none text-xs sm:text-sm text-parchment-cream placeholder:text-parchment-muted/50 transition"
            />
          </div>

          {/* Right Controls: Access Filter + View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-black/50 border border-emerald-border/70 text-xs">
              <button
                type="button"
                onClick={() => setAccessFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  accessFilter === 'all'
                    ? 'bg-emerald-surface text-gold-light border border-gold-warm/30'
                    : 'text-parchment-muted hover:text-parchment-cream'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setAccessFilter('unlocked')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                  accessFilter === 'unlocked'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-400/40'
                    : 'text-parchment-muted hover:text-parchment-cream'
                }`}
              >
                <Unlock className="w-3 h-3" />
                <span>อ่านได้ทันที ({unlockedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setAccessFilter('audio')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                  accessFilter === 'audio'
                    ? 'bg-gold-warm/20 text-gold-light border border-gold-warm/40'
                    : 'text-parchment-muted hover:text-parchment-cream'
                }`}
              >
                <Headphones className="w-3 h-3" />
                <span>มีเสียงพอดแคสต์</span>
              </button>
            </div>

            {/* View Switcher (Tiles / Details / Content) */}
            <div className="inline-flex p-1 rounded-xl bg-black/50 border border-emerald-border/70">
              <button
                type="button"
                onClick={() => handleViewModeChange('tiles')}
                title="มุมมองการ์ดภาพปก (Tiles)"
                className={`p-2 rounded-lg transition ${
                  viewMode === 'tiles'
                    ? 'bg-gold-warm text-slate-abyss shadow-sm'
                    : 'text-parchment-muted hover:text-parchment-cream'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('details')}
                title="มุมมองตารางกระชับ (Details)"
                className={`p-2 rounded-lg transition ${
                  viewMode === 'details'
                    ? 'bg-gold-warm text-slate-abyss shadow-sm'
                    : 'text-parchment-muted hover:text-parchment-cream'
                }`}
              >
                <AlignJustify className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('content')}
                title="มุมมองเนื้อหาย่อ (Content)"
                className={`p-2 rounded-lg transition ${
                  viewMode === 'content'
                    ? 'bg-gold-warm text-slate-abyss shadow-sm'
                    : 'text-parchment-muted hover:text-parchment-cream'
                }`}
              >
                <Rows className="w-4 h-4" />
              </button>
            </div>

            {(search || selectedCategory !== 'all' || accessFilter !== 'all') && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/30 text-red-200 text-xs font-medium flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>
        </div>

        {/* Category / Realm Pills */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition border ${
              selectedCategory === 'all'
                ? 'bg-gold-warm text-slate-abyss border-gold-warm font-bold'
                : 'bg-emerald-card/60 text-parchment-muted border-emerald-border hover:border-gold-warm/40 hover:text-parchment-cream'
            }`}
          >
            ทั้งหมด ({allItems.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('shallow')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 ${
              selectedCategory === 'shallow'
                ? 'bg-gold-warm text-slate-abyss border-gold-warm font-bold'
                : 'bg-emerald-950/80 text-gold-light border-gold-warm/30 hover:border-gold-warm'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ทะเลน้ำตื้น • 7 เกาะเปิด ({shallowChapters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('deep')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 ${
              selectedCategory === 'deep'
                ? 'bg-cyan-400 text-slate-abyss border-cyan-300 font-bold'
                : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/30 hover:border-cyan-400'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>ทะเลน้ำลึก • 10 หมู่เกาะ ({deepArchipelagos.length * 5})</span>
          </button>

          <span className="text-white/15 px-1">|</span>

          {deepArchipelagos.map((arch) => {
            const key = `arch-${arch.archipelagoNumber}`;
            const active = selectedCategory === key;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition border ${
                  active
                    ? 'bg-emerald-400 text-slate-abyss border-emerald-300 font-bold'
                    : 'bg-black/40 text-parchment-muted border-white/10 hover:border-gold-warm/40 hover:text-parchment-cream'
                }`}
              >
                หมู่เกาะ {arch.archipelagoNumber}: {arch.titleTh}
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. ARTICLES DIRECTORY DISPLAY                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 rounded-2xl bg-emerald-card/40 border border-emerald-border/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-emerald-card/30 border border-emerald-border/50 space-y-4">
            <Compass className="w-12 h-12 text-gold-warm/60 mx-auto" />
            <h3 className="text-xl font-thai-serif font-bold text-parchment-cream">
              ไม่พบบทความที่ตรงกับเงื่อนไขการค้นหา
            </h3>
            <p className="text-xs sm:text-sm text-parchment-muted">
              ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรองเพื่อดูบทความทั้งหมด 57 บท
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs"
            >
              แสดงบทความทั้งหมด
            </button>
          </div>
        ) : viewMode === 'tiles' ? (
          /* VIEW 1: TILES (3-Column Maritime Cards) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const access = checkOceanArticleAccess({
                realm: item.realm,
                archipelagoNumber: item.archipelagoNumber,
                chapterNumber: item.chapterNumber,
                isUnlocked: item.isUnlocked,
                status: item.status,
                publishedAt: item.publishedAt,
                member,
              });
              const isPlayingThis = currentTrack?.id === item.id && isPlaying;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`group rounded-2xl overflow-hidden flex flex-col justify-between border transition-all duration-300 ${
                    access.canAccess
                      ? 'bg-gradient-to-b from-[#11261C] to-[#09140F] border-emerald-border/80 hover:border-gold-warm/60 shadow-lg hover:-translate-y-1'
                      : 'bg-gradient-to-b from-[#0D1A14]/90 to-[#070E0B] border-white/10 hover:border-gold-warm/40 opacity-90 hover:opacity-100'
                  }`}
                >
                  <div>
                    {/* Cover Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-abyss">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className={`w-full h-full object-cover transition duration-700 group-hover:scale-105 ${
                          !access.canAccess ? 'brightness-75 saturate-75' : ''
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09140F] via-black/25 to-transparent" />

                      {/* Top Left Realm Pill */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold backdrop-blur-md border ${
                            item.realm === 'shallow'
                              ? 'bg-gold-warm/90 text-slate-abyss border-gold-light'
                              : 'bg-cyan-950/90 text-cyan-200 border-cyan-400/50'
                          }`}
                        >
                          {item.realm === 'shallow'
                            ? `ทะเลน้ำตื้น • เกาะ ${item.chapterNumber}`
                            : `หมู่เกาะ ${item.archipelagoNumber} • บทที่ ${item.chapterNumber}`}
                        </span>
                      </div>

                      {/* Top Right Access Badge */}
                      <div className="absolute top-3 right-3">
                        {access.canAccess ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-400/50 text-emerald-300 text-[11px] font-semibold backdrop-blur-md">
                            <Unlock className="w-3 h-3" />
                            <span>อ่านได้ทันที</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/85 border border-gold-warm/50 text-gold-light text-[11px] font-semibold backdrop-blur-md">
                            <Lock className="w-3 h-3 text-gold-warm" />
                            <span>ล็อกตามสิทธิ์เรือ</span>
                          </span>
                        )}
                      </div>

                      {/* Audio Quick Play Button if available & unlocked */}
                      {item.audioUrl &&
                        checkOceanAudioAccess({
                          realm: item.realm,
                          archipelagoNumber: item.archipelagoNumber,
                          chapterNumber: item.chapterNumber,
                          isUnlocked: item.isUnlocked,
                          status: item.status,
                          publishedAt: item.publishedAt,
                          member,
                        }).canAccess && (
                          <button
                            type="button"
                            onClick={(e) => handlePlayAudio(e, item)}
                            title="เล่นเสียงพอดแคสต์ของบทนี้"
                            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-gold-warm text-slate-abyss font-bold text-[11px] shadow-gold-sm flex items-center gap-1.5 hover:brightness-110 transition"
                          >
                            {isPlayingThis ? (
                              <>
                                <Pause className="w-3 h-3 fill-current" />
                                <span>กำลังเล่น</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-current" />
                                <span>ฟังเสียง ({item.audioDuration})</span>
                              </>
                            )}
                          </button>
                        )}
                    </div>

                    {/* Text Body */}
                    <div className="p-5 space-y-2.5">
                      <div className="text-[11px] font-semibold text-gold-warm/90 line-clamp-1">
                        {item.realmLabel}
                      </div>

                      <h3 className="text-lg font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-parchment-muted/85 font-light line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 border-t border-emerald-border/40 flex items-center justify-between text-xs">
                    <span className="text-parchment-muted/80 font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold-warm" />
                      <span>~{item.readingTimeMinutes} นาที</span>
                    </span>

                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        access.canAccess ? 'text-gold-light group-hover:text-gold-warm' : 'text-amber-300/90'
                      }`}
                    >
                      <span>{access.canAccess ? 'เข้าอ่านบทความ' : access.badgeText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : viewMode === 'details' ? (
          /* VIEW 2: COMPACT DETAILS TABLE (Fastest scanning, identical feel to /news details) */
          <div className="rounded-2xl overflow-hidden border border-emerald-border/70 bg-[#0B1913]/90 divide-y divide-emerald-border/40">
            {filteredItems.map((item) => {
              const access = checkOceanArticleAccess({
                realm: item.realm,
                archipelagoNumber: item.archipelagoNumber,
                chapterNumber: item.chapterNumber,
                isUnlocked: item.isUnlocked,
                status: item.status,
                publishedAt: item.publishedAt,
                member,
              });

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-surface/40 transition group"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold ${
                        item.realm === 'shallow'
                          ? 'bg-gold-warm/20 text-gold-light border border-gold-warm/40'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {item.realm === 'shallow'
                        ? `S-${item.chapterNumber}`
                        : `D${item.archipelagoNumber}-${item.chapterNumber}`}
                    </span>

                    <div className="min-w-0">
                      <div className="text-sm font-bold text-parchment-cream group-hover:text-gold-light transition truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-parchment-muted/75 truncate">
                        {item.realmLabel} • {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {item.audioUrl && (
                      <span className="text-[11px] text-gold-warm flex items-center gap-1 font-mono">
                        <Headphones className="w-3.5 h-3.5" />
                        <span>{item.audioDuration}</span>
                      </span>
                    )}

                    {access.canAccess ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        <span>อ่านได้ทันที</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-gold-warm/40 text-gold-light text-[11px] font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-gold-warm" />
                        <span>{access.badgeText}</span>
                      </span>
                    )}

                    <ArrowRight className="w-4 h-4 text-parchment-muted group-hover:text-gold-warm group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* VIEW 3: CONTENT LIST (Horizontal Rich Cards) */
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const access = checkOceanArticleAccess({
                realm: item.realm,
                archipelagoNumber: item.archipelagoNumber,
                chapterNumber: item.chapterNumber,
                isUnlocked: item.isUnlocked,
                status: item.status,
                publishedAt: item.publishedAt,
                member,
              });

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="p-4 sm:p-6 rounded-2xl bg-[#0D1E16]/90 border border-emerald-border/70 hover:border-gold-warm/50 flex flex-col sm:flex-row gap-5 transition group"
                >
                  <div className="w-full sm:w-52 h-36 rounded-xl overflow-hidden shrink-0 bg-slate-abyss relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-gold-warm">
                          {item.realmLabel}
                        </span>
                        {access.canAccess ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-400/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                            <Unlock className="w-3 h-3" />
                            <span>{access.badgeText}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-gold-warm/40 text-gold-light text-[11px] font-semibold flex items-center gap-1">
                            <Lock className="w-3 h-3 text-gold-warm" />
                            <span>{access.badgeText}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-parchment-muted font-light leading-relaxed line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-parchment-muted pt-2 border-t border-emerald-border/30">
                      <span className="flex items-center gap-2 font-mono">
                        <BookOpen className="w-3.5 h-3.5 text-gold-warm" />
                        <span>เวลาอ่าน ~{item.readingTimeMinutes} นาที</span>
                      </span>
                      <span className="text-gold-light font-semibold flex items-center gap-1">
                        <span>{access.canAccess ? 'เปิดอ่านเนื้อหาเต็ม' : 'ดูตัวอย่าง & สิทธิ์การเข้าถึง'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

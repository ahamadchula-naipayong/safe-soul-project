'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
  ExternalLink,
  Film,
  FileText,
  Clock,
  RotateCcw,
  Lock,
  Crown,
  UserCheck,
  AlignJustify,
  LayoutGrid,
  Rows,
} from 'lucide-react';
import { NewsItem } from '@/types';

type ViewMode = 'details' | 'tiles' | 'content';

export default function NewsIndexPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(48);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [subcategory, setSubcategory] = useState('all');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('content');
  const [isPending, startTransition] = useTransition();
  const { member, isLoggedIn } = useAuth();

  // Load preferred viewMode from localStorage (defaulting to 'content' with 48 items/page)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('safesoul_news_view_mode_v2') as ViewMode | null;
      if (saved && (saved === 'details' || saved === 'tiles' || saved === 'content')) {
        setViewMode(saved);
      }
    } catch {}
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('safesoul_news_view_mode_v2', mode);
    } catch {}
  };

  const canAccessItem = (item: NewsItem) => {
    if (!isLoggedIn || !member) return false;
    const isDeepdive = item.subcategory?.toLowerCase().includes('deepdive');
    if (!isDeepdive) return true;
    return member.tier === 'supporter_tier_2' || member.tier === 'founding_tier_3';
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch news data
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: debouncedSearch,
      subcategory,
      sortBy,
    });

    fetch(`/api/news?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          setNews(data.items || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
          if (data.subcategories && data.subcategories.length > 0) {
            setSubcategories(data.subcategories);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load news:', err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [page, limit, debouncedSearch, subcategory, sortBy]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    startTransition(() => {
      setPage(newPage);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    });
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSubcategory('all');
    setSortBy('latest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#08110D] text-parchment-cream font-thai selection:bg-gold-warm selection:text-slate-abyss pb-28">
      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO HEADER                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative pt-12 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-border/60 bg-gradient-to-b from-[#0F241A] via-[#0A1812] to-[#08110D] overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-radial-gradient from-gold-warm/10 via-emerald-deep/20 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-card/80 border border-gold-warm/30 text-gold-light text-xs font-semibold shadow-gold-sm">
            <Compass className="w-3.5 h-3.5 text-gold-warm" />
            <span>The Key of Return</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-thai-serif font-black text-parchment-cream tracking-tight leading-tight">
            สำนักข่าว The Key of Return
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gold-light/90 font-medium leading-relaxed font-thai">
            วิเคราะห์สถานการณ์โลกและภูมิรัฐศาสตร์
          </p>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-parchment-muted font-light leading-relaxed font-thai">
            รายงานและบทวิเคราะห์เชิงลึก ถอดรหัสเหตุการณ์สำคัญระดับโลกและภูมิรัฐศาสตร์
            ผ่านมุมมองที่ลึกซึ้ง ตรรกะข้อเท็จจริง และความเข้าใจในสัจธรรม
          </p>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs text-parchment-muted/80">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>ทั้งหมด {total.toLocaleString()} รายงาน</span>
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. SEARCH & CONTROLS TOOLBAR                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="sticky top-20 z-20 backdrop-blur-xl bg-[#08110D]/90 border-b border-emerald-border/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาตามหัวข้อข่าว, คำสำคัญ, หรือรหัส KOR... (เช่น อิหร่าน, KORDD1000)"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-emerald-card/90 border border-emerald-border focus:border-gold-warm text-sm text-parchment-cream placeholder-parchment-muted/50 outline-none transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-parchment-muted hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Category Filter */}
            {subcategories.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSubcategory('all');
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    subcategory === 'all'
                      ? 'bg-gold-warm text-slate-abyss font-bold shadow-gold-sm'
                      : 'bg-emerald-surface/60 hover:bg-emerald-surface text-parchment-cream border border-emerald-border'
                  }`}
                >
                  ทั้งหมด
                </button>
                {subcategories.map((subcat) => (
                  <button
                    key={subcat}
                    onClick={() => {
                      setSubcategory(subcat);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      subcategory === subcat
                        ? 'bg-gold-warm text-slate-abyss font-bold shadow-gold-sm'
                        : 'bg-emerald-surface/60 hover:bg-emerald-surface text-parchment-cream border border-emerald-border'
                    }`}
                  >
                    {subcat}
                  </button>
                ))}
              </div>
            )}

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest')}
              className="px-3 py-2 rounded-xl bg-emerald-surface/80 border border-emerald-border text-parchment-cream outline-none cursor-pointer hover:border-gold-warm transition text-xs"
            >
              <option value="latest">ใหม่ล่าสุด (Latest)</option>
              <option value="oldest">เก่าที่สุด (Oldest)</option>
            </select>

            {/* View Mode Switcher (Details / Tiles / Content) */}
            <div className="flex items-center rounded-xl bg-emerald-card/90 border border-emerald-border p-1 gap-1 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => handleViewModeChange('details')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
                  viewMode === 'details'
                    ? 'bg-gold-warm text-slate-abyss font-bold shadow-gold-sm'
                    : 'text-parchment-muted hover:text-parchment-cream hover:bg-emerald-surface/60'
                }`}
                title="Details (รายชื่อเจาะลึก - โหลดเร็วที่สุด)"
              >
                <AlignJustify className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Details</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange('tiles')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
                  viewMode === 'tiles'
                    ? 'bg-gold-warm text-slate-abyss font-bold shadow-gold-sm'
                    : 'text-parchment-muted hover:text-parchment-cream hover:bg-emerald-surface/60'
                }`}
                title="Tiles (แผ่นการ์ดกะทัดรัด)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tiles</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange('content')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
                  viewMode === 'content'
                    ? 'bg-gold-warm text-slate-abyss font-bold shadow-gold-sm'
                    : 'text-parchment-muted hover:text-parchment-cream hover:bg-emerald-surface/60'
                }`}
                title="Content (เนื้อหาและรูปภาพเต็ม)"
              >
                <Rows className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Content</span>
              </button>
            </div>

            {/* Limit Selector */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="hidden sm:inline-block px-2.5 py-2 rounded-xl bg-emerald-surface/80 border border-emerald-border text-parchment-cream outline-none cursor-pointer text-xs"
            >
              <option value="12">12 ข่าว/หน้า</option>
              <option value="24">24 ข่าว/หน้า</option>
              <option value="48">48 ข่าว/หน้า</option>
            </select>

            {(search || subcategory !== 'all' || sortBy !== 'latest') && (
              <button
                onClick={clearFilters}
                className="px-2.5 py-1.5 rounded-xl text-parchment-muted hover:text-gold-light flex items-center gap-1 transition"
                title="ล้างตัวกรอง"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ต</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. NEWS LIST / CARDS GRID                                          */}
      {/* ------------------------------------------------------------------ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Access Guidance Banner */}
        {!isLoggedIn ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F2218]/90 border border-gold-warm/40 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-warm/15 border border-gold-warm/40 flex items-center justify-center text-gold-warm shrink-0 shadow-gold-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-gold-light flex items-center gap-2">
                  <span>โหมดพรีวิวข่าวสาร (Preview Only)</span>
                  <span className="px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px]">
                    ยังไม่ได้เข้าสู่ระบบ
                  </span>
                </div>
                <div className="text-parchment-muted text-xs font-light">
                  ทั้งหมดแสดงเฉพาะพรีวิว • สมาชิกทั่วไป (Free Tier) สามารถเข้าสู่ระบบเพื่ออ่านเนื้อหาข่าวสารได้ทันที
                </div>
              </div>
            </div>
            <Link
              href="/login?redirect=/news"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs shrink-0 shadow-gold-sm transition hover:scale-105 active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ / สมาชิก</span>
            </Link>
          </div>
        ) : member?.tier === 'free_tier_1' ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#12251B] border border-emerald-border/80 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-surface border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-emerald-300 flex items-center gap-2">
                  <span>คุณคือ Free Member (Member #{member.memberNumber})</span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                    เข้าสู่ระบบแล้ว
                  </span>
                </div>
                <div className="text-parchment-muted text-xs font-light">
                  ข่าวทั่วไปอ่านได้ฟรี • สำหรับบทวิเคราะห์หมวด Deepdive สงวนสิทธิ์สำหรับสมาชิกรายเดือน (Supporter) และตลอดชีพ (Founding 100)
                </div>
              </div>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-xs shrink-0 shadow-gold-sm transition hover:scale-105 active:scale-95"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>อัปเกรดเพื่ออ่าน Deepdive</span>
            </Link>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#173827] to-[#0F261C] border border-gold-warm/40 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-warm/20 border border-gold-warm/50 flex items-center justify-center text-gold-warm shrink-0 shadow-gold-sm">
                <Crown className="w-5 h-5 fill-current" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-gold-light flex items-center gap-2">
                  <span>สถานะสิทธิ์: ปลดล็อกเต็มรูปแบบ</span>
                  <span className="px-2 py-0.2 rounded-full bg-gold-warm/20 text-gold-light text-[10px]">
                    Member #{member?.memberNumber}
                  </span>
                </div>
                <div className="text-parchment-muted text-xs font-light">
                  คุณมีสิทธิ์เข้าถึงบทวิเคราะห์และรายงานเจาะลึก Deepdive ทุกรายการอย่างสมบูรณ์
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          /* Multi-mode Skeleton Loader */
          viewMode === 'details' ? (
            <div className="rounded-2xl bg-[#0A1610]/80 border border-emerald-border/60 p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : viewMode === 'tiles' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 bg-emerald-card/40 border border-emerald-border/40 animate-pulse space-y-3"
                >
                  <div className="w-full h-36 bg-black/40 rounded-xl" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="h-5 bg-white/10 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5 bg-emerald-card/40 border border-emerald-border/40 animate-pulse space-y-4"
                >
                  <div className="w-full h-48 bg-black/40 rounded-xl" />
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-6 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-full" />
                </div>
              ))}
            </div>
          )
        ) : news.length > 0 ? (
          /* ---------------------------------------------------------------- */
          /* MODE 1: DETAILS (ค่าเริ่มต้น - โหลดเร็วที่สุด ไม่มี Image Overhead)  */
          /* ---------------------------------------------------------------- */
          viewMode === 'details' ? (
            <div className="rounded-2xl bg-[#0A1610]/95 border border-emerald-border/70 overflow-hidden shadow-xl">
              {/* Desktop Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#0D2016] border-b border-emerald-border/60 text-xs font-semibold text-gold-light/90">
                <div className="col-span-2">รหัส / วันที่</div>
                <div className="col-span-6">พาดหัวข่าวหลัก & ประเด็นเจาะลึก</div>
                <div className="col-span-2 text-center">หมวดหมู่ / สิทธิ์</div>
                <div className="col-span-2 text-right">การเข้าถึง</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-emerald-border/40">
                {news.map((item) => {
                  const canAccess = canAccessItem(item);
                  return (
                    <div
                      key={item.id}
                      className="group p-4 sm:p-5 lg:px-6 lg:py-4 hover:bg-[#0E2319] transition-colors flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 items-start lg:items-center"
                    >
                      {/* Col 1: Code & Date */}
                      <div className="col-span-2 flex lg:flex-col items-center lg:items-start justify-between w-full lg:w-auto gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded bg-black/70 border border-gold-warm/40 text-gold-light font-mono font-bold text-xs shadow-sm">
                            {item.korNo}
                          </span>
                          {item.video && (
                            <span
                              title="มีคลิปวิดีโอ"
                              className="p-1 rounded bg-black/60 text-amber-400 border border-amber-400/30"
                            >
                              <Film className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-parchment-muted font-light">
                          <Calendar className="w-3.5 h-3.5 text-gold-warm shrink-0" />
                          <time dateTime={item.date} className="whitespace-nowrap">
                            {item.dateShort}
                          </time>
                        </div>
                      </div>

                      {/* Col 2: Headline & Topic Lead */}
                      <div className="col-span-6 space-y-1 w-full">
                        <h2 className="text-sm sm:text-base font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition-colors leading-snug">
                          <Link href={`/news/${item.slug}`} className="hover:underline">
                            {item.title}
                          </Link>
                        </h2>
                        {item.topicLead && item.topicLead !== item.title && (
                          <p className="text-xs text-parchment-muted/80 line-clamp-1 font-light">
                            <span className="text-gold-warm/90 font-medium">ประเด็น:</span>{' '}
                            {item.topicLead}
                          </p>
                        )}
                      </div>

                      {/* Col 3: Subcategory & Access Badges */}
                      <div className="col-span-2 flex lg:justify-center items-center gap-2 w-full lg:w-auto">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-medium">
                          {item.subcategory}
                        </span>
                        {!canAccess ? (
                          <span className="px-2 py-0.5 rounded-md bg-black/80 text-amber-300 border border-amber-400/40 text-[10px] font-medium flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>{!isLoggedIn ? 'พรีวิว' : 'Supporter'}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-400/40 text-[10px] font-medium flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-gold-warm" />
                            <span>ปลดล็อก</span>
                          </span>
                        )}
                      </div>

                      {/* Col 4: Action Button */}
                      <div className="col-span-2 flex justify-end w-full lg:w-auto">
                        <Link
                          href={`/news/${item.slug}`}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                            canAccess
                              ? 'gold-bevel-button text-slate-abyss font-bold shadow-gold-sm hover:scale-105'
                              : 'bg-emerald-surface/80 hover:bg-emerald-surface text-amber-300 border border-emerald-border'
                          }`}
                        >
                          <span>{canAccess ? 'อ่านเจาะลึก' : 'ดูพรีวิว'}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'tiles' ? (
            /* ---------------------------------------------------------------- */
            /* MODE 2: TILES (แผ่นการ์ดกะทัดรัด จุได้เยอะ อ่านสบายตา)                  */
            /* ---------------------------------------------------------------- */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {news.map((item) => {
                const canAccess = canAccessItem(item);
                return (
                  <article
                    key={item.id}
                    className="group relative rounded-2xl bg-[#0C1A13]/90 hover:bg-[#0E2017] border border-emerald-border/70 hover:border-gold-warm/50 transition-all duration-300 shadow-md hover:shadow-gold-sm flex flex-col justify-between overflow-hidden"
                  >
                    <Link
                      href={`/news/${item.slug}`}
                      className="block relative w-full h-40 overflow-hidden bg-black/60"
                    >
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-parchment-muted/40 font-mono text-xs">
                          No Image
                        </div>
                      )}

                      <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-bold text-gold-light border border-gold-warm/40 font-mono">
                          {item.korNo}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 backdrop-blur-md text-[10px] font-medium text-emerald-300 border border-emerald-500/40">
                          {item.subcategory}
                        </span>
                      </div>

                      {item.video && (
                        <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-amber-400 text-[10px] border border-amber-400/30 flex items-center gap-1">
                          <Film className="w-3 h-3" />
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0C1A13] to-transparent pointer-events-none" />
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-parchment-muted">
                          <Calendar className="w-3 h-3 text-gold-warm" />
                          <time dateTime={item.date}>{item.dateShort}</time>
                        </div>

                        <h2 className="text-sm font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition-colors leading-snug line-clamp-2">
                          <Link href={`/news/${item.slug}`} className="hover:underline">
                            {item.title}
                          </Link>
                        </h2>
                      </div>

                      <div className="pt-3 border-t border-emerald-border/40 flex items-center justify-between text-xs">
                        {!canAccess ? (
                          <span className="text-amber-300 text-[11px] flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>พรีวิว</span>
                          </span>
                        ) : (
                          <span className="text-emerald-300 text-[11px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-gold-warm" />
                            <span>ปลดล็อก</span>
                          </span>
                        )}

                        <Link
                          href={`/news/${item.slug}`}
                          className="font-bold text-[11px] text-gold-light hover:text-gold-warm inline-flex items-center gap-1"
                        >
                          <span>{canAccess ? 'อ่านต่อ' : 'ดูพรีวิว'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* ---------------------------------------------------------------- */
            /* MODE 3: CONTENT (เนื้อหาและรูปภาพใหญ่เต็มรูปแบบ - สไตล์ดั้งเดิม)        */
            /* ---------------------------------------------------------------- */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {news.map((item) => {
                const canAccess = canAccessItem(item);
                return (
                  <article
                    key={item.id}
                    className="group relative rounded-2xl bg-[#0C1A13]/90 hover:bg-[#0E2017] border border-emerald-border/70 hover:border-gold-warm/50 transition-all duration-300 shadow-md hover:shadow-gold-sm flex flex-col justify-between overflow-hidden"
                  >
                    {/* Image Thumbnail with zoom effect */}
                    <Link
                      href={`/news/${item.slug}`}
                      className="block relative w-full h-52 sm:h-56 overflow-hidden bg-black/60"
                    >
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-parchment-muted/40 font-mono text-xs">
                          No Image Available
                        </div>
                      )}

                      {/* Badges on Image */}
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[11px] font-bold text-gold-light border border-gold-warm/40 font-mono">
                          {item.korNo}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md text-[11px] font-medium text-emerald-300 border border-emerald-500/40">
                          {item.subcategory}
                        </span>
                        {!canAccess ? (
                          <span className="px-2 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-medium text-amber-300 border border-amber-400/40 flex items-center gap-1 shadow-sm">
                            <Lock className="w-2.5 h-2.5" />
                            <span>{!isLoggedIn ? 'พรีวิว' : 'เฉพาะ Supporter'}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-emerald-950/85 backdrop-blur-md text-[10px] font-semibold text-emerald-300 border border-emerald-400/40 flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-2.5 h-2.5 text-gold-warm" />
                            <span>ปลดล็อกแล้ว</span>
                          </span>
                        )}
                      </div>

                      {item.video && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 text-xs border border-amber-400/30 flex items-center gap-1">
                          <Film className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">มีคลิป</span>
                        </div>
                      )}

                      {/* Bottom Image Gradient */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0C1A13] to-transparent pointer-events-none" />
                    </Link>

                    {/* Card Content Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Date Row */}
                        <div className="flex items-center gap-2 text-xs text-parchment-muted font-light">
                          <Calendar className="w-3.5 h-3.5 text-gold-warm" />
                          <time dateTime={item.date}>{item.dateFormatted}</time>
                          <span className="text-white/20">•</span>
                          <span>{item.sections.length} ส่วนเนื้อหา</span>
                        </div>

                        {/* Headline Topic */}
                        <h2 className="text-base sm:text-lg font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition-colors leading-snug line-clamp-3">
                          <Link href={`/news/${item.slug}`} className="hover:underline">
                            {item.title}
                          </Link>
                        </h2>

                        {/* Topic Lead subtext */}
                        {item.topicLead && item.topicLead !== item.title && (
                          <p className="text-xs text-gold-light/80 font-light line-clamp-1">
                            <span className="text-gold-warm font-medium">ประเด็น:</span>{' '}
                            {item.topicLead}
                          </p>
                        )}

                        {/* Excerpt Snippet */}
                        <p className="text-xs text-parchment-muted/90 font-light leading-relaxed line-clamp-3">
                          {item.excerpt}
                        </p>
                      </div>

                      {/* Card Bottom Action */}
                      <div className="pt-4 border-t border-emerald-border/40 flex items-center justify-between text-xs">
                        <span className="text-gold-warm/80 font-mono text-[11px]">
                          {item.dateShort}
                        </span>

                        {!canAccess ? (
                          <Link
                            href={`/news/${item.slug}`}
                            className="inline-flex items-center gap-1.5 font-semibold text-xs text-amber-300 hover:text-gold-light transition"
                          >
                            <Lock className="w-3.5 h-3.5 text-gold-warm" />
                            <span>ดูพรีวิว {!isLoggedIn ? '(ต้องล็อคอิน)' : '(เฉพาะผู้สนับสนุน)'}</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/news/${item.slug}`}
                            className="inline-flex items-center gap-1.5 font-bold text-xs text-gold-light group-hover:text-gold-warm transition"
                          >
                            <span>อ่านเจาะลึกฉบับเต็ม</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )
        ) : (
          /* Empty Search State */
          <div className="p-12 text-center rounded-3xl bg-emerald-card/40 border border-emerald-border/40 max-w-lg mx-auto space-y-4">
            <Compass className="w-12 h-12 text-gold-warm/60 mx-auto" />
            <h3 className="text-lg font-bold text-parchment-cream">ไม่พบข่าวสารที่ค้นหา</h3>
            <p className="text-xs text-parchment-muted">
              ลองเปลี่ยนคำค้นหา หรือกดรีเซ็ตตัวกรองเพื่อดูข่าวทั้งหมด
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm"
            >
              ดูข่าวทั้งหมด ({total})
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 4. PAGINATION CONTROLS                                             */}
        {/* ------------------------------------------------------------------ */}
        {totalPages > 1 && (
          <nav
            aria-label="การแบ่งหน้า"
            className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-card/50 border border-emerald-border/60 text-xs"
          >
            <div className="text-parchment-muted">
              แสดงหน้า <strong className="text-gold-light">{page}</strong> จากทั้งหมด{' '}
              <strong className="text-gold-light">{totalPages}</strong> หน้า (รวม{' '}
              {total.toLocaleString()} รายการ)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-3.5 py-2 rounded-xl bg-emerald-surface hover:bg-emerald-light disabled:opacity-30 disabled:hover:bg-emerald-surface border border-emerald-border text-parchment-cream transition flex items-center gap-1"
                aria-label="หน้าก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>ก่อนหน้า</span>
              </button>

              {/* Quick page buttons */}
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  let pNum = page - 2 + idx;
                  if (page < 3) pNum = idx + 1;
                  if (page > totalPages - 2) pNum = totalPages - 4 + idx;
                  if (pNum < 1 || pNum > totalPages) return null;

                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-8 h-8 rounded-lg font-semibold transition ${
                        pNum === page
                          ? 'bg-gold-warm text-slate-abyss shadow-sm'
                          : 'bg-emerald-card hover:bg-emerald-surface text-parchment-muted border border-emerald-border/60'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3.5 py-2 rounded-xl bg-emerald-surface hover:bg-emerald-light disabled:opacity-30 disabled:hover:bg-emerald-surface border border-emerald-border text-parchment-cream transition flex items-center gap-1"
                aria-label="หน้าถัดไป"
              >
                <span>ถัดไป</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </nav>
        )}
      </main>
    </div>
  );
}

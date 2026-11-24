'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { NewsArticle } from '@/types';
import {
  Compass,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Film,
  ExternalLink,
  Sparkles,
  FileText,
} from 'lucide-react';

interface NewsDeckSliderProps {
  articles: NewsArticle[];
}

export function NewsDeckSlider({ articles }: NewsDeckSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!articles || articles.length === 0) {
    return null;
  }

  const activeArticle = articles[activeIndex] || articles[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev < articles.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : articles.length - 1));
  };

  return (
    <div className="w-full space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* CONTROLS HEADER BAR                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gold-light font-bold">
            รายงานที่ {activeIndex + 1} จาก {articles.length} ข่าวล่าสุด
          </span>
          <span className="text-white/20">•</span>
          <span className="text-parchment-muted font-light hidden sm:inline">
            คลิกที่กล่องเพื่อขยายเปิดไปทางขวา
          </span>
        </div>

        {/* Previous / Next Arrow Controls & Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-emerald-surface border border-emerald-border hover:border-gold-warm/50 text-parchment-cream transition shadow-sm cursor-pointer group"
            aria-label="ข่าวก่อนหน้า"
            title="ข่าวก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4 text-gold-warm group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* News Number Pills Selector */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-black/50 border border-emerald-border/60">
            {articles.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition ${
                  activeIndex === idx
                    ? 'bg-gold-warm text-slate-abyss shadow-gold-sm'
                    : 'text-parchment-muted hover:text-parchment-cream hover:bg-white/5'
                }`}
                title={`${item.korNo}: ${item.title}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-emerald-surface border border-emerald-border hover:border-gold-warm/50 text-parchment-cream transition shadow-sm cursor-pointer group"
            aria-label="ข่าวถัดไป"
            title="ข่าวถัดไป"
          >
            <ChevronRight className="w-4 h-4 text-gold-warm group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DESKTOP INTERFACE: OVERLAPPING ACCORDION DECK (เปิดขยายไปทางขวา)    */}
      {/* ------------------------------------------------------------------ */}
      <div
        ref={containerRef}
        className="deck-frame hidden lg:flex items-stretch gap-2.5 w-full min-h-[600px] overflow-hidden rounded-3xl p-3 bg-[#040C08]/90 border border-gold-warm/25 shadow-2xl relative"
      >
        {articles.map((item, idx) => {
          const isActive = activeIndex === idx;

          return (
            <div
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className={`deck-card relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out border ${
                isActive
                  ? 'deck-card-active flex-[7] border-gold-warm/60 shadow-[0_0_40px_rgba(244,196,48,0.2)]'
                  : 'deck-card-spine flex-[1] border-emerald-border/50 hover:border-gold-warm/40 bg-[#091610] opacity-90 hover:opacity-100'
              }`}
            >
              {/* Background Cover Image with Zoom */}
              {item.image ? (
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700"
                  style={{
                    backgroundImage: `url('${item.image}')`,
                  }}
                />
              ) : (
                <div className="deck-fallback-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#0F241A] to-[#060D0A]" />
              )}

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 ${
                  isActive
                    ? 'deck-scrim-active bg-gradient-to-t from-black via-black/80 to-black/50'
                    : 'deck-scrim-spine bg-gradient-to-t from-black/95 via-black/85 to-black/70'
                }`}
              />

              {/* ---------------------------------------------------------- */}
              {/* COLLAPSED VIEW (When inactive: Vertical Tab peeking)       */}
              {/* ---------------------------------------------------------- */}
              {!isActive && (
                <div className="relative h-full flex flex-col justify-between items-center py-6 px-1.5 z-10">
                  <span className="w-8 h-8 rounded-xl bg-black/80 border border-gold-warm/40 text-gold-light font-mono font-bold text-xs flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </span>

                  {/* Vertical Rotated Text */}
                  <div className="rotate-180 [writing-mode:vertical-rl] text-center my-auto space-y-2">
                    <span className="font-thai-serif font-bold text-xs text-parchment-cream tracking-wide line-clamp-1">
                      {item.korNo}
                    </span>
                  </div>

                  <span className="text-[10px] text-parchment-muted/80 font-mono">
                    #{idx + 1}
                  </span>
                </div>
              )}

              {/* ---------------------------------------------------------- */}
              {/* EXPANDED VIEW (When active: Opens wide to the right)       */}
              {/* ---------------------------------------------------------- */}
              {isActive && (
                <div className="relative h-full p-7 sm:p-9 flex flex-col justify-between gap-4 z-10 animate-fade-in">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-gold-warm text-slate-abyss text-xs font-mono font-black uppercase tracking-wider shadow-gold-sm">
                        {item.korNo}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                        {item.subcategory || 'วิเคราะห์สถานการณ์'}
                      </span>
                      {item.video && (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-semibold flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          <span>มีคลิป</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-parchment-muted font-mono bg-black/60 px-3 py-1 rounded-lg border border-white/10">
                      <Calendar className="w-3.5 h-3.5 text-gold-warm" />
                      <span>{item.dateFormatted || item.date}</span>
                    </div>
                  </div>

                  {/* Center: Headline & Excerpt */}
                  <div className="space-y-4 my-auto max-w-3xl">
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-widest text-gold-warm font-cinzel font-semibold flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-gold-warm" />
                        <span>THE KEY OF RETURN • LATEST DISPATCH</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-thai-serif font-black text-parchment-cream leading-snug drop-shadow-sm line-clamp-3">
                        {item.title}
                      </h2>
                    </div>

                    {item.excerpt && (
                      <p className="text-sm sm:text-base text-parchment-muted/95 font-light leading-relaxed line-clamp-3">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 border-t border-emerald-border/50 flex items-center justify-between">
                    <Link
                      href="/news"
                      className="text-xs text-gold-light hover:text-gold-warm font-thai flex items-center gap-1 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>อ่านข่าว KOR ทั้งหมด (5,000+ รายงาน)</span>
                    </Link>

                    <Link
                      href={`/news/${item.slug}`}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gold-bevel-button text-slate-abyss text-xs sm:text-sm font-bold shadow-gold-sm hover:scale-105 transition"
                    >
                      <span>อ่านเจาะลึกรายงานนี้</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE INTERFACE: SWIPEABLE CARDS WITH HEADLINE & READ LINK        */}
      {/* ------------------------------------------------------------------ */}
      <div className="lg:hidden flex flex-col gap-6">
        <div className="relative rounded-3xl overflow-hidden border border-gold-warm/50 bg-[#091610] shadow-xl">
          {/* Cover Image */}
          <div className="relative h-56 w-full overflow-hidden bg-black/60">
            {activeArticle.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0F241A] to-[#060D0A]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#091610] via-transparent to-black/60" />

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-gold-warm text-slate-abyss text-xs font-mono font-bold shadow-sm">
                {activeArticle.korNo}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 text-xs font-medium border border-emerald-500/40">
                {activeArticle.subcategory || 'รายงาน'}
              </span>
            </div>

            <div className="absolute bottom-3 right-3 text-xs text-parchment-muted font-mono bg-black/60 px-2.5 py-1 rounded">
              {activeArticle.dateFormatted || activeArticle.date}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            <div>
              <div className="text-[11px] font-mono text-gold-warm uppercase tracking-wider">
                THE KEY OF RETURN • LATEST
              </div>
              <h2 className="text-xl sm:text-2xl font-thai-serif font-black text-parchment-cream mt-1 leading-snug">
                {activeArticle.title}
              </h2>
            </div>

            {activeArticle.excerpt && (
              <p className="text-xs text-parchment-muted font-light leading-relaxed line-clamp-3">
                {activeArticle.excerpt}
              </p>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href={`/news/${activeArticle.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm transition"
              >
                <span>อ่านเจาะลึกรายงานนี้</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/news"
                className="w-full text-center text-xs text-gold-light hover:text-white py-2"
              >
                ดูสำนักข่าว The Key of Return ทั้งหมด →
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal News Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {articles.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-mono font-semibold transition border ${
                activeIndex === idx
                  ? 'bg-gold-warm text-slate-abyss border-gold-warm font-bold shadow-sm'
                  : 'bg-emerald-card text-parchment-muted border-emerald-border hover:text-white'
              }`}
            >
              {idx + 1}. {item.korNo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

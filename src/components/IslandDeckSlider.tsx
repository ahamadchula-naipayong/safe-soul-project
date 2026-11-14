'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { OneshotChapter } from '@/types';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  Eye,
  Heart,
  Scale,
  Anchor,
} from 'lucide-react';

interface IslandDeckSliderProps {
  chapters: OneshotChapter[];
}

export function IslandDeckSlider({ chapters }: IslandDeckSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeChapter = chapters[activeIndex] || chapters[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev < chapters.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : chapters.length - 1));
  };

  return (
    <div className="w-full space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* CONTROLS HEADER BAR                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-warm animate-pulse" />
          <span className="text-gold-light font-bold">
            เกาะที่ {activeChapter.chapterNumber} จากทั้งหมด {chapters.length} เกาะ
          </span>
          <span className="text-white/20">•</span>
          <span className="text-parchment-muted font-light hidden sm:inline">
            คลิกที่กล่องเพื่อขยายเปิดไปทางขวา
          </span>
        </div>

        {/* Previous / Next Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-emerald-surface border border-emerald-border hover:border-gold-warm/50 text-parchment-cream transition shadow-sm cursor-pointer group"
            aria-label="เกาะก่อนหน้า"
            title="เกาะก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4 text-gold-warm group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Island Pills Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/50 border border-emerald-border/60">
            {chapters.map((ch, idx) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition ${
                  activeIndex === idx
                    ? 'bg-gold-warm text-slate-abyss shadow-gold-sm'
                    : 'text-parchment-muted hover:text-parchment-cream hover:bg-white/5'
                }`}
              >
                {ch.chapterNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-emerald-surface border border-emerald-border hover:border-gold-warm/50 text-parchment-cream transition shadow-sm cursor-pointer group"
            aria-label="เกาะถัดไป"
            title="เกาะถัดไป"
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
        className="hidden lg:flex items-stretch gap-3 w-full h-[580px] overflow-hidden rounded-3xl p-3 bg-[#040C08]/90 border border-emerald-border/60 shadow-2xl relative"
      >
        {chapters.map((ch, idx) => {
          const isActive = activeIndex === idx;

          return (
            <div
              key={ch.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out border ${
                isActive
                  ? 'flex-[6] border-gold-warm/60 shadow-[0_0_40px_rgba(244,196,48,0.25)]'
                  : 'flex-[1] border-emerald-border/50 hover:border-gold-warm/30 bg-[#091610] opacity-85 hover:opacity-100'
              }`}
            >
              {/* Background Cover Image with Zoom */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700"
                style={{
                  backgroundImage: `url('${ch.image}')`,
                }}
              />

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 ${
                  isActive
                    ? 'bg-gradient-to-t from-black via-black/75 to-black/40'
                    : 'bg-gradient-to-t from-black/95 via-black/80 to-black/60'
                }`}
              />

              {/* ---------------------------------------------------------- */}
              {/* COLLAPSED VIEW (When inactive: Vertical Tab peeking)       */}
              {/* ---------------------------------------------------------- */}
              {!isActive && (
                <div className="relative h-full flex flex-col justify-between items-center py-6 px-2 z-10">
                  <span className="w-8 h-8 rounded-xl bg-black/80 border border-gold-warm/40 text-gold-light font-mono font-bold text-xs flex items-center justify-center shadow-sm">
                    {ch.chapterNumber}
                  </span>

                  {/* Vertical Rotated Text */}
                  <div className="rotate-180 [writing-mode:vertical-rl] text-center my-auto space-y-2">
                    <span className="font-thai-serif font-bold text-sm text-parchment-cream tracking-wide">
                      {ch.titleEn}
                    </span>
                  </div>

                  <span className="text-[10px] text-parchment-muted/80 font-mono">
                    เกาะที่ {ch.chapterNumber}
                  </span>
                </div>
              )}

              {/* ---------------------------------------------------------- */}
              {/* EXPANDED VIEW (When active: Opens wide to the right)       */}
              {/* ---------------------------------------------------------- */}
              {isActive && (
                <div className="relative h-full p-8 sm:p-10 flex flex-col justify-between z-10 animate-fade-in">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-xl bg-gold-warm text-slate-abyss text-xs font-mono font-black uppercase tracking-wider shadow-gold-sm">
                        เกาะที่ {ch.chapterNumber} / {chapters.length}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                        S.A.F.E. SERIES
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-parchment-muted font-mono bg-black/60 px-3 py-1 rounded-lg border border-white/10">
                      <Clock className="w-3.5 h-3.5 text-gold-warm" />
                      <span>~{ch.readingTimeMinutes} นาที</span>
                    </div>
                  </div>

                  {/* Center: Topics ใหญ่ & คำอธิบายย่อย */}
                  <div className="space-y-4 my-auto max-w-2xl">
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-widest text-gold-warm font-cinzel font-semibold flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-gold-warm" />
                        <span>ISLAND EXPEDITION • {ch.slug}</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-thai-serif font-black text-parchment-cream leading-tight drop-shadow-md">
                        {ch.titleEn}
                      </h2>
                      <h3 className="text-lg sm:text-2xl font-thai-serif font-bold text-gold-light/95 leading-snug">
                        {ch.titleTh}
                      </h3>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 border-t border-emerald-border/50 flex items-center justify-end">
                    <Link
                      href={`/oneshot/${ch.slug}`}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gold-bevel-button text-slate-abyss text-xs sm:text-sm font-bold shadow-gold-sm hover:scale-105 transition"
                    >
                      <span>ออกสำรวจเกาะนี้ (อ่านฉบับเต็ม)</span>
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
      {/* MOBILE INTERFACE: SWIPEABLE CARDS WITH BIG TOPIC & READ LINK       */}
      {/* ------------------------------------------------------------------ */}
      <div className="lg:hidden flex flex-col gap-6">
        <div className="relative rounded-3xl overflow-hidden border border-gold-warm/50 bg-[#091610] shadow-xl">
          {/* Cover Image */}
          <div className="relative h-56 w-full overflow-hidden bg-black/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeChapter.image}
              alt={activeChapter.titleEn}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#091610] via-transparent to-black/60" />

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-gold-warm text-slate-abyss text-xs font-mono font-bold shadow-sm">
                เกาะที่ {activeChapter.chapterNumber} / {chapters.length}
              </span>
            </div>

            <div className="absolute bottom-3 right-3 text-xs text-parchment-muted font-mono bg-black/60 px-2.5 py-1 rounded">
              ~{activeChapter.readingTimeMinutes} นาที
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            <div>
              <div className="text-[11px] font-mono text-gold-warm uppercase tracking-wider">
                THE S.A.F.E. EXPEDITION
              </div>
              <h2 className="text-2xl font-thai-serif font-black text-parchment-cream mt-0.5">
                {activeChapter.titleEn}
              </h2>
              <h3 className="text-base font-thai-serif font-bold text-gold-light mt-1">
                {activeChapter.titleTh}
              </h3>
            </div>

            <Link
              href={`/oneshot/${activeChapter.slug}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm transition"
            >
              <span>ออกสำรวจเกาะนี้ (อ่านฉบับเต็ม)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Mobile Horizontal Island Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {chapters.map((ch, idx) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition border ${
                activeIndex === idx
                  ? 'bg-gold-warm text-slate-abyss border-gold-warm font-bold shadow-sm'
                  : 'bg-emerald-card text-parchment-muted border-emerald-border hover:text-white'
              }`}
            >
              เกาะ {ch.chapterNumber}: {ch.titleEn.split(' ')[2] || ch.titleEn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

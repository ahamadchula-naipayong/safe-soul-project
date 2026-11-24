'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DeepOceanArchipelago } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { checkOceanArticleAccess } from '@/lib/oceanAccess';
import {
  formatThaiScheduleDate,
  getDeepOceanScheduledIso,
  isReleasedBySchedule,
} from '@/lib/releaseSchedule';
import {
  Compass,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Lock,
  Unlock,
  BookOpen,
  Anchor,
  Clock,
  Layers,
} from 'lucide-react';

interface DeepOceanArchipelagoDeckProps {
  archipelagos: DeepOceanArchipelago[];
}

export function DeepOceanArchipelagoDeck({
  archipelagos,
}: DeepOceanArchipelagoDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { member } = useAuth();

  if (!archipelagos || archipelagos.length === 0) return null;

  const active = archipelagos[activeIndex] || archipelagos[0];
  const isUpcoming = active.status === 'upcoming';

  const handleNext = () => {
    setActiveIndex((prev) => (prev < archipelagos.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : archipelagos.length - 1));
  };

  return (
    <div className="w-full space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* CONTROLS HEADER BAR                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-gold-light font-bold">
            หมู่เกาะที่ {active.archipelagoNumber} จาก 10 หมู่เกาะ (ทะเลน้ำลึก)
          </span>
          <span className="text-white/20">•</span>
          <span className="text-parchment-muted font-light hidden sm:inline">
            {isUpcoming ? 'หมู่เกาะนี้กำลังอยู่ระหว่างการจัดทำ (เร็วๆ นี้)' : 'เปิดให้เข้าศึกษาบทที่ 1 เรียบร้อย'}
          </span>
        </div>

        {/* Prev / Next controls and pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-emerald-surface border border-emerald-border hover:border-gold-warm/50 text-parchment-cream transition shadow-sm cursor-pointer group"
            aria-label="หมู่เกาะก่อนหน้า"
            title="หมู่เกาะก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4 text-gold-warm group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* 10 Archipelago Pills */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-black/50 border border-emerald-border/60">
            {archipelagos.map((item, idx) => {
              const isItemUpcoming = item.status === 'upcoming';
              const isSelected = activeIndex === idx;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center ${
                    isSelected
                      ? 'bg-gold-warm text-slate-abyss shadow-gold-sm'
                      : isItemUpcoming
                      ? 'text-parchment-muted/50 hover:text-parchment-cream hover:bg-white/5'
                      : 'text-parchment-cream hover:bg-white/10'
                  }`}
                  title={`${item.titleEn} (${isItemUpcoming ? 'เร็วๆ นี้' : 'เปิดแล้ว'})`}
                >
                  {item.archipelagoNumber}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-emerald-surface border border-emerald-border hover:border-gold-warm/50 text-parchment-cream transition shadow-sm cursor-pointer group"
            aria-label="หมู่เกาะถัดไป"
            title="หมู่เกาะถัดไป"
          >
            <ChevronRight className="w-4 h-4 text-gold-warm group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DESKTOP INTERFACE: PANORAMIC ACCORDION DECK                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="deck-frame hidden lg:flex items-stretch gap-2.5 w-full min-h-[620px] rounded-3xl p-3 bg-[#030906]/95 border border-gold-warm/25 shadow-2xl relative overflow-hidden">
        {archipelagos.map((arch, idx) => {
          const isActive = activeIndex === idx;
          const archUpcoming = arch.status === 'upcoming';

          return (
            <div
              key={arch.id}
              onClick={() => setActiveIndex(idx)}
              className={`deck-card relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out border ${
                isActive
                  ? 'deck-card-active flex-[8] border-gold-warm/70 shadow-[0_0_50px_rgba(244,196,48,0.2)]'
                  : 'deck-card-spine flex-[1] border-emerald-border/40 hover:border-gold-warm/40 bg-[#07130E] opacity-90 hover:opacity-100'
              }`}
            >
              {/* Background Cover Image */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700"
                style={{
                  backgroundImage: `url('${arch.coverImage}')`,
                }}
              />

              {/* Gradient Darkness Overlay */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 ${
                  isActive
                    ? 'deck-scrim-active bg-gradient-to-t from-black via-[#040C08]/85 to-black/60'
                    : 'deck-scrim-spine bg-gradient-to-t from-black/95 via-black/85 to-black/70'
                }`}
              />

              {/* ---------------------------------------------------------- */}
              {/* COLLAPSED VIEW (When inactive: Vertical Tab peeking)       */}
              {/* ---------------------------------------------------------- */}
              {!isActive && (
                <div className="relative h-full flex flex-col justify-between items-center py-6 px-1.5 z-10">
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-8 h-8 rounded-xl bg-black/80 border border-gold-warm/40 text-gold-light font-mono font-bold text-xs flex items-center justify-center shadow-sm">
                      {arch.archipelagoNumber}
                    </span>
                    {archUpcoming && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="เร็วๆ นี้" />
                    )}
                  </div>

                  {/* Vertical Rotated Text */}
                  <div className="rotate-180 [writing-mode:vertical-rl] text-center my-auto space-y-2">
                    <span className="font-thai-serif font-bold text-xs text-parchment-cream tracking-wide line-clamp-1">
                      {arch.titleEn}
                    </span>
                  </div>

                  <span className="text-[10px] text-parchment-muted/80 font-mono">
                    #{arch.archipelagoNumber}
                  </span>
                </div>
              )}

              {/* ---------------------------------------------------------- */}
              {/* EXPANDED VIEW (When active: Opens wide to the right)       */}
              {/* ---------------------------------------------------------- */}
              {isActive && (
                <div className="relative h-full p-8 sm:p-10 flex flex-col justify-between z-10 animate-fade-in space-y-6">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold">
                        ทะเลน้ำลึก • หมู่เกาะที่ {arch.archipelagoNumber} / 10
                      </span>
                      {archUpcoming ? (
                        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/50 text-xs font-bold animate-pulse">
                          เร็วๆ นี้ (Upcoming)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                          เปิดให้ศึกษาแล้ว
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-parchment-muted font-mono bg-black/60 px-3 py-1 rounded-lg border border-white/10">
                      5 เกาะย่อยแห่งปัญญา
                    </div>
                  </div>

                  {/* Center: Title & 5 Sub-Islands Grid */}
                  <div className="space-y-5 my-auto max-w-3xl">
                    <div className="space-y-1.5">
                      <div className="text-xs uppercase tracking-widest text-gold-warm font-cinzel font-semibold flex items-center gap-1.5">
                        <Anchor className="w-4 h-4 text-gold-warm" />
                        <span>DEEP OCEAN ARCHIPELAGO • {arch.slug}</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-thai-serif font-black text-parchment-cream leading-tight drop-shadow-md">
                        {arch.titleEn}
                      </h2>
                      <h3 className="text-lg sm:text-xl font-thai-serif font-bold text-gold-light/95 leading-snug">
                        {arch.titleTh}
                      </h3>
                      {arch.subtitle && (
                        <p className="text-xs text-parchment-muted italic pt-1">
                          {arch.subtitle}
                        </p>
                      )}
                    </div>

                    {/* 5 Sub-Islands (5 เกาะเล็กที่ล้อมรอบเกาะหลัก) */}
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-semibold text-gold-light flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gold-warm" />
                        <span>5 เกาะย่อยที่ล้อมรอบเกาะหลัก (5 Sub-Islands):</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {arch.subIslands.map((sub) => {
                          const scheduledIso =
                            sub.publishedAt ||
                            getDeepOceanScheduledIso(arch.archipelagoNumber, sub.chapterNumber);
                          const scheduleShort = formatThaiScheduleDate(scheduledIso, false);
                          const subAccess = checkOceanArticleAccess({
                            realm: 'deep',
                            archipelagoNumber: arch.archipelagoNumber,
                            chapterNumber: sub.chapterNumber,
                            isUnlocked: sub.isUnlocked,
                            status: sub.status,
                            publishedAt: scheduledIso,
                            member,
                          });
                          const isSubOpen = subAccess.canAccess;

                          return (
                            <div
                              key={sub.chapterNumber}
                              className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                                isSubOpen
                                  ? 'bg-emerald-950/50 border-gold-warm/50 hover:bg-emerald-900/40 hover:border-gold-light'
                                  : 'bg-black/50 border-white/10 opacity-85'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {sub.coverImage ? (
                                  <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-gold-warm/40 shrink-0 bg-black shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={sub.coverImage}
                                      alt={sub.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-black/80 text-[9px] font-mono font-bold text-gold-warm rounded-tl">
                                      #{sub.chapterNumber}
                                    </span>
                                  </div>
                                ) : (
                                  <span
                                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                                      isSubOpen
                                        ? 'bg-gold-warm text-slate-abyss shadow-sm'
                                        : 'bg-white/10 text-parchment-muted'
                                    }`}
                                  >
                                    {sub.chapterNumber}
                                  </span>
                                )}
                                <div className="min-w-0">
                                  <div className="text-xs sm:text-sm font-thai font-semibold text-parchment-cream line-clamp-1">
                                    {sub.title}
                                  </div>
                                  <div className="text-[11px] text-gold-light/85 font-light line-clamp-1">
                                    {isReleasedBySchedule(scheduledIso)
                                      ? `เผยแพร่แล้ว (${scheduleShort})`
                                      : `กำหนดเผยแพร่: ${scheduleShort}`}
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-2">
                                {isSubOpen ? (
                                  <Link
                                    href={`/ocean/${arch.slug}/${sub.chapterNumber}`}
                                    className="px-3.5 py-1.5 rounded-lg gold-bevel-button text-slate-abyss text-xs font-bold shadow-sm hover:scale-105 transition flex items-center gap-1"
                                  >
                                    <span>เข้าอ่านบทที่ {sub.chapterNumber}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                ) : (
                                  <Link
                                    href={`/ocean/${arch.slug}/${sub.chapterNumber}`}
                                    className="text-[11px] font-mono text-gold-light/90 hover:text-gold-warm flex items-center gap-1 bg-black/60 px-2.5 py-1.5 rounded-lg border border-gold-warm/30 transition"
                                  >
                                    <Lock className="w-3 h-3 text-gold-warm" />
                                    <span>{scheduleShort}</span>
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Action */}
                  <div className="pt-4 border-t border-emerald-border/50 flex items-center justify-between">
                    <span className="text-xs text-parchment-muted/80 font-thai">
                      {archUpcoming
                        ? 'หมู่เกาะนี้จะเปิดให้อ่านในเร็วๆ นี้ พร้อม 5 เกาะย่อยเชิงลึก'
                        : 'บทที่ 1 เปิดให้อ่านฟรี • บทที่ 2-5 สำหรับสมาชิกระดับลึกซึ้ง'}
                    </span>

                    {!archUpcoming && (
                      <Link
                        href={`/ocean/${arch.slug}/1`}
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm hover:scale-105 transition"
                      >
                        <span>เริ่มอ่านบทที่ 1 (เกาะย่อยแรก)</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE INTERFACE: SWIPEABLE CARDS WITH 5 SUB-ISLANDS               */}
      {/* ------------------------------------------------------------------ */}
      <div className="lg:hidden flex flex-col gap-6">
        <div className="relative rounded-3xl overflow-hidden border border-gold-warm/50 bg-[#08150F] shadow-xl">
          {/* Cover Image */}
          <div className="relative h-56 w-full overflow-hidden bg-black/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.coverImage}
              alt={active.titleEn}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08150F] via-transparent to-black/70" />

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold">
                หมู่เกาะ {active.archipelagoNumber} / 10
              </span>
              {isUpcoming ? (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40">
                  เร็วๆ นี้
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 text-xs font-semibold border border-emerald-500/40">
                  เปิดแล้ว
                </span>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            <div>
              <div className="text-[11px] font-mono text-gold-warm uppercase tracking-wider">
                DEEP OCEAN • ทะเลน้ำลึก
              </div>
              <h2 className="text-2xl font-thai-serif font-black text-parchment-cream mt-0.5">
                {active.titleEn}
              </h2>
              <h3 className="text-base font-thai-serif font-bold text-gold-light mt-1">
                {active.titleTh}
              </h3>
            </div>

            {/* Sub-islands list */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-gold-light">
                5 เกาะย่อยที่ล้อมรอบเกาะหลัก:
              </div>
              {active.subIslands.map((sub) => {
                const scheduledIso =
                  sub.publishedAt ||
                  getDeepOceanScheduledIso(active.archipelagoNumber, sub.chapterNumber);
                const scheduleShort = formatThaiScheduleDate(scheduledIso, false);
                const subAccess = checkOceanArticleAccess({
                  realm: 'deep',
                  archipelagoNumber: active.archipelagoNumber,
                  chapterNumber: sub.chapterNumber,
                  isUnlocked: sub.isUnlocked,
                  status: sub.status,
                  publishedAt: scheduledIso,
                  member,
                });
                const isSubOpen = subAccess.canAccess;

                return (
                  <div
                    key={sub.chapterNumber}
                    className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-gold-warm/20 text-gold-warm text-xs font-mono flex items-center justify-center shrink-0">
                        {sub.chapterNumber}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs text-parchment-cream truncate">
                          {sub.title}
                        </div>
                        <div className="text-[10px] text-gold-light/80">
                          {scheduleShort}
                        </div>
                      </div>
                    </div>

                    {isSubOpen ? (
                      <Link
                        href={`/ocean/${active.slug}/${sub.chapterNumber}`}
                        className="px-2.5 py-1 rounded-md gold-bevel-button text-slate-abyss text-[11px] font-bold shrink-0"
                      >
                        อ่าน
                      </Link>
                    ) : (
                      <Link
                        href={`/ocean/${active.slug}/${sub.chapterNumber}`}
                        className="text-[10px] text-gold-light/80 bg-black/60 px-2 py-1 rounded border border-white/10 shrink-0"
                      >
                        {scheduleShort.split(' ')[0]} {scheduleShort.split(' ')[1]}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {archipelagos.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition border ${
                activeIndex === idx
                  ? 'bg-gold-warm text-slate-abyss border-gold-warm font-bold shadow-sm'
                  : 'bg-emerald-card text-parchment-muted border-emerald-border hover:text-white'
              }`}
            >
              หมู่เกาะ {item.archipelagoNumber} {item.status === 'upcoming' ? '(เร็วๆ นี้)' : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

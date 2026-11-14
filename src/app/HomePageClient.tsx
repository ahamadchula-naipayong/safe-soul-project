'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SacredGeometryPattern, GoldGlowOrb } from '@/components/SacredGeometry';
import { AccessTierTable } from '@/components/AccessTierTable';
import { FreeEbookModal } from '@/components/FreeEbookModal';
import { IslandDeckSlider } from '@/components/IslandDeckSlider';
import { DeepOceanArchipelagoDeck } from '@/components/DeepOceanArchipelagoDeck';
import { NewsDeckSlider } from '@/components/NewsDeckSlider';
import { OneshotChapter, DeepOceanArchipelago, NewsArticle } from '@/types';
import {
  BookOpen,
  ArrowRight,
  Compass,
  FileText,
  Anchor,
  Sparkles,
} from 'lucide-react';

interface HomePageClientProps {
  chapters: OneshotChapter[];
  deepArchipelagos?: DeepOceanArchipelago[];
  latestNews?: NewsArticle[];
}

export function HomePageClient({
  chapters,
  deepArchipelagos = [],
  latestNews = [],
}: HomePageClientProps) {
  const [oceanRealm, setOceanRealm] = useState<'shallow' | 'deep'>('shallow');
  const [isEbookOpen, setIsEbookOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08110D] text-parchment-cream font-thai selection:bg-gold-warm selection:text-slate-abyss">
      {/* Background Sacred Geometry & Ambient Glow */}
      <SacredGeometryPattern className="opacity-20 pointer-events-none" />
      <GoldGlowOrb className="-top-40 left-1/4 w-[700px] h-[700px]" />
      <GoldGlowOrb className="top-1/3 -right-40 w-[600px] h-[600px]" />

      {/* ---------------------------------------------------------------------- */}
      {/* 1. LUXURY HERO SECTION                                                 */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-7">
          {/* Official Emblem Centerpiece with Smooth Fade-in Entrance */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.86, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative group flex items-center justify-center">
              {/* Soft Ambient Golden Halo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 0.75, 0.5], scale: [0.7, 1.08, 1] }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
                className="absolute -inset-6 rounded-full bg-gradient-to-tr from-gold-warm/25 via-emerald-500/15 to-gold-light/25 blur-2xl pointer-events-none"
              />
              {/* Outer Subtle Sacred Ring */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-[#132C20]/90 via-[#0B1B13]/95 to-[#060E0A] border border-gold-warm/45 shadow-[0_0_45px_rgba(245,158,11,0.22)] p-3.5 sm:p-4 flex items-center justify-center animate-float">
                <div className="absolute inset-1.5 rounded-full border border-gold-light/20 pointer-events-none" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo/logo-transparent.png"
                  alt="เกราะพิทักษ์ฟิฏเราะฮฺ • The Fitrah Shield Official Emblem"
                  className="w-full h-full object-contain drop-shadow-[0_6px_18px_rgba(245,158,11,0.35)]"
                />
              </div>
            </div>

            {/* Subtle Crest Caption Pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-card/90 border border-gold-warm/40 text-gold-light text-xs font-semibold shadow-gold-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
              <span>4 มิติแห่งปัญญา</span>
              <span className="text-white/25">•</span>
              <span className="font-cinzel tracking-wider uppercase">SAFE FROM THE DUNYA</span>
            </motion.div>
          </motion.div>

          {/* Headline: "เกราะพิทักษ์ฟิฏเราะฮฺ" ABOVE "THE FITRAH SHIELD" */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <h1 className="tracking-tight text-balance">
              <span className="block font-thai-serif font-black text-gold-light text-3xl sm:text-5xl lg:text-6xl leading-[1.2] drop-shadow-md">
                เกราะพิทักษ์ฟิฏเราะฮฺ
              </span>
              <span className="block mt-2.5 font-cinzel font-black tracking-[0.08em] text-parchment-cream text-3xl sm:text-5xl lg:text-6xl drop-shadow-md">
                THE FITRAH SHIELD
              </span>
            </h1>
            <div className="h-0.5 w-24 mx-auto bg-gold-warm/60 mt-4" />
          </motion.div>

          {/* Hero Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-xl text-parchment-cream/95 font-light leading-relaxed max-w-2xl mx-auto text-balance font-thai"
          >
            เมื่อชีวิต คือ นาวาที่ล่องลอยในมหาสมุทรอันกว้างใหญ่ มาเตรียมรับมือกับคลื่นลมก่อนวันที่พายุจะจมเรือเรากันเถอะ
          </motion.p>

          {/* Primary CTA (Podcast button removed per request) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#ocean"
              className="w-full sm:w-auto px-8 py-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-gold-md hover:brightness-105 transition"
            >
              <Compass className="w-4 h-4 text-slate-abyss" />
              <span>มุ่งสู่ทะเลอันไร้ที่สิ้นสุดกัน</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* E-book Email Cart Option (No direct download button anywhere) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.85 }}
            className="pt-3 flex items-center justify-center text-xs text-parchment-muted"
          >
            <button
              onClick={() => setIsEbookOpen(true)}
              className="flex items-center gap-2 text-gold-light hover:text-gold-warm transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-gold-warm" />
              <span>รับ E-Book ฉบับเกาะทะเลน้ำตื้น (ปกติ ฿199 พิเศษ ฟรี ฿0 ส่งทางอีเมลสมาชิก)</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. มุ่งสู่ทะเลอันไร้ที่สิ้นสุดกัน: ทะเลน้ำตื้น (7 เกาะ) & ทะเลน้ำลึก (10 หมู่เกาะ) */}
      {/* ---------------------------------------------------------------------- */}
      <section id="ocean" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-emerald-border/40">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-card/90 border border-gold-warm/40 text-gold-light text-xs font-semibold shadow-gold-sm">
            <Compass className="w-4 h-4 text-gold-warm animate-spin-slow" />
            <span>BOUNDLESS OCEAN EXPEDITION • การสำรวจมหาสมุทรแห่งจิตวิญญาณ</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-thai-serif font-black text-parchment-cream tracking-tight">
            มุ่งสู่ทะเลอันไร้ที่สิ้นสุดกัน
          </h2>

          <p className="text-sm sm:text-base text-parchment-muted max-w-2xl mx-auto leading-relaxed">
            การเดินทางสำรวจภูมิคุ้มกันทางจิตวิญญาณเพื่อการอยู่รอดในดุนยา แบ่งเป็น 2 ระดับแห่งมหาสมุทร:
            เริ่มต้นจาก &ldquo;ทะเลน้ำตื้น&rdquo; เพื่อฝึกอ่านคลื่นลม ก่อนลงลึกสู่ &ldquo;ทะเลน้ำลึก&rdquo; มหาสมุทรแห่งความจริง
          </p>

          {/* Interactive Ocean Realm Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <div className="p-1.5 rounded-2xl bg-[#040E09] border border-gold-warm/40 shadow-xl flex items-center gap-2 max-w-md w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setOceanRealm('shallow')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs sm:text-sm font-thai font-bold transition flex items-center justify-center gap-2 ${
                  oceanRealm === 'shallow'
                    ? 'bg-gold-warm text-slate-abyss shadow-gold-sm'
                    : 'text-parchment-muted hover:text-parchment-cream hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>ทะเลน้ำตื้น (7 เกาะเปิด)</span>
              </button>

              <button
                type="button"
                onClick={() => setOceanRealm('deep')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs sm:text-sm font-thai font-bold transition flex items-center justify-center gap-2 ${
                  oceanRealm === 'deep'
                    ? 'bg-cyan-500 text-slate-abyss shadow-md'
                    : 'text-parchment-muted hover:text-parchment-cream hover:bg-white/5'
                }`}
              >
                <Anchor className="w-4 h-4" />
                <span>ทะเลน้ำลึก (10 หมู่เกาะ)</span>
              </button>
            </div>
          </div>

          {/* Active Realm Description Banner */}
          <div className="pt-3">
            {oceanRealm === 'shallow' ? (
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gold-light/90 bg-emerald-950/60 border border-emerald-500/30 px-4 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-gold-warm animate-ping" />
                <span>
                  <strong>ทะเลน้ำตื้น:</strong> หัดอ่านคลื่นลมก่อนลงสู่ทะเลหลัก — ทะเลเปิดเพื่อให้ทุกคนได้เข้ามาศึกษา (7 เกาะแห่งปัญญา)
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-4 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>
                  <strong>ทะเลน้ำลึก:</strong> มหาสมุทรที่เต็มไปด้วยความงดงาม และสิ่งล่อลวง — 10 หมู่เกาะแห่งปัญญา (แต่ละเกาะล้อมรอบด้วย 5 เกาะเล็ก)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Display Active Realm View */}
        {oceanRealm === 'shallow' ? (
          <div className="animate-fade-in">
            <IslandDeckSlider chapters={chapters} />
          </div>
        ) : (
          <div className="animate-fade-in">
            <DeepOceanArchipelagoDeck archipelagos={deepArchipelagos} />
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. LATEST 10 DISPATCHES (สำนักข่าว The Key of Return)                  */}
      {/* ---------------------------------------------------------------------- */}
      {latestNews.length > 0 && (
        <section id="latest-news" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-emerald-border/40">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-card/90 border border-gold-warm/40 text-gold-light text-xs font-semibold shadow-gold-sm">
              <FileText className="w-4 h-4 text-gold-warm" />
              <span>THE KEY OF RETURN • สำนักข่าววิเคราะห์สถานการณ์โลก</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-thai-serif font-black text-parchment-cream tracking-tight">
              10 รายงานวิเคราะห์สถานการณ์ล่าสุด
            </h2>
            <p className="text-sm sm:text-base text-parchment-muted max-w-2xl mx-auto leading-relaxed">
              รายงานและบทวิเคราะห์เชิงลึก ถอดรหัสเหตุการณ์สำคัญระดับโลกและภูมิรัฐศาสตร์
              ผ่านมุมมองที่ลึกซึ้ง ตรรกะข้อเท็จจริง และความเข้าใจในสัจธรรม (คลิกที่กล่องเพื่อเปิดขยายไปทางขวา)
            </p>
          </div>

          {/* Overlapping Horizontal Interactive Accordion Deck for News */}
          <NewsDeckSlider articles={latestNews} />
        </section>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 4. UNIFIED MARITIME ACCESS SANCTUARY TABLE & ACTIVE DASHBOARD          */}
      {/* ---------------------------------------------------------------------- */}
      <section id="membership" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-emerald-border/40">
        <AccessTierTable onOpenFreeModal={() => setIsEbookOpen(true)} />
      </section>

      {/* Free E-book Modal */}
      <FreeEbookModal
        isOpen={isEbookOpen}
        onClose={() => setIsEbookOpen(false)}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SacredGeometryPattern, GoldGlowOrb } from '@/components/SacredGeometry';
import { DualModeToggle } from '@/components/DualModeToggle';
import { FoundingCountdown } from '@/components/FoundingCountdown';
import { FreeEbookModal } from '@/components/FreeEbookModal';
import { mockSeries, mockChapters, mockFoundingQuota } from '@/lib/supabase/mockData';
import { useAudio } from '@/context/AudioContext';
import { ContentMode } from '@/types';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Crown,
  Headphones,
  Layers,
  ChevronRight,
  Feather,
  Brain,
  Compass,
  Activity,
  HeartHandshake,
  Scroll,
} from 'lucide-react';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export default function HomePage() {
  const [contentMode, setContentMode] = useState<ContentMode>('deep');
  const [isEbookOpen, setIsEbookOpen] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const sampleChapter = mockChapters[0];

  const handlePlaySampleAudio = () => {
    playTrack({
      id: sampleChapter.id,
      title: sampleChapter.title_th,
      seriesTitle: 'Safe from the Dunya',
      chapterNumber: 1,
      audioUrl: sampleChapter.audio_url,
      duration: sampleChapter.audio_duration,
      coverImage: sampleChapter.cover_image,
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08110D] text-parchment-cream font-thai selection:bg-gold-warm selection:text-slate-abyss">
      {/* Background Sacred Geometry & Ambient Glow */}
      <SacredGeometryPattern className="opacity-20 pointer-events-none" />
      <GoldGlowOrb className="-top-40 left-1/4 w-[700px] h-[700px]" />
      <GoldGlowOrb className="top-1/3 -right-40 w-[600px] h-[600px]" />

      {/* ---------------------------------------------------------------------- */}
      {/* 1. LUXURY HERO SECTION */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative pt-20 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-thai-serif font-black tracking-tight text-balance">
              <span className="block text-parchment-cream drop-shadow-md">ปลอดภัยจากดุนยา</span>
              <span className="block mt-2 font-cinzel font-black tracking-[0.06em] text-gold-light text-3xl sm:text-5xl lg:text-6xl">
                SAFE FROM THE DUNYA
              </span>
            </h1>
            <div className="h-0.5 w-24 mx-auto bg-gold-warm/60 mt-4" />
          </div>

          <p className="text-base sm:text-xl text-parchment-muted font-light leading-relaxed max-w-2xl mx-auto text-balance">
            เดินใต้แสงแห่งปัญญา โดยไม่หลงไปกับประกายของโลกวัตถุนิยม สร้างภูมิคุ้มกันทางจิตวิญญาณ
            ผ่านการบูรณาการตรรกศาสตร์ วิทยาศาสตร์ จิตวิทยา และเทววิทยาอิสลามอันลุ่มลึก
          </p>

          {/* CTA Group */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/articles/art-of-self-awareness"
              className="w-full sm:w-auto px-8 py-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-gold-md hover:brightness-105 transition"
            >
              <span>เริ่มอ่านบทที่ 1 ฟรี</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handlePlaySampleAudio}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-emerald-surface/90 hover:bg-emerald-light border border-gold-warm/40 text-parchment-cream font-semibold text-sm sm:text-base transition flex items-center justify-center gap-2.5 backdrop-blur-md shadow-sm hover:border-gold-light"
            >
              <Headphones className="w-4 h-4 text-gold-warm" />
              <span>
                {currentTrack?.id === sampleChapter.id && isPlaying
                  ? 'กำลังเล่นเสียงตัวอย่าง...'
                  : 'ฟังพอดแคสต์ตัวอย่าง (14 นาที)'}
              </span>
            </button>
          </div>

          {/* Trust & Dual-Path Options */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-parchment-muted">
            <button
              onClick={() => setIsEbookOpen(true)}
              className="flex items-center gap-2 text-gold-light hover:text-gold-warm transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-gold-warm" />
              <span>ดาวน์โหลด E-book 7 บทหลักฟรีทันที (Tier 1)</span>
            </button>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>เข้าถึงเนื้อหาเชิงลึก Deep Mode (Easy Mode: Upcoming)</span>
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. EXISTENTIAL BRIDGE: NOISE OF DUNYA VS SPIRITUAL SANCTUARY */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-emerald-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-thai-serif font-bold text-parchment-cream">
            เมื่อโลกภายนอกเร่งรีบ หัวใจยิ่งต้องการปราการแห่งความสงบ
          </h2>
          <p className="text-sm sm:text-base text-parchment-muted leading-relaxed max-w-2xl mx-auto">
            ในยุคที่ระบบอัลกอริทึมแย่งชิงความสนใจ และวัฒนธรรมวัตถุนิยมผลักดันให้เราวิ่งตามสิ่งที่ไม่มีวันเติมเต็ม
            จิตใจมนุษย์จึงเผชิญกับความเหนื่อยล้าทางอัตถิภาวนิยม (Existential Exhaustion)
          </p>
        </div>

        {/* Contrast Grid: Modern Crisis vs The 4 Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-12">
          {/* Box 1: The Modern Dilemma */}
          <div className="rounded-3xl p-8 bg-[#0D1A14]/80 border border-red-500/20 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-red-400 text-sm font-semibold">
                <Activity className="w-4 h-4" />
                <span>วิกฤตของจิตสำนึกร่วมสมัย (The Contemporary Dilemma)</span>
              </div>
              <h3 className="text-2xl font-thai-serif font-bold text-parchment-cream">
                กับดักความอยากไม่รู้จบ & จิตใจที่กระจัดกระจาย
              </h3>
              <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                มนุษย์มักตกในหลุมพราง Hedonic Treadmill สารเคมีสมองกระตุ้นให้ต้องการบริโภคและการยอมรับรุนแรงขึ้นเรื่อยๆ
                จนเผลอยกสิ่งของเงินทองจาก &quot;เครื่องมือเดินทาง&quot; ให้กลายเป็น &quot;จุดหมายสูงสุด&quot;
                เมื่อน้ำภายนอกรั่วเข้าท่วมลำเรือ หัวใจจึงจมลงในความวิตกกังวล
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs text-parchment-muted font-mono">
              <div className="text-red-300 font-semibold font-sans">ผลลัพธ์ของความวิปริตทางทัศนะ:</div>
              <div>• Amygdala Hijack และภาวะสมาธิแตกสลายข้ามวัน</div>
              <div>• ทำงานอย่างหนักจนร่างกายพัง แต่รู้สึกว่างเปล่าในจิตวิญญาณ</div>
            </div>
          </div>

          {/* Box 2: The Sanctuary Solution */}
          <div className="rounded-3xl p-8 bg-gradient-to-b from-emerald-surface/90 to-[#0A1610] border border-gold-warm/40 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-gold-light text-sm font-semibold">
                <Compass className="w-4 h-4 text-gold-warm" />
                <span>ปราการภูมิคุ้มกันทางปัญญา (The Epistemic Sanctuary)</span>
              </div>
              <h3 className="text-2xl font-thai-serif font-bold text-parchment-cream">
                4 มิติแห่งปัญญา: ครองโลกโดยไม่ถูกโลกกลืนกิน
              </h3>
              <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                Safe Soul Project ถูกรังสรรค์ขึ้นเพื่อเป็นพื้นที่ปลอดภัยทางจิตวิญญาณ
                ผสานตรรกศาสตร์สากล จิตวิทยาพฤติกรรม และคำสอนของปราชญ์อย่าง Al-Ghazali
                ให้คุณสามารถประกอบอาชีพ เลี้ยงดูครอบครัว และสร้างคุณค่าอย่างเต็มที่
                โดยมีบัลลังก์ในหัวใจที่สงบ นิ่ง และเป็นอิสระอย่างแท้จริง
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-gold-warm/20 space-y-2 text-xs text-parchment-muted font-mono">
              <div className="text-gold-light font-semibold font-sans">สถาปัตยกรรม 4 เสาหลัก:</div>
              <div className="text-parchment-cream/90">• มิติแห่งตน • ปัญญาตรรกะ • ความสงบภายใน • มรดกนิรันดร์</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. DUAL-MODE CONTENT ENGINE PREVIEW */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-emerald-border/40">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-thai-serif font-bold text-parchment-cream">
            ระบบสลับเนื้อหา 2 มิติ (Dual-Mode Technology)
          </h2>
          <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
            สัมผัสความยืดหยุ่นในการศึกษา สลับระหว่างมุมมองที่เข้าใจง่ายในชีวิตประจำวัน กับการวิเคราะห์เชิงวิชาการได้ทันที
          </p>
        </div>

        {/* Interactive Toggle Switch */}
        <DualModeToggle
          mode={contentMode}
          onToggle={setContentMode}
          className="mb-8"
        />

        {/* Live Preview Card */}
        <div className="rounded-3xl p-6 sm:p-10 bg-black/70 border border-gold-warm/30 backdrop-blur-xl shadow-2xl transition-all duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-emerald-border/60 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-warm" />
              <span className="font-semibold text-gold-light">
                ตัวอย่างการอ่าน: {sampleChapter.title_th}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-deep/80 border border-gold/30 text-parchment-cream text-[11px]">
              โหมดที่เลือก: {contentMode === 'easy' ? 'Easy Mode (Upcoming - เร็วๆ นี้)' : 'Deep Mode (ตรรกศาสตร์ & เทววิทยาบูรณาการ)'}
            </span>
          </div>

          {/* Content Preview */}
          <div className="pt-8">
            {contentMode === 'easy' ? (
              <div className="space-y-5 text-parchment-cream/90 leading-relaxed text-sm sm:text-base font-light">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
                  <span>Easy Mode • Upcoming (เร็วๆ นี้)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-thai-serif font-bold text-gold-light">
                  โหมดภาษาง่ายสำหรับครอบครัว กำลังอยู่ระหว่างการจัดทำ
                </h3>
                <p className="text-parchment-muted">
                  ทีมงานกำลังจัดทำเนื้อหาฉบับย่อยง่าย อุปมาอุปไมย และเรื่องเล่าสำหรับครอบครัวและเยาวชน (Easy Mode) โดยท่านสามารถเข้าศึกษาฉบับวิเคราะห์เชิงลึกเต็มรูปแบบ (Deep Mode) ได้ทันที
                </p>
                <div className="p-5 rounded-2xl bg-emerald-deep/60 border border-gold-warm/30 text-xs sm:text-sm text-parchment-muted flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <strong className="text-gold-light block font-semibold">แนะนำการอ่าน:</strong>
                    <span>สลับไปยัง &ldquo;Deep Mode&rdquo; เพื่ออ่านเนื้อหาฉบับสมบูรณ์ 35 บท</span>
                  </div>
                  <button
                    onClick={() => setContentMode('deep')}
                    className="px-4 py-2 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shrink-0 shadow-sm"
                  >
                    สลับไป Deep Mode
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-parchment-cream/90 leading-relaxed text-sm sm:text-base font-light">
                <div className="flex items-center gap-2 text-gold-warm text-xs font-bold uppercase tracking-wider">
                  <Brain className="w-4 h-4 text-gold-warm" />
                  <span>การวิเคราะห์เชิงภววิทยาและญาณวิทยา (Philosophical Mode)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-thai-serif font-bold text-gold-light">
                  &ldquo;ญาณวิทยาแห่งดุนยาและการจัดวาง Teleology&rdquo;
                </h3>
                <p>
                  ในทางญาณวิทยาและปรัชญาเทววิทยา ดุนยามิใช่สิ่งชั่วร้ายในเชิงภววิทยา (Ontological evil) ทว่า &quot;พิษแห่งดุนยา&quot; อุบัติขึ้นเมื่อมนุษย์เกิดความวิปริตทางทัศนะในการจัดลำดับคุณค่าสูงสุด (Teleological Inversion) แปรเปลี่ยนสถานะของโลกกายภาพจาก &quot;สื่อกลาง (Wasīlah)&quot; ไปสู่ &quot;จุดหมายสูงสุดในตัวเอง (Ghāyah)&quot;...
                </p>
                <div className="p-5 rounded-2xl bg-slate-card border border-amber-400/40 text-xs sm:text-sm text-parchment-muted space-y-1">
                  <strong className="text-gold-light block font-semibold">การอ้างอิงเชิงวิชาการ (Epistemic References):</strong>
                  <span className="font-mono">Al-Ghazali, Ihya Ulum al-Din • Kahneman (2011), Hedonic Adaptation & System 1/2</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 mt-8 border-t border-emerald-border/40 flex justify-end">
            <Link
              href={`/articles/${sampleChapter.slug}`}
              className="text-xs font-bold text-gold-warm hover:text-gold-light flex items-center gap-1.5 transition group"
            >
              <span>เปิดอ่านบทความฉบับเต็ม พร้อมเครื่องเล่นพอดแคสต์</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. 7 SAFE SERIES (CURRICULUM) */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-emerald-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-thai-serif font-bold text-parchment-cream">
            7 ธีมหลักแห่งการปกป้องจิตวิญญาณ
          </h2>
          <p className="text-sm text-parchment-muted max-w-xl mx-auto">
            การเดินทาง 35 บท ผ่าน 4 มิติแห่งปัญญา: มิติแห่งตน, ปัญญาตรรกะ, จิตวิญญาณ, และมรดกนิรันดร์
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockSeries.map((series, index) => (
            <div
              key={series.id}
              className="group luxury-glass rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-500 hover:-translate-y-1"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={series.cover_image}
                  alt={series.title_th}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-75 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1410] via-transparent to-black/40" />

                <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-gold-warm/40 text-xs font-cinzel font-bold text-gold-light shadow-sm">
                  PILLAR {ROMAN_NUMERALS[index]}
                </span>
                <span className="absolute bottom-3.5 left-3.5 text-xs text-parchment-muted font-medium">
                  {series.dimension}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition duration-300">
                    {series.title_th}
                  </h3>
                  <p className="text-xs font-cinzel font-semibold text-gold-warm/90 tracking-wider mb-2.5 mt-0.5">
                    {series.title_en}
                  </p>
                  <p className="text-xs text-parchment-muted line-clamp-3 leading-relaxed">
                    {series.description_th}
                  </p>
                </div>

                <div className="pt-4 border-t border-emerald-border/50 flex items-center justify-between text-xs">
                  <span className="text-parchment-muted/80">5 บทย่อย • เสียงและบทความคู่ขนาน</span>
                  <Link
                    href={`/articles/${sampleChapter.slug}`}
                    className="text-gold-light font-semibold hover:text-gold-warm flex items-center gap-1 group/btn"
                  >
                    <span>เข้าสู่เนื้อหา</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 5. FOUNDING 100 QUOTA HIGHLIGHT & LIVE COUNTER */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-emerald-border/40">
        <FoundingCountdown initialQuota={mockFoundingQuota} />
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 6. 3-TIER MEMBERSHIP COMPARISON */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-emerald-border/40">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-thai-serif font-bold text-parchment-cream">
            เลือกระดับการสนับสนุนที่คุณต้องการ
          </h2>
          <p className="text-sm text-parchment-muted">
            สนับสนุนเพื่อร่วมสร้างสังคมแห่งปัญญา พร้อมรับสิทธิ์การเข้าถึงคลังข้อมูลและชุมชน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Tier 1: Free Member */}
          <div className="luxury-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-cinzel font-bold uppercase tracking-widest text-parchment-muted">
                  TIER I
                </span>
                <h3 className="text-2xl font-thai-serif font-bold text-parchment-cream mt-1">
                  Free Member
                </h3>
                <div className="text-3xl font-serif font-black text-parchment-light mt-3">
                  ฿0 <span className="text-xs font-sans text-parchment-muted">ตลอดชีพ</span>
                </div>
                <p className="text-xs text-parchment-muted mt-2 leading-relaxed">
                  สมัครด้วยอีเมลง่ายๆ เพื่อเริ่มต้นก้าวแรกแห่งการเรียนรู้
                </p>
              </div>

              <ul className="space-y-3.5 text-xs text-parchment-muted border-t border-emerald-border/40 pt-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ดาวน์โหลด E-book 7 บทหลักฟรีทันที</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>เข้าถึงเนื้อหาบทที่ 1 - 3 ได้ฟรีตลอดชีพ</span>
                </li>
                <li className="flex items-center gap-2.5 text-parchment-muted/40">
                  <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px]">✕</span>
                  <span>ปลดล็อก 35 ตอนครบชุด</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setIsEbookOpen(true)}
              className="mt-8 w-full py-3.5 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold/30 text-gold-light text-xs font-bold transition shadow-sm"
            >
              สมัครสมาชิกฟรี
            </button>
          </div>

          {/* Tier 2: Supporter 199 THB/mo */}
          <div className="luxury-glass rounded-3xl p-6 sm:p-8 border-2 border-emerald-400/40 flex flex-col justify-between relative shadow-2xl">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-cinzel font-bold uppercase tracking-widest text-emerald-300">
                  TIER II • MOST POPULAR
                </span>
                <h3 className="text-2xl font-thai-serif font-bold text-parchment-cream mt-1">
                  Supporter
                </h3>
                <div className="text-3xl font-serif font-black text-gold-light mt-3">
                  ฿199 <span className="text-xs font-sans text-parchment-muted">/ เดือน</span>
                </div>
                <p className="text-xs text-parchment-muted mt-2 leading-relaxed">
                  ปลดล็อกคลังปัญญาทั้งหมด ครบ 35 บท พร้อมระบบเสียงพอดแคสต์
                </p>
              </div>

              <ul className="space-y-3.5 text-xs text-parchment-cream/90 border-t border-emerald-border/40 pt-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ปลดล็อกครบ 35 บท ใน Deep Mode (Easy Mode: Upcoming)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ฟังพอดแคสต์เสียงความคมชัดสูงทุกตอน</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>รับบทบาท Supporter ใน Discord และกลุ่ม Telegram</span>
                </li>
              </ul>
            </div>

            <Link
              href="/pricing#supporter-checkout"
              className="mt-8 w-full py-3.5 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm transition text-center"
            >
              สมัครสนับสนุน ฿199/เดือน
            </Link>
          </div>

          {/* Tier 3: Founding 100 Lifetime */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#1C3B2C] via-[#12261C] to-slate-card border-2 border-gold-warm flex flex-col justify-between relative shadow-gold-luxury">
            <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gold-warm text-slate-abyss text-[10px] font-cinzel font-black uppercase tracking-wider shadow-sm">
              LIMITED 100 SLOTS
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-cinzel font-bold uppercase tracking-widest text-gold-warm flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>TIER III • LIFETIME PRESTIGE</span>
                </span>
                <h3 className="text-2xl font-thai-serif font-bold text-parchment-light mt-1">
                  Founding 100 Lifetime
                </h3>
                <div className="text-3xl font-serif font-black text-gold-light mt-3">
                  ฿3,990 <span className="text-xs font-sans text-parchment-muted">จ่ายครั้งเดียวตลอดชีพ</span>
                </div>
                <p className="text-xs text-parchment-muted mt-2 leading-relaxed">
                  สำหรับผู้ร่วมก่อตั้ง รับสิทธิพิเศษพรีเมียมทุกมิติและ Full E-book 240 หน้า
                </p>
              </div>

              <ul className="space-y-3.5 text-xs text-parchment-cream/95 border-t border-emerald-border/40 pt-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>เข้าถึง 35 บทตลอดชีพ รวมการอัปเดตในอนาคต</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ดาวน์โหลด Full Master E-book 240 หน้า (ประทับตราลิขสิทธิ์)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ส่วนลด 20% สำหรับสินค้า Physical Merch ทุกชิ้น</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>บทบาท Founding 100 สีทองบน Discord & Telegram</span>
                </li>
              </ul>
            </div>

            <Link
              href="/pricing#founding-checkout"
              className="mt-8 w-full py-3.5 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm transition text-center"
            >
              รับสิทธิ์ Founding 100 (เหลือ {mockFoundingQuota.remaining_slots} ที่)
            </Link>
          </div>
        </div>
      </section>

      {/* Free E-book Modal */}
      <FreeEbookModal
        isOpen={isEbookOpen}
        onClose={() => setIsEbookOpen(false)}
      />
    </div>
  );
}

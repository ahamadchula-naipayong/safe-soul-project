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
  Compass,
  Sparkles,
  BookOpen,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Crown,
  Headphones,
  Film,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const [contentMode, setContentMode] = useState<ContentMode>('easy');
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
    <div className="relative min-h-screen overflow-hidden bg-slate-dark text-parchment-cream">
      {/* Background Sacred Geometry & Ambient Glow */}
      <SacredGeometryPattern className="opacity-15" />
      <GoldGlowOrb className="-top-40 left-1/4 w-[600px] h-[600px]" />
      <GoldGlowOrb className="top-1/3 -right-40 w-[500px] h-[500px]" />

      {/* ---------------------------------------------------------------------- */}
      {/* 1. HERO SECTION (Canva & Animation presentation mood) */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-deep/80 border border-gold/40 text-gold-light text-xs font-semibold shadow-gold-sm backdrop-blur-md animate-float">
            <Sparkles className="w-4 h-4 text-gold-warm" />
            <span>4 มิติแห่งปัญญา • 7 ธีมหลัก • 35 บทย่อย</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-balance">
            <span className="block text-parchment-cream">ปลอดภัยจากดุนยา</span>
            <span className="block mt-2 bg-gradient-to-r from-gold-light via-gold-warm to-amber-600 bg-clip-text text-transparent">
              Safe from the Dunya
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-parchment-muted/90 font-light leading-relaxed max-w-2xl mx-auto text-balance">
            เดินใต้แสงแห่งปัญญา โดยไม่หลงไปกับประกายของโลกวัตถุนิยม สร้างภูมิคุ้มกันทางจิตวิญญาณ
            ผ่านมุมมองตรรกศาสตร์ วิทยาศาสตร์ และสัจธรรมอันสงบเย็น
          </p>

          {/* CTA Group */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/articles/art-of-self-awareness"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-sm sm:text-base shadow-gold-md hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <span>เริ่มอ่านบทที่ 1 ฟรี</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handlePlaySampleAudio}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-surface/90 hover:bg-emerald-light border border-gold/30 text-parchment-cream font-semibold text-sm sm:text-base transition flex items-center justify-center gap-2.5 backdrop-blur-md"
            >
              <Headphones className="w-4 h-4 text-gold-warm" />
              <span>
                {currentTrack?.id === sampleChapter.id && isPlaying
                  ? 'กำลังเล่นเสียงตัวอย่าง...'
                  : 'ฟังพอดแคสต์ตัวอย่าง (14 นาที)'}
              </span>
            </button>
          </div>

          {/* Guarantee / Free Download Tag */}
          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-parchment-muted">
            <button
              onClick={() => setIsEbookOpen(true)}
              className="flex items-center gap-1.5 hover:text-gold-light transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-gold-warm" />
              <span>ดาวน์โหลด E-book 7 บทฟรีทันที (Tier 1)</span>
            </button>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ปลดล็อก 35 บทครบทั้ง Easy & Deep</span>
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. DUAL-MODE CONTENT ENGINE INTERACTIVE SHOWCASE */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-emerald-card via-[#0F231A] to-slate-card border border-gold/30 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-warm">
              Interactive Content Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-parchment-cream">
              ระบบสลับเนื้อหา 2 มิติ (Dual-Mode Engine)
            </h2>
            <p className="text-xs sm:text-sm text-parchment-muted">
              สลับมุมมองการเรียนรู้ได้ทันทีในคลิกเดียว ไม่ต้องโหลดหน้าใหม่ เลือกความลึกที่เหมาะกับคุณ
            </p>
          </div>

          {/* Interactive Toggle Switch */}
          <DualModeToggle
            mode={contentMode}
            onToggle={setContentMode}
            className="mb-8"
          />

          {/* Live Preview Card */}
          <div className="rounded-2xl p-6 sm:p-8 bg-black/40 border border-emerald-border/80 backdrop-blur-md transition-all duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-border/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gold-warm animate-ping" />
                <span className="font-semibold text-gold-light">
                  ตัวอย่างเนื้อหา: {sampleChapter.title_th}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-parchment-muted font-mono">
                โหมดปัจจุบัน: {contentMode === 'easy' ? 'Easy (ครอบครัว & เล่าเรื่อง)' : 'Deep (ตรรกะ & วิทยาศาสตร์)'}
              </span>
            </div>

            {/* Content Preview */}
            <div className="pt-6">
              {contentMode === 'easy' ? (
                <div className="space-y-4 animate-fade-in text-parchment-cream/90 leading-relaxed text-sm sm:text-base font-light">
                  <p className="text-lg font-serif font-semibold text-gold-light">
                    &ldquo;เรือที่ลอยอยู่เหนือน้ำ&rdquo;
                  </p>
                  <p>
                    ลองจินตนาการว่าคุณกำลังนั่งเรือข้ามมหาสมุทรที่กว้างใหญ่ น้ำในทะเลเปรียบเสมือนสิ่งของรอบตัวเราในโลก—เรือจำเป็นต้องใช้น้ำเพื่อพยุงให้ลอยไปข้างหน้า แต่ถ้าเมื่อไหร่ที่น้ำรั่วเข้ามาในเรือ เรือก็จะค่อยๆ จมลง...
                  </p>
                  <div className="p-4 rounded-xl bg-emerald-deep/40 border-l-4 border-gold-warm text-xs sm:text-sm text-parchment-muted">
                    <strong className="text-gold-light block mb-1">บทเรียนแก่นแท้ (Easy Takeaways):</strong>
                    โลกภายนอกเหมือนน้ำในทะเล เรือลอยบนน้ำได้ แต่ห้ามให้น้ำรั่วเข้าสู่ใจเรา
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in text-parchment-cream/90 leading-relaxed text-sm sm:text-base font-light">
                  <p className="text-lg font-serif font-semibold text-gold-light">
                    &ldquo;ญาณวิทยาแห่งดุนยาและการจัดวาง Teleology&rdquo;
                  </p>
                  <p>
                    ในทางญาณวิทยาและปรัชญาเทววิทยา ดุนยามิใช่สิ่งชั่วร้ายในเชิงภววิทยา (Ontological evil) แต่ &quot;พิษแห่งดุนยา&quot; อุบัติขึ้นเมื่อมนุษย์เกิดความวิปริตทางทัศนะในการจัดลำดับคุณค่าสูงสุด (Teleological Inversion) แปรเปลี่ยนสถานะของโลกกายภาพจาก &quot;สื่อกลาง (Wasīlah)&quot; ไปสู่ &quot;จุดหมายสูงสุดในตัวเอง (Ghāyah)&quot;...
                  </p>
                  <div className="p-4 rounded-xl bg-slate-card border-l-4 border-blue-400 text-xs sm:text-sm text-parchment-muted font-mono">
                    <strong className="text-blue-300 block mb-1 font-sans">การอ้างอิงเชิงวิชาการ (Epistemic References):</strong>
                    Al-Ghazali, Ihya Ulum al-Din • Kahneman (2011), Hedonic Adaptation & System 1/2
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-border/40 flex justify-end">
              <Link
                href={`/articles/${sampleChapter.slug}`}
                className="text-xs font-semibold text-gold-warm hover:text-gold-light flex items-center gap-1.5 transition"
              >
                <span>เปิดอ่านบทความฉบับเต็ม พร้อมเครื่องเล่นพอดแคสต์</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. 7 SAFE SERIES (35 CHAPTERS OVERVIEW) */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 text-gold-warm text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Curriculum & Wisdom Roadmap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-parchment-cream">
            7 ธีมหลักแห่งการปกป้องจิตวิญญาณ
          </h2>
          <p className="text-sm text-parchment-muted">
            การเดินทาง 35 บท ผ่าน 4 มิติแห่งปัญญา: มิติแห่งตน, ปัญญาตรรกะ, จิตวิญญาณ, และมรดกนิรันดร์
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {mockSeries.map((series, index) => (
            <div
              key={series.id}
              className="group rounded-2xl bg-gradient-to-b from-emerald-card to-slate-card border border-emerald-border/70 hover:border-gold/50 shadow-lg hover:shadow-gold-sm transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={series.cover_image}
                  alt={series.title_th}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-75 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-card via-transparent to-black/30" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono font-bold text-gold-warm">
                  Series #{series.order_index}
                </span>
                <span className="absolute bottom-3 left-3 text-[11px] text-parchment-muted/90 font-medium">
                  {series.dimension}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-parchment-cream group-hover:text-gold-light transition">
                    {series.title_th}
                  </h3>
                  <p className="text-xs text-gold-warm/80 font-medium tracking-wide mb-2">
                    {series.title_en}
                  </p>
                  <p className="text-xs text-parchment-muted line-clamp-3 leading-relaxed">
                    {series.description_th}
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-border/40 flex items-center justify-between text-xs">
                  <span className="text-parchment-muted/80">5 บทย่อย • รวมเสียง & คลิป</span>
                  <Link
                    href={`/articles/${index === 0 ? 'art-of-self-awareness' : 'art-of-self-awareness'}`}
                    className="text-gold-light font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>สำรวจ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. FOUNDING 100 QUOTA HIGHLIGHT & LIVE COUNTER */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <FoundingCountdown initialQuota={mockFoundingQuota} />
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 5. 3-TIER MEMBERSHIP COMPARISON */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-warm">
            Membership & Access Control
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-parchment-cream">
            เลือกระดับการสนับสนุนที่คุณต้องการ
          </h2>
          <p className="text-sm text-parchment-muted">
            สนับสนุนเพื่อร่วมสร้างสังคมแห่งปัญญา พร้อมรับสิทธิประโยชน์อันทรงคุณค่า
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {/* Tier 1: Free Member */}
          <div className="rounded-2xl p-6 sm:p-8 bg-emerald-card/60 border border-emerald-border flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-parchment-muted">
                Tier 1
              </span>
              <h3 className="text-xl font-serif font-bold text-parchment-cream mt-1 mb-2">
                Free Member
              </h3>
              <div className="text-2xl font-bold font-mono text-parchment-light mb-4">
                ฿0 <span className="text-xs text-parchment-muted font-sans">ตลอดชีพ</span>
              </div>
              <p className="text-xs text-parchment-muted mb-6 leading-relaxed">
                สมัครด้วยอีเมลง่ายๆ เพื่อเริ่มต้นก้าวแรกแห่งการเรียนรู้
              </p>

              <ul className="space-y-3 text-xs text-parchment-muted mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ดาวน์โหลด E-book 7 บทหลักฟรีทันที</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>เข้าถึงเนื้อหาบทที่ 1 - 3 ได้ฟรีตลอดชีพ</span>
                </li>
                <li className="flex items-center gap-2 text-parchment-muted/50">
                  <span className="w-4 h-4 border border-white/20 rounded-full flex items-center justify-center text-[10px]">✕</span>
                  <span>ปลดล็อก 35 ตอนครบชุด</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setIsEbookOpen(true)}
              className="w-full py-3 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold/30 text-gold-light text-xs font-bold transition"
            >
              สมัครสมาชิกฟรี
            </button>
          </div>

          {/* Tier 2: Supporter 199 THB/mo */}
          <div className="rounded-2xl p-6 sm:p-8 bg-emerald-surface/70 border-2 border-emerald-border/80 flex flex-col justify-between relative shadow-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Tier 2 • แนะนำสำหรับผู้เรียนรู้ต่อเนื่อง
              </span>
              <h3 className="text-xl font-serif font-bold text-parchment-cream mt-1 mb-2">
                Monthly / Yearly Supporter
              </h3>
              <div className="text-2xl font-bold font-mono text-gold-light mb-4">
                ฿199 <span className="text-xs text-parchment-muted font-sans">/ เดือน</span>
              </div>
              <p className="text-xs text-parchment-muted mb-6 leading-relaxed">
                ปลดล็อกคลังปัญญาทั้งหมด ครบ 35 บท พร้อมระบบเสียงพอดแคสต์
              </p>

              <ul className="space-y-3 text-xs text-parchment-cream/90 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ปลดล็อกครบ 35 บท ทั้ง Easy และ Deep Mode</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ฟังพอดแคสต์เสียงความคมชัดสูงทุกตอน</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>รับบทบาท Supporter ใน Discord และสิทธิ์กลุ่ม Telegram</span>
                </li>
              </ul>
            </div>

            <Link
              href="/pricing#supporter-checkout"
              className="w-full py-3 rounded-xl bg-gold-gradient text-slate-abyss text-xs font-bold hover:brightness-110 shadow-gold-sm transition text-center"
            >
              สมัครสนับสนุน ฿199/เดือน
            </Link>
          </div>

          {/* Tier 3: Founding 100 Lifetime */}
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#1C3A2D] to-slate-card border-2 border-gold-warm flex flex-col justify-between relative shadow-gold-md">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gold-gradient text-slate-abyss text-[10px] font-black uppercase tracking-wider shadow-sm">
              จำกัด 100 ท่าน
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-warm flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Tier 3 • สิทธิพิเศษตลอดชีพ</span>
              </span>
              <h3 className="text-xl font-serif font-bold text-parchment-light mt-1 mb-2">
                Founding 100 Lifetime
              </h3>
              <div className="text-2xl font-bold font-mono text-gold-light mb-4">
                ฿3,990 <span className="text-xs text-parchment-muted font-sans">จ่ายครั้งเดียวตลอดชีพ</span>
              </div>
              <p className="text-xs text-parchment-muted mb-6 leading-relaxed">
                สำหรับผู้มีวิสัยทัศน์ที่ต้องการร่วมสร้างและได้รับทุกอย่างในระดับพรีเมียม
              </p>

              <ul className="space-y-3 text-xs text-parchment-cream/90 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>เข้าถึง 35 บทตลอดชีพ รวมการอัปเดตในอนาคต</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ดาวน์โหลด Full Master E-book 240 หน้าพร้อมลายน้ำเฉพาะ</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>โค้ดส่วนลด 20% สำหรับสินค้า Physical Merch ทุกชิ้น</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>บทบาท Founding 100 สีทองบน Discord & Telegram ส่วนตัว</span>
                </li>
              </ul>
            </div>

            <Link
              href="/pricing#founding-checkout"
              className="w-full py-3 rounded-xl bg-gold-gradient text-slate-abyss text-xs font-bold hover:brightness-110 shadow-gold-sm transition text-center"
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

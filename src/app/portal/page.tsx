'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockSeries, mockChapters, mockFoundingQuota } from '@/lib/supabase/mockData';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { TierType, Chapter } from '@/types';
import {
  Crown,
  ShieldCheck,
  BookOpen,
  Headphones,
  Download,
  Share2,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Copy,
  Check,
  Tag,
  Compass,
  Radio,
  FileText,
  UserCheck,
  ChevronRight,
  Coffee,
} from 'lucide-react';

export default function PortalPage() {
  const [activeTier, setActiveTier] = useState<TierType>('founding_tier_3');
  const [activeTab, setActiveTab] = useState<'vault' | 'curriculum' | 'community' | 'journal' | 'perks'>('vault');
  const [isCopiedTelegram, setIsCopiedTelegram] = useState(false);
  const [isCopiedCoupon, setIsCopiedCoupon] = useState(false);
  const [userEmail] = useState('soul.seeker@example.com');
  const [savedNotes, setSavedNotes] = useState<{ chapterTitle: string; note: string; time: string }[]>([]);

  const { playTrack, currentTrack, isPlaying, pauseTrack } = useAudio();
  const { member, isLoggedIn } = useAuth();

  useEffect(() => {
    if (member?.tier) {
      setActiveTier(member.tier);
    }
  }, [member]);

  // Load any saved notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loaded: { chapterTitle: string; note: string; time: string }[] = [];
      mockChapters.forEach((ch) => {
        const note = localStorage.getItem(`safe_soul_note_${ch.id}`);
        const time = localStorage.getItem(`safe_soul_note_time_${ch.id}`);
        if (note) {
          loaded.push({
            chapterTitle: ch.title_th,
            note,
            time: time || 'เมื่อเร็วๆ นี้',
          });
        }
      });
      setSavedNotes(loaded);
    }
  }, []);

  const handlePlayChapterAudio = (chapter: Chapter) => {
    if (currentTrack?.id === chapter.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack({
        id: chapter.id,
        title: chapter.title_th,
        seriesTitle: 'Safe from the Dunya',
        chapterNumber: chapter.chapter_number,
        audioUrl: chapter.audio_url,
        duration: chapter.audio_duration,
        coverImage: chapter.cover_image,
      });
    }
  };

  const handleCopyTelegram = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText('https://t.me/+SafeSoulFoundingPrivateInvite');
      setIsCopiedTelegram(true);
      setTimeout(() => setIsCopiedTelegram(false), 2000);
    }
  };

  const handleCopyCoupon = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText('FOUNDING20');
      setIsCopiedCoupon(true);
      setTimeout(() => setIsCopiedCoupon(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#08110D] text-parchment-cream pb-32 font-thai selection:bg-gold-warm selection:text-slate-abyss">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. PORTAL SANCTUARY HEADER */}
      {/* ---------------------------------------------------------------------- */}
      <section className="border-b border-emerald-border/60 bg-gradient-to-b from-[#0E2218] via-[#0A1712] to-[#08110D] pt-12 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-surface/90 border border-gold-warm/40 text-gold-light text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
                <span>พื้นที่สมาชิกส่วนตัว • Member Sanctuary</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-thai-serif font-black text-parchment-cream">
                วิหารแห่งปัญญาของคุณ
              </h1>
              <p className="text-sm text-parchment-muted max-w-xl">
                เข้าถึงคลังปัญญา 35 บท, ไฟล์ดิจิทัลประทับตราลิขสิทธิ์, สิทธิประโยชน์ชุมชน และบันทึกการตกผลึกความคิด
              </p>
            </div>

            {/* Member Card Profile Capsule */}
            {isLoggedIn && member ? (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#143123] to-[#0F261C] border border-gold-warm/50 shadow-xl flex items-center justify-between gap-4 min-w-[280px]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gold-warm/25 border border-gold-warm flex items-center justify-center text-gold-warm shadow-gold-sm shrink-0">
                    <Crown className="w-6 h-6 fill-current" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-parchment-cream font-semibold truncate max-w-[170px]">{member.name}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-gold-warm text-slate-abyss text-xs font-cinzel font-black uppercase tracking-wider shadow-sm">
                        MEMBER #{member.memberNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/login"
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-gold-warm/40 text-gold-light transition shadow-sm font-medium"
                >
                  ดูบัตร
                </Link>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#0F261C] border border-gold-warm/30 shadow-xl flex items-center gap-4 min-w-[280px]">
              <div className="w-12 h-12 rounded-xl bg-gold-warm/20 border border-gold-warm flex items-center justify-center text-gold-warm shadow-gold-sm shrink-0">
                {activeTier === 'founding_tier_3' ? (
                  <Crown className="w-6 h-6 fill-current" />
                ) : activeTier === 'supporter_tier_2' ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <BookOpen className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-parchment-muted truncate max-w-[170px]">{userEmail}</div>
                <div className="flex items-center gap-1.5">
                  {activeTier === 'founding_tier_3' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-gold-warm text-slate-abyss text-xs font-cinzel font-black uppercase tracking-wider">
                      Founding 100 #42
                    </span>
                  )}
                  {activeTier === 'supporter_tier_2' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-abyss text-xs font-bold">
                      Supporter Member
                    </span>
                  )}
                  {activeTier === 'free_tier_1' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-parchment-cream text-xs font-medium">
                      Free Member
                    </span>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Tier Simulator Toggle (Allows instant switching to test portal under any Tier) */}
          <div className="pt-4 border-t border-emerald-border/40 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="text-parchment-muted flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-gold-warm" />
              <span>ทดสอบมุมมองพอร์ทัลตามระดับสมาชิก:</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTier('free_tier_1')}
                className={`px-3 py-1.5 rounded-xl border text-xs transition ${
                  activeTier === 'free_tier_1'
                    ? 'bg-parchment-cream text-slate-abyss font-bold border-white'
                    : 'bg-emerald-surface/60 text-parchment-muted hover:text-white border-emerald-border/60'
                }`}
              >
                Tier 1 (Free)
              </button>
              <button
                onClick={() => setActiveTier('supporter_tier_2')}
                className={`px-3 py-1.5 rounded-xl border text-xs transition ${
                  activeTier === 'supporter_tier_2'
                    ? 'bg-emerald-400 text-slate-abyss font-bold border-emerald-300'
                    : 'bg-emerald-surface/60 text-parchment-muted hover:text-white border-emerald-border/60'
                }`}
              >
                Tier 2 (Supporter)
              </button>
              <button
                onClick={() => setActiveTier('founding_tier_3')}
                className={`px-3 py-1.5 rounded-xl border text-xs transition ${
                  activeTier === 'founding_tier_3'
                    ? 'bg-gold-warm text-slate-abyss font-bold border-gold-light shadow-gold-sm'
                    : 'bg-emerald-surface/60 text-parchment-muted hover:text-white border-emerald-border/60'
                }`}
              >
                Tier 3 (Founding 100)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. PORTAL NAVIGATION TABS */}
      {/* ---------------------------------------------------------------------- */}
      <nav aria-label="Portal Navigation" className="border-b border-emerald-border/60 bg-[#0A1610]/95 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-3 no-scrollbar text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'vault'
                ? 'bg-emerald-surface text-gold-light border border-gold-warm/40 font-bold shadow-sm'
                : 'text-parchment-muted hover:text-white'
            }`}
          >
            <Download className="w-4 h-4 text-gold-warm" />
            <span>คลังดิจิทัล & E-book</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'curriculum'
                ? 'bg-emerald-surface text-gold-light border border-gold-warm/40 font-bold shadow-sm'
                : 'text-parchment-muted hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-gold-warm" />
            <span>บทเรียน 35 บท</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'community'
                ? 'bg-emerald-surface text-gold-light border border-gold-warm/40 font-bold shadow-sm'
                : 'text-parchment-muted hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-gold-warm" />
            <span>ชุมชน Discord & Telegram</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'journal'
                ? 'bg-emerald-surface text-gold-light border border-gold-warm/40 font-bold shadow-sm'
                : 'text-parchment-muted hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-gold-warm" />
            <span>สมุดบันทึกข้อคิด ({savedNotes.length})</span>
          </button>

          {activeTier === 'founding_tier_3' && (
            <button
              onClick={() => setActiveTab('perks')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
                activeTab === 'perks'
                  ? 'bg-gold-warm text-slate-abyss font-bold shadow-gold-sm'
                  : 'text-gold-light hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>สิทธิพิเศษผู้ร่วมก่อตั้ง</span>
            </button>
          )}
        </div>
      </nav>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. TAB PANELS */}
      {/* ---------------------------------------------------------------------- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* TAB 1: DIGITAL VAULT & WATERMARKED E-BOOK */}
        {activeTab === 'vault' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* E-book Master Asset Card */}
              <div className="rounded-3xl p-6 sm:p-8 bg-emerald-card/70 border border-emerald-border flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>ไฟล์ดิจิทัลฉบับสมบูรณ์</span>
                    </span>
                    {activeTier === 'founding_tier_3' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                        ปลดล็อกแล้ว (Free)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
                        สิทธิ์เฉพาะ Founding 100
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                    E-book ฉบับเต็ม 240 หน้า (The Safe Soul Master)
                  </h3>
                  <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                    รวบรวมเนื้อหาครบ 35 ตอน พร้อมแผนผัง 4 มิติแห่งปัญญา อินโฟกราฟิกความละเอียดสูง
                    และระบบประทับตราลิขสิทธิ์ดิจิทัลเฉพาะบุคคลเพื่อความเป็นเจ้าของถาวร
                  </p>

                  {/* Watermark Preview Box */}
                  <div className="p-4 rounded-xl bg-black/60 border border-gold-warm/20 space-y-1.5 text-xs">
                    <span className="text-xs font-mono text-gold-warm block">
                      ตัวอย่างการประทับตราลิขสิทธิ์ดิจิทัล (Personalized Watermark):
                    </span>
                    <div className="font-mono text-xs text-parchment-muted/80 bg-white/5 p-2 rounded border border-white/5">
                      &quot;Licensed exclusively to {userEmail} • Safe Soul Founding Registry ID #42&quot;
                    </div>
                  </div>
                </div>

                <div>
                  {activeTier === 'founding_tier_3' ? (
                    <a
                      href="/Safe_Soul_Sample_Ebook.pdf"
                      download="Safe_Soul_Master_240p.pdf"
                      className="w-full py-3.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm hover:brightness-110 transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลด Full Master E-book (PDF 240 หน้า)</span>
                    </a>
                  ) : (
                    <Link
                      href="/pricing"
                      className="w-full py-3.5 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/40 text-gold-light font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>อัปเกรดเป็น Founding 100 เพื่อรับ E-book ฟรี</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Lossless Audio Masterclass Suite */}
              <div className="rounded-3xl p-6 sm:p-8 bg-emerald-card/70 border border-emerald-border flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gold-warm uppercase tracking-wider flex items-center gap-1.5">
                      <Headphones className="w-4 h-4" />
                      <span>คลังเสียงคุณภาพสูง</span>
                    </span>
                    {activeTier !== 'free_tier_1' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                        ปลดล็อกแล้ว (35 ตอน)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-parchment-muted text-xs">
                        ปลดล็อก 3 ตอน
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                    Audiobook & Masterclass Suite 35 ตอน
                  </h3>
                  <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                    ไฟล์เสียงพอดแคสต์คุณภาพสตูดิโอ (Lossless Hi-Res) พร้อมดนตรีบรรเลงสมาธิ binaural beats
                    ช่วยให้คุณสามารถฟังในรถ ขณะทำงาน หรือก่อนนอนได้อย่างราบรื่น
                  </p>

                  <div className="p-4 rounded-xl bg-black/60 border border-emerald-border/60 space-y-1 text-xs text-parchment-muted">
                    <div>• ความยาวรวม: 11 ชั่วโมง 45 นาที</div>
                    <div>• ฟอร์แมต: FLAC Lossless + MP3 320kbps</div>
                    <div>• รวมคู่มือไตร่ตรองสติ 7 นาทีประจำสัปดาห์</div>
                  </div>
                </div>

                <div>
                  {activeTier !== 'free_tier_1' ? (
                    <button
                      onClick={() => handlePlayChapterAudio(mockChapters[0])}
                      className="w-full py-3.5 rounded-xl bg-gold-warm hover:bg-gold-light text-slate-abyss font-bold text-sm shadow-gold-sm transition flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>เริ่มเปิดฟัง Audio Masterclass ต่อเนื่อง</span>
                    </button>
                  ) : (
                    <Link
                      href="/pricing"
                      className="w-full py-3.5 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/40 text-gold-light font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>สมัคร Supporter เพื่อปลดล็อกครบ 35 ตอน</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Access Free Ebook Sample */}
            <div className="rounded-2xl p-6 bg-[#0E1A14] border border-emerald-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-parchment-cream">
                  E-book ตัวอย่าง 7 บทหลัก (ฉบับ Free Member)
                </h4>
                <p className="text-xs text-parchment-muted">
                  ดาวน์โหลดไฟล์ PDF สรุป 7 เสาหลัก สำหรับทบทวนบนแท็บเล็ตหรือพิมพ์อ่าน
                </p>
              </div>
              <a
                href="/Safe_Soul_Sample_Ebook.pdf"
                download="Safe_Soul_Sample_7Chapters.pdf"
                className="px-5 py-2.5 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-emerald-border text-parchment-cream text-xs font-semibold transition flex items-center gap-2 shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>ดาวน์โหลด 7 บทฟรี (PDF)</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: CURRICULUM 35 CHAPTERS */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-thai-serif font-bold text-parchment-cream">
                  สารบัญหลักสูตร 4 มิติแห่งปัญญา
                </h3>
                <p className="text-xs text-parchment-muted">
                  เลือกอ่านหรือเปิดฟังเสียงได้ทันที
                </p>
              </div>

              {activeTier === 'free_tier_1' && (
                <Link
                  href="/pricing"
                  className="text-xs text-gold-warm hover:text-gold-light font-semibold flex items-center gap-1"
                >
                  <span>ปลดล็อกทุกบท</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {mockChapters.map((ch) => {
                const isLocked = !ch.is_free && activeTier === 'free_tier_1';
                const isCurrentlyPlayingThis = currentTrack?.id === ch.id && isPlaying;

                return (
                  <div
                    key={ch.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isLocked
                        ? 'bg-black/30 border-white/5 opacity-70'
                        : 'bg-emerald-card/70 hover:bg-emerald-surface/80 border-emerald-border/70'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-emerald-border flex items-center justify-center text-gold-light text-xs font-cinzel font-bold shrink-0">
                        {ch.chapter_number}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-semibold text-parchment-cream">
                            {ch.title_th}
                          </h4>
                          {ch.is_free ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 font-medium">
                              อ่านฟรี
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs bg-gold-warm/20 text-gold-warm font-medium">
                              {isLocked ? 'ต้องปลดล็อก' : 'ปลดล็อกแล้ว'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-parchment-muted line-clamp-1">
                          {ch.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      {!isLocked ? (
                        <>
                          <button
                            onClick={() => handlePlayChapterAudio(ch)}
                            className="px-3 py-2 rounded-xl bg-emerald-dark hover:bg-emerald-surface border border-emerald-border text-xs text-parchment-cream transition flex items-center gap-1.5"
                          >
                            {isCurrentlyPlayingThis ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current text-gold-warm" />
                                <span>หยุดเสียง</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current text-gold-warm" />
                                <span>ฟังเสียง ({ch.audio_duration})</span>
                              </>
                            )}
                          </button>

                          <Link
                            href={`/articles/${ch.slug}`}
                            className="px-3.5 py-2 rounded-xl bg-gold-warm/90 hover:bg-gold-light text-slate-abyss text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <span>เข้าสู่วิหารการอ่าน</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </>
                      ) : (
                        <Link
                          href="/pricing"
                          className="px-4 py-2 rounded-xl bg-black/60 border border-gold-warm/30 text-gold-light text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>ปลดล็อกบทเรียนนี้</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: COMMUNITY ACCESS (DISCORD & TELEGRAM) */}
        {activeTab === 'community' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Discord Integration Box */}
              <div className="rounded-3xl p-6 sm:p-8 bg-emerald-card/70 border border-emerald-border flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>Discord Community</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>บอทเชื่อมต่อแล้ว</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                    Safe Soul Sanctuary Discord
                  </h3>
                  <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                    แลกเปลี่ยนมุมมองทางปรัชญาและร่วมวงสนทนาประจำสัปดาห์ พร้อมรับยศพิเศษประจำระดับสมาชิก
                  </p>

                  <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-parchment-muted">
                      <span>บัญชี Discord ของคุณ:</span>
                      <span className="font-mono text-gold-light">seeker_soul#1234</span>
                    </div>
                    <div className="flex items-center justify-between text-parchment-muted">
                      <span>บทบาทที่ได้รับ (Role):</span>
                      <span className="font-semibold text-gold-warm flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-current" />
                        <span>Founding Member (Gold)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>เปิดเซิร์ฟเวอร์ Discord</span>
                </a>
              </div>

              {/* Telegram Private Cohort Box */}
              <div className="rounded-3xl p-6 sm:p-8 bg-emerald-card/70 border border-emerald-border flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-4 h-4" />
                      <span>Telegram Secret Group</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                      ลิงก์เฉพาะสมาชิก
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                    กลุ่มลับ Telegram ผู้ร่วมก่อตั้ง
                  </h3>
                  <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                    รับข่าวสารอัปเดตบทความใหม่ สรุปแก่นปัญหาก่อนใคร และพูดคุยโดยตรงกับทีมผู้เรียบเรียง
                  </p>

                  <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-1 text-xs">
                    <span className="text-xs text-parchment-muted block">ลิงก์เชิญพิเศษ (Single-use):</span>
                    <div className="font-mono text-sky-300 break-all select-all">
                      https://t.me/+SafeSoulFoundingPrivateInvite
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyTelegram}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/30 text-parchment-cream font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    {isCopiedTelegram ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>คัดลอกลิงก์แล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>คัดลอกลิงก์</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>เข้ากลุ่มทันที</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MY SANCTUARY REFLECTIONS (JOURNAL) */}
        {activeTab === 'journal' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-thai-serif font-bold text-parchment-cream">
                  สมุดบันทึกการตกผลึกความคิด (Sanctuary Journal)
                </h3>
                <p className="text-xs text-parchment-muted">
                  ข้อคิดและคำตอบการใคร่ครวญที่คุณบันทึกไว้ระหว่างศึกษาบทความ
                </p>
              </div>

              <Link
                href="/articles/art-of-self-awareness"
                className="text-xs text-gold-warm hover:text-gold-light flex items-center gap-1 font-semibold"
              >
                <span>ไปที่วิหารการอ่านเพื่อบันทึกเพิ่ม</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {savedNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedNotes.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-emerald-card border border-emerald-border/80 space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                      <span className="font-semibold text-gold-light truncate max-w-[200px]">
                        {item.chapterTitle}
                      </span>
                      <span className="text-xs text-parchment-muted">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-sm text-parchment-cream leading-relaxed whitespace-pre-line italic">
                      &ldquo;{item.note}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl p-12 bg-black/40 border border-white/5 text-center space-y-4 max-w-md mx-auto">
                <FileText className="w-10 h-10 text-parchment-muted/50 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-parchment-cream">
                    ยังไม่มีบันทึกข้อคิดในบทเรียน
                  </h4>
                  <p className="text-xs text-parchment-muted">
                    เมื่อคุณเข้าไปอ่านบทความใน Article Reader คุณสามารถกดปุ่ม &quot;บันทึกข้อคิด&quot; เพื่อเก็บการตกผลึกมาไว้ที่นี่ได้
                  </p>
                </div>
                <Link
                  href="/articles/art-of-self-awareness"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm"
                >
                  <span>เริ่มอ่านและบันทึกบทแรก</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FOUNDING PERKS & MERCH DISCOUNTS */}
        {activeTab === 'perks' && activeTier === 'founding_tier_3' && (
          <div className="space-y-8 animate-fade-in">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1E3B2E] via-[#12261C] to-slate-card border-2 border-gold-warm shadow-gold-luxury space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-gold-warm text-sm font-bold uppercase tracking-wider">
                  <Crown className="w-5 h-5 fill-current" />
                  <span>Founding 100 Lifetime Privilege</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-gold-warm text-slate-abyss text-xs font-black">
                  SLOT #42 / 100
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-thai-serif font-bold text-parchment-cream">
                  ส่วนลด 20% สำหรับสินค้า Physical Merch ตลอดชีพ
                </h3>
                <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed max-w-2xl">
                  ในฐานะผู้ร่วมก่อตั้ง คุณได้รับสิทธิ์ส่วนลด 20% สำหรับเสื้อยืดพรีเมียม Deep Emerald, หมวก Minimalist Soul Cap,
                  และร่มกัน UV ลายเรขาคณิตศักดิ์สิทธิ์ทุกชิ้นในร้านค้า
                </p>
              </div>

              {/* Coupon Code Box */}
              <div className="p-5 rounded-2xl bg-black/60 border border-gold-warm/40 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-lg">
                <div className="space-y-1">
                  <span className="text-xs text-parchment-muted uppercase tracking-wider block">
                    โค้ดส่วนลดประจำตัวของคุณ:
                  </span>
                  <span className="text-2xl font-mono font-bold text-gold-light tracking-widest">
                    FOUNDING20
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyCoupon}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gold-warm hover:bg-gold-light text-slate-abyss font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-gold-sm"
                  >
                    {isCopiedCoupon ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>คัดลอกโค้ด</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/store"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold/30 text-parchment-cream font-semibold text-xs transition flex items-center justify-center gap-1"
                  >
                    <span>ไปที่ร้านค้า</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

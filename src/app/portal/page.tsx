'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { mockProducts } from '@/lib/supabase/mockData';
import { TierType, OneshotChapter, DeepOceanArchipelago } from '@/types';
import {
  Crown,
  ShieldCheck,
  BookOpen,
  Headphones,
  Mail,
  ShoppingBag,
  Clock,
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
  Compass,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Anchor,
  Sailboat,
  Layers,
  Flame,
} from 'lucide-react';

export default function PortalPage() {
  const { member, isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const [activeTier, setActiveTier] = useState<TierType>('founding_tier_3');
  const [activeTab, setActiveTab] = useState<'vault' | 'curriculum' | 'community' | 'perks'>('vault');
  const [isCopiedTelegram, setIsCopiedTelegram] = useState(false);
  const [isCopiedCoupon, setIsCopiedCoupon] = useState(false);
  const [audioPrompt, setAudioPrompt] = useState<string | null>(null);

  // Ocean Data State
  const [shallowWaters, setShallowWaters] = useState<OneshotChapter[]>([]);
  const [deepArchipelagos, setDeepArchipelagos] = useState<DeepOceanArchipelago[]>([]);
  const [isLoadingOcean, setIsLoadingOcean] = useState(true);
  const [expandedArchipelago, setExpandedArchipelago] = useState<number | null>(1);

  const { playTrack, currentTrack, isPlaying, pauseTrack } = useAudio();

  useEffect(() => {
    if (member?.tier) {
      setActiveTier(member.tier);
    }
  }, [member]);

  // Load real ocean data from API
  useEffect(() => {
    let isMounted = true;
    async function loadOceanData() {
      try {
        const res = await fetch('/api/ocean');
        const json = await res.json();
        if (isMounted && json.success) {
          if (json.shallowWaters?.items) {
            setShallowWaters(json.shallowWaters.items);
          }
          if (json.deepOcean?.items) {
            setDeepArchipelagos(json.deepOcean.items);
          }
        }
      } catch (err) {
        console.error('Failed to load ocean data for portal:', err);
      } finally {
        if (isMounted) setIsLoadingOcean(false);
      }
    }
    loadOceanData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlayAudio = (track: {
    id: string;
    title: string;
    seriesTitle: string;
    chapterNumber: number;
    audioUrl?: string;
    duration?: string;
    coverImage?: string;
  }) => {
    const isShallow = track.id.startsWith('oneshot-');

    // Visitor not logged in -> only Shallow Waters Islands 1-3 allowed
    if (!isLoggedIn && isShallow && track.chapterNumber > 3) {
      setAudioPrompt(
        'ผู้ที่ไม่เข้าสู่ระบบสามารถเปิดฟังเสียงได้เฉพาะทะเลน้ำตื้น 3 เกาะแรกเท่านั้น กรุณาเข้าสู่ระบบฟรีเพื่อฟังครบทั้ง 7 เกาะ'
      );
      setTimeout(() => setAudioPrompt(null), 5000);
      return;
    }

    // Deep Ocean audio -> gated for Supporter & Founding 100
    if (!isShallow && activeTier === 'free_tier_1') {
      setAudioPrompt(
        'ระบบเสียงในทะเลน้ำลึกเปิดให้เฉพาะสมาชิกเรือประมงน้ำลึก (Supporter) และเรือสำราญทุกมรสุม (Founding 100) เท่านั้น'
      );
      setTimeout(() => setAudioPrompt(null), 5000);
      return;
    }

    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack({
        id: track.id,
        title: track.title,
        seriesTitle: track.seriesTitle,
        chapterNumber: track.chapterNumber,
        audioUrl: track.audioUrl || `/audio/oneshot/island${track.chapterNumber}-full.mp3`,
        duration: track.duration || '16:30',
        coverImage: track.coverImage || `/images/oneshot/Oneshot${track.chapterNumber}_main.jpg`,
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

  // Dynamic Accessible Count string based on activeTier
  const getAccessibleCountText = () => {
    if (activeTier === 'founding_tier_3') {
      return 'อภิสิทธิ์สูงสุด ปลดล็อกครบ 57 บทเรียนแห่งมหาสมุทร (7 ทะเลน้ำตื้น + 50 ทะเลน้ำลึก) ทันที พร้อมระบบเสียงและของขวัญดิจิทัล';
    }
    if (activeTier === 'supporter_tier_2') {
      return 'เข้าถึง 7 เกาะทะเลน้ำตื้น + ปลดล็อกบทเรียนทะเลน้ำลึกรายสัปดาห์ (30 บทแรกเปิดแล้ว) + ฟังเสียงพอดแคสต์ในบทความทุกบท';
    }
    return 'เข้าถึง 7 เกาะทะเลน้ำตื้นเต็มรูปแบบ + บทเรียนเกาะย่อยแรกของทะเลน้ำลึก 7 หมู่เกาะ (รวม 14 บทเรียนที่อ่านได้ฟรี)';
  };

  return (
    <div className="min-h-screen bg-[#08110D] text-parchment-cream pb-32 font-thai selection:bg-gold-warm selection:text-slate-abyss">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. PORTAL SANCTUARY HEADER                                             */}
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
              <p className="text-xs sm:text-sm text-parchment-muted max-w-xl leading-relaxed">
                {getAccessibleCountText()}
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
                    <div className="text-xs text-parchment-cream font-semibold truncate max-w-[170px]">
                      {member.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-gold-warm text-slate-abyss text-xs font-cinzel font-black uppercase tracking-wider shadow-sm">
                        MEMBER #{member.memberNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/login"
                  className="text-xs px-3 py-1.5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-gold-warm/40 text-gold-light transition shadow-sm font-semibold"
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
                  <div className="text-xs text-parchment-muted truncate max-w-[170px]">
                    {member?.email || 'soul.seeker@example.com'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {activeTier === 'founding_tier_3' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-gold-warm text-slate-abyss text-xs font-cinzel font-black uppercase tracking-wider">
                        Founding 100 #42
                      </span>
                    )}
                    {activeTier === 'supporter_tier_2' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-abyss text-xs font-bold">
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

          {/* Tier Simulator Toggle */}
          <div className="pt-4 border-t border-emerald-border/40 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="text-parchment-muted flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-gold-warm" />
              <span>ทดสอบมุมมองพอร์ทัลตามระดับสมาชิก:</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
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
                type="button"
                onClick={() => setActiveTier('supporter_tier_2')}
                className={`px-3 py-1.5 rounded-xl border text-xs transition ${
                  activeTier === 'supporter_tier_2'
                    ? 'bg-cyan-400 text-slate-abyss font-bold border-cyan-300'
                    : 'bg-emerald-surface/60 text-parchment-muted hover:text-white border-emerald-border/60'
                }`}
              >
                Tier 2 (Supporter)
              </button>
              <button
                type="button"
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

      {/* Floating Audio Prompt Toast */}
      {audioPrompt && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-black/90 border border-gold-warm text-gold-light text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in">
          <Headphones className="w-4 h-4 text-gold-warm shrink-0" />
          <span>{audioPrompt}</span>
          <Link
            href="/pricing"
            className="px-2.5 py-1 rounded-lg bg-gold-warm text-slate-abyss text-xs font-bold hover:brightness-110"
          >
            ดูแพ็กเกจ
          </Link>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 2. PORTAL NAVIGATION TABS                                              */}
      {/* ---------------------------------------------------------------------- */}
      <nav aria-label="Portal Navigation" className="border-b border-emerald-border/60 bg-[#0A1610]/95 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-3 no-scrollbar text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'vault'
                ? 'bg-emerald-surface text-gold-light border border-gold-warm/40 font-bold shadow-sm'
                : 'text-parchment-muted hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4 text-gold-warm" />
            <span>คลังดิจิทัล & E-Book (ส่งทางอีเมล)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'curriculum'
                ? 'bg-emerald-surface text-gold-light border border-gold-warm/40 font-bold shadow-sm'
                : 'text-parchment-muted hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-gold-warm" />
            <span>คลังบทเรียนแห่งมหาสมุทร (Ocean Curriculum)</span>
          </button>

          <button
            type="button"
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

          {activeTier === 'founding_tier_3' && (
            <button
              type="button"
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
      {/* 3. TAB PANELS                                                          */}
      {/* ---------------------------------------------------------------------- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ==================================================================== */}
        {/* TAB 1: DIGITAL VAULT & 2 E-BOOKS (EMAIL ONLY + COMING SOON)         */}
        {/* ==================================================================== */}
        {activeTab === 'vault' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* E-BOOK 1: SHALLOW WATERS E-BOOK (฿199 -> FREE ฿0 VIA REGISTERED EMAIL ONLY) */}
              <div className="rounded-3xl p-6 sm:p-8 bg-emerald-card/70 border border-emerald-border/80 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Sailboat className="w-4 h-4" />
                      <span>E-Book ฉบับเกาะทะเลน้ำตื้น (73 หน้า)</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-parchment-muted/60 line-through">
                        ฿199
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                        พิเศษ ฟรี ฿0 (ส่งทางอีเมล)
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                    เกราะพิทักษ์ฟิฏเราะฮฺ — ฉบับเกาะทะเลน้ำตื้น (7 บทหลัก)
                  </h3>
                  <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                    หนังสือดิจิทัล 73 หน้า สรุปเนื้อหา 7 เกาะแห่งปัญญาเพื่อสร้างภูมิคุ้มกันทางจิตวิญญาณ จัดส่งเฉพาะทางอีเมลที่ใช้สมัครสมาชิกเท่านั้น (ไม่มีปุ่มดาวน์โหลดหน้าเว็บ และจำกัดสิทธิ์รับฟรี 1 ครั้งต่ออีเมลสมาชิก)
                  </p>

                  <div className="p-4 rounded-xl bg-black/60 border border-emerald-border/40 space-y-1.5 text-xs text-parchment-muted">
                    <div>• ราคาพิเศษสำหรับสมาชิก: <strong className="text-emerald-300">ฟรี ฿0</strong> (จากราคาปกติ ฿199)</div>
                    <div>• รูปแบบการรับ: หยิบใส่ตะกร้า Safe for Support เพื่อส่งเข้าอีเมลที่สมัครสมาชิก</div>
                    <div>• ข้อกำหนด: รับได้เพียง 1 ครั้งต่อ 1 บัญชีอีเมลสมาชิกเท่านั้น</div>
                  </div>
                </div>

                <div>
                  {member?.ebookClaimed ? (
                    <div className="w-full py-3.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>จัดส่งไปยังอีเมล {member.email} เรียบร้อยแล้ว (ใช้สิทธิ์ครบ 1 ครั้ง)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(mockProducts[0], 1)}
                      className="w-full py-3.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>หยิบใส่ตะกร้าเพื่อรับทางอีเมลสมาชิก (ฟรี ฿0 จาก ฿199)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* E-BOOK 2: DEEP OCEAN FULL MASTER E-BOOK (COMING SOON) */}
              <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#1C3B2C]/90 via-[#12261C] to-slate-card border-2 border-cyan-500/40 flex flex-col justify-between space-y-6 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Anchor className="w-4 h-4" />
                      <span>E-Book ฉบับทะเลน้ำลึก 10 หมู่เกาะ</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-200 border border-cyan-400/50 text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Coming Soon • เร็วๆ นี้</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                    Full Master E-Book: มหาสมุทรแห่งความจริง (10 หมู่เกาะ)
                  </h3>
                  <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                    รวบรวมเนื้อหาเชิงลึกครบ 10 หมู่เกาะ (50 เกาะย่อย) พร้อมแผนผัง 4 มิติแห่งปัญญา และอินโฟกราฟิกความละเอียดสูง ขณะนี้อยู่ในระหว่างการจัดทำต้นฉบับสมบูรณ์ (Coming Soon)
                  </p>

                  {/* Watermark Preview Box */}
                  <div className="p-4 rounded-xl bg-black/60 border border-gold-warm/30 space-y-1.5 text-xs">
                    <span className="text-xs font-mono text-gold-warm block">
                      สิทธิ์การรับเมื่อเปิดตัว (Coming Soon):
                    </span>
                    <div className="font-thai text-xs text-parchment-muted/90 bg-white/5 p-2.5 rounded-lg border border-white/5">
                      สมาชิกผู้ร่วมก่อตั้ง (Founding 100 Lifetime) จะได้รับไฟล์ฉบับสมบูรณ์จัดส่งเข้าสู่อีเมลที่สมัครสมาชิก ({member?.email || 'member@example.com'}) โดยอัตโนมัติทันทีที่เปิดตัว
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-cyan-300" />
                    <span>กำลังจัดทำต้นฉบับสมบูรณ์ (Coming Soon)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: OCEAN CURRICULUM (REAL WEBSITE DATA: 7 SHALLOW + 50 DEEP)    */}
        {/* ==================================================================== */}
        {activeTab === 'curriculum' && (
          <div className="space-y-10 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-border/60">
              <div>
                <h3 className="text-2xl font-thai-serif font-black text-parchment-cream">
                  คลังบทเรียนแห่งมหาสมุทร (Ocean Curriculum)
                </h3>
                <p className="text-xs sm:text-sm text-parchment-muted mt-1">
                  แบ่งตามระดับสิทธิ์เรือที่คุณถือครอง: ทะเลน้ำตื้น (7 เกาะ) และทะเลน้ำลึก (10 หมู่เกาะ / 50 เกาะย่อย)
                </p>
              </div>

              {activeTier === 'free_tier_1' && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-sm"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>ปลดล็อกทุกเกาะ (อัปเกรดสมาชิก)</span>
                </Link>
              )}
            </div>

            {/* SECTION A: ทะเลน้ำตื้น (7 เกาะแห่งปัญญา) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-300 font-mono">
                  <Sailboat className="w-4 h-4 text-emerald-400" />
                  <span>1. ทะเลน้ำตื้น (7 เกาะแห่งปัญญา - S.A.F.E. Series)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                  ปลดล็อกครบ 7 เกาะ (อ่านฟรีทุกระดับ)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {shallowWaters.length > 0 ? (
                  shallowWaters.map((ch) => {
                    const isCurrentPlaying = currentTrack?.id === ch.id && isPlaying;
                    return (
                      <div
                        key={ch.id}
                        className="p-4 sm:p-5 rounded-2xl bg-emerald-card/70 hover:bg-emerald-surface/80 border border-emerald-border/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-black/50 border border-emerald-border/80 flex items-center justify-center text-gold-light text-xs font-cinzel font-bold shrink-0">
                            {ch.chapterNumber}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm sm:text-base font-semibold text-parchment-cream">
                                {ch.titleEn}
                              </h4>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium">
                                อ่านได้ฟรี
                              </span>
                            </div>
                            <p className="text-xs text-parchment-muted line-clamp-1">
                              {ch.titleTh}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                          {/* Audio button */}
                          <button
                            type="button"
                            onClick={() =>
                              handlePlayAudio({
                                id: ch.id,
                                title: `${ch.titleEn}: ${ch.titleTh}`,
                                seriesTitle: `ทะเลน้ำตื้น (S.A.F.E.) • เกาะที่ ${ch.chapterNumber}/7`,
                                chapterNumber: ch.chapterNumber,
                                audioUrl: ch.audio?.full?.url || ch.audioUrl,
                                duration: ch.audio?.full?.duration || ch.audioDuration || `${ch.readingTimeMinutes || 15} นาที`,
                                coverImage: ch.image,
                              })
                            }
                            className="px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 bg-emerald-dark hover:bg-emerald-surface border border-emerald-border text-parchment-cream cursor-pointer"
                          >
                            {isCurrentPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current text-gold-warm" />
                                <span>หยุดเสียง</span>
                              </>
                            ) : (
                              <>
                                <Headphones className="w-3.5 h-3.5 text-gold-warm" />
                                <span>ฟังเสียง</span>
                              </>
                            )}
                          </button>

                          {/* Read link */}
                          <Link
                            href={`/oneshot/${ch.slug}`}
                            className="px-3.5 py-2 rounded-xl bg-gold-warm/90 hover:bg-gold-light text-slate-abyss text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <span>เข้าอ่านเกาะนี้</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-parchment-muted bg-black/40 rounded-2xl border border-white/5">
                    {isLoadingOcean ? 'กำลังโหลดข้อมูลทะเลน้ำตื้น...' : 'ไม่พบข้อมูลบทเรียน'}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION B: ทะเลน้ำลึก (10 หมู่เกาะ / 50 เกาะย่อย) */}
            <div className="space-y-4 pt-4 border-t border-emerald-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-300 font-mono">
                  <Anchor className="w-4 h-4 text-cyan-400" />
                  <span>2. ทะเลน้ำลึก (10 หมู่เกาะแห่งปัญญา - 50 เกาะย่อย)</span>
                </div>
                <div className="text-xs text-parchment-muted">
                  {activeTier === 'founding_tier_3' ? (
                    <span className="text-gold-light font-bold">✓ ปลดล็อกครบทั้ง 10 หมู่เกาะ (50 บท) ตลอดชีพ</span>
                  ) : activeTier === 'supporter_tier_2' ? (
                    <span className="text-cyan-300 font-bold">✓ ปลดล็อกตามรอบประจำสัปดาห์</span>
                  ) : (
                    <span className="text-amber-300 font-semibold">⚠ สมาชิกฟรีอ่านได้เฉพาะเกาะย่อยที่ 1</span>
                  )}
                </div>
              </div>

              {/* 10 Archipelagos Accordion */}
              <div className="space-y-3">
                {deepArchipelagos.length > 0 ? (
                  deepArchipelagos.map((arch) => {
                    const isExpanded = expandedArchipelago === arch.archipelagoNumber;
                    const isArchipelagoLockedForFree =
                      activeTier === 'free_tier_1' && arch.archipelagoNumber > 7;

                    return (
                      <div
                        key={arch.id}
                        className="rounded-2xl bg-black/60 border border-emerald-border/60 overflow-hidden"
                      >
                        {/* Archipelago Header Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedArchipelago(isExpanded ? null : arch.archipelagoNumber)
                          }
                          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-emerald-surface/40 transition gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                              {arch.archipelagoNumber}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm sm:text-base font-bold text-parchment-cream">
                                  {arch.titleEn}
                                </h4>
                                <span className="text-xs text-gold-light font-thai hidden sm:inline">
                                  ({arch.titleTh})
                                </span>
                              </div>
                              <p className="text-xs text-parchment-muted line-clamp-1 mt-0.5">
                                {arch.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] font-mono text-parchment-muted">
                              5 เกาะย่อย
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gold-warm" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-parchment-muted" />
                            )}
                          </div>
                        </button>

                        {/* 5 Sub-Islands Expanded List */}
                        {isExpanded && (
                          <div className="p-4 pt-0 space-y-2 border-t border-white/5 bg-black/40">
                            {arch.subIslands.map((sub) => {
                              // Unlock rules:
                              // - Lifetime: always unlocked
                              // - Supporter: archipelago 1-7 sub 1-3 unlocked, rest upcoming
                              // - Free: archipelago 1-7 sub 1 unlocked, rest locked
                              let isSubUnlocked = false;
                              let statusText = 'ล็อก (สิทธิ์สมาชิก)';

                              if (activeTier === 'founding_tier_3') {
                                isSubUnlocked = true;
                                statusText = 'ปลดล็อกแล้ว';
                              } else if (activeTier === 'supporter_tier_2') {
                                if (arch.archipelagoNumber <= 7 && sub.chapterNumber <= 3) {
                                  isSubUnlocked = true;
                                  statusText = 'ปลดล็อกตามรอบ';
                                } else {
                                  statusText = 'รอเปิดรอบสัปดาห์ถัดไป';
                                }
                              } else {
                                // free_tier_1
                                if (arch.archipelagoNumber <= 7 && sub.chapterNumber === 1) {
                                  isSubUnlocked = true;
                                  statusText = 'อ่านฟรีเกาะย่อยแรก';
                                } else {
                                  statusText = 'ต้องปลดล็อกสมาชิก';
                                }
                              }

                              const isPlayingThisSub =
                                currentTrack?.id === `ocean-${arch.slug}-${sub.chapterNumber}` && isPlaying;

                              return (
                                <div
                                  key={sub.chapterNumber}
                                  className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                                    isSubUnlocked
                                      ? 'bg-emerald-950/20 hover:bg-emerald-900/30 border-emerald-500/30'
                                      : 'bg-black/40 border-white/5 opacity-65'
                                  }`}
                                >
                                  <div className="flex items-start sm:items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-[11px] font-mono text-gold-light shrink-0">
                                      {sub.chapterNumber}
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-xs sm:text-sm font-semibold text-parchment-cream">
                                          {sub.title}
                                        </h5>
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                            isSubUnlocked
                                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                              : 'bg-white/5 text-parchment-muted border-white/10'
                                          }`}
                                        >
                                          {statusText}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-parchment-muted line-clamp-1">
                                        {sub.excerpt}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                    {isSubUnlocked ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handlePlayAudio({
                                              id: `ocean-${arch.slug}-${sub.chapterNumber}`,
                                              title: `${sub.title} (${arch.titleEn})`,
                                              seriesTitle: `ทะเลน้ำลึก • หมู่เกาะที่ ${arch.archipelagoNumber}: ${arch.titleTh}`,
                                              chapterNumber: sub.chapterNumber,
                                              audioUrl: sub.audioUrl,
                                              duration: `${sub.readingTimeMinutes || 15} นาที`,
                                              coverImage: sub.coverImage || arch.coverImage,
                                            })
                                          }
                                          className="p-2 rounded-lg bg-emerald-dark hover:bg-emerald-surface border border-emerald-border text-parchment-cream transition"
                                          title="ฟังเสียงบรรยาย"
                                        >
                                          {isPlayingThisSub ? (
                                            <Pause className="w-3.5 h-3.5 fill-current text-gold-warm" />
                                          ) : (
                                            <Headphones className="w-3.5 h-3.5 text-gold-warm" />
                                          )}
                                        </button>

                                        <Link
                                          href={`/ocean/${arch.slug}/${sub.chapterNumber}`}
                                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/40 text-cyan-200 text-xs font-semibold transition flex items-center gap-1"
                                        >
                                          <span>อ่านเกาะนี้</span>
                                          <ChevronRight className="w-3 h-3" />
                                        </Link>
                                      </>
                                    ) : (
                                      <Link
                                        href="/pricing"
                                        className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-gold-warm/30 text-gold-light text-xs font-semibold flex items-center gap-1"
                                      >
                                        <Lock className="w-3 h-3" />
                                        <span>ปลดล็อก</span>
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-parchment-muted bg-black/40 rounded-2xl border border-white/5">
                    {isLoadingOcean ? 'กำลังโหลดข้อมูลทะเลน้ำลึก...' : 'ไม่พบข้อมูลหมู่เกาะ'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: COMMUNITY ACCESS (DISCORD & TELEGRAM)                        */}
        {/* ==================================================================== */}
        {activeTab === 'community' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Discord Integration Box */}
              <div className="rounded-3xl p-6 sm:p-8 bg-emerald-card/70 border border-emerald-border flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <MessageSquare className="w-4 h-4" />
                      <span>Discord Community</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>พร้อมเชื่อมต่อ</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                    Fitrah Shield Sanctuary Discord
                  </h3>
                  <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                    แลกเปลี่ยนมุมมองทางปรัชญาและร่วมวงสนทนาประจำสัปดาห์ พร้อมรับยศพิเศษประจำระดับสมาชิก
                  </p>

                  <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-parchment-muted">
                      <span>บัญชี Discord ของคุณ:</span>
                      <span className="font-mono text-gold-light">
                        {member?.username || 'seeker_soul'}#1234
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-parchment-muted">
                      <span>บทบาทที่ได้รับ (Role):</span>
                      <span className="font-semibold text-gold-warm flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-current" />
                        <span>
                          {activeTier === 'founding_tier_3'
                            ? 'Founding Member (Gold)'
                            : activeTier === 'supporter_tier_2'
                            ? 'Supporter Member'
                            : 'Free Member'}
                        </span>
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
                    <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
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
                    type="button"
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

        {/* ==================================================================== */}
        {/* TAB 4: FOUNDING PERKS & MERCH DISCOUNTS                             */}
        {/* ==================================================================== */}
        {activeTab === 'perks' && activeTier === 'founding_tier_3' && (
          <div className="space-y-8 animate-fade-in">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1E3B2E] via-[#12261C] to-slate-card border-2 border-gold-warm shadow-gold-luxury space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-gold-warm text-sm font-bold uppercase tracking-wider">
                  <Crown className="w-5 h-5 fill-current" />
                  <span>Founding 100 Lifetime Privilege</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-gold-warm text-slate-abyss text-xs font-black">
                  SLOT #{member?.memberNumber || '42'} / 100
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-thai-serif font-bold text-parchment-cream">
                  ส่วนลด 20% สำหรับสินค้า Physical Merch ตลอดชีพ
                </h3>
                <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed max-w-2xl">
                  ในฐานะผู้ร่วมก่อตั้ง คุณได้รับสิทธิ์ส่วนลด 20% สำหรับหนังสือรูปเล่ม เสื้อยืดพรีเมียม Deep Emerald, หมวก Minimalist Soul Cap,
                  และของที่ระลึกทุกชิ้นในร้านค้า
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
                    type="button"
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

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Member, NewsSection } from '@/types';
import {
  Lock,
  Crown,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  ShieldAlert,
  ExternalLink,
  Film,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface NewsContentGateProps {
  sections: NewsSection[];
  news: {
    id: string;
    korNo: string;
    slug: string;
    title: string;
    topicLead?: string;
    subcategory: string;
    excerpt: string;
    image?: string | null;
    date: string;
    dateFormatted: string;
    source?: string | null;
    video?: string | null;
  };
  initialMember?: Member | null;
}

export function NewsContentGate({
  sections,
  news,
  initialMember = null,
}: NewsContentGateProps) {
  const { member: clientMember, isLoggedIn: clientIsLoggedIn } = useAuth();

  // Prefer client auth state if available, fallback to initial server session
  const member = clientMember || initialMember;
  const isLoggedIn = clientIsLoggedIn || !!member;

  const isDeepdive = news.subcategory?.toLowerCase().includes('deepdive');

  // Access rules:
  // 1. If not logged in -> cannot read any full news
  // 2. If logged in and NOT deepdive -> Free Tier and above can read
  // 3. If logged in and IS deepdive -> only supporter_tier_2 or founding_tier_3 can read
  const canAccess = isLoggedIn && member
    ? isDeepdive
      ? member.tier === 'supporter_tier_2' || member.tier === 'founding_tier_3'
      : true
    : false;

  const isFreeTierOnDeepdive = isLoggedIn && member?.tier === 'free_tier_1' && isDeepdive;

  // First section teaser text for preview curtain
  const teaserSection = sections[0];
  const teaserSnippet = teaserSection?.content
    ? teaserSection.content.slice(0, 320) + '...'
    : news.excerpt;

  return (
    <div className="space-y-16">
      {/* ------------------------------------------------------------------ */}
      {/* ACCESS GRANTED: Full Content Render                                */}
      {/* ------------------------------------------------------------------ */}
      {canAccess ? (
        <>
          {/* Unlocked Access Status Badge */}
          <div className="p-4 rounded-2xl bg-[#0E261A] border border-gold-warm/40 text-xs text-parchment-cream flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
              <span className="font-semibold text-gold-light">
                สิทธิ์การอ่าน: ปลดล็อกฉบับสมบูรณ์
              </span>
              <span className="text-white/20">•</span>
              <span className="text-parchment-muted">
                Member #{member?.memberNumber} (
                {member?.tier === 'founding_tier_3'
                  ? 'Founding 100 Lifetime'
                  : member?.tier === 'supporter_tier_2'
                  ? 'Supporter Member'
                  : 'Free Member'}
                )
              </span>
            </div>

            <span className="text-[11px] text-emerald-300 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ยืนยันสิทธิ์แล้ว</span>
            </span>
          </div>

          {/* Loop over available content sections (สูงสุด 5 ส่วน) */}
          {sections.map((section) => (
            <div key={section.index} className="space-y-8 animate-fade-in">
              {/* Requirement 3: Topic Lead (Original Column D Title) placed before Content 2 */}
              {section.index === 2 && news.topicLead && (
                <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#0E261A] via-[#0B1E14] to-[#0A1811] border border-gold-warm/40 shadow-xl my-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gold-warm uppercase tracking-wider font-thai">
                    <Compass className="w-4 h-4 text-gold-warm" />
                    <span>ประเด็นวิเคราะห์เจาะลึก (Core Strategic Focus)</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-thai-serif font-black text-parchment-cream leading-snug">
                    {news.topicLead}
                  </h3>
                </div>
              )}

              {/* Section Header Indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-border/40">
                <span className="px-3 py-1 rounded-lg bg-emerald-card text-gold-light text-xs font-bold font-mono border border-gold-warm/30">
                  ส่วนที่ {section.index} / {sections.length}
                </span>

                <span className="text-xs text-parchment-muted/60 font-light font-mono">
                  {news.korNo}
                </span>
              </div>

              {/* Section Image (if Image 2..5 is available and distinct) */}
              {section.image && section.index > 1 && section.image !== news.image && (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-border/70 shadow-2xl bg-black/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={section.image}
                    alt={`ภาพประกอบส่วนที่ ${section.index}: ${news.title}`}
                    loading="lazy"
                    className="w-full max-h-[500px] object-cover"
                  />
                  <div className="p-3 bg-black/75 text-[11px] text-parchment-muted italic text-center font-light">
                    ภาพประกอบข่าว • ส่วนที่ {section.index}
                  </div>
                </div>
              )}

              {/* Markdown Content Rendering */}
              <div className="text-base sm:text-lg leading-relaxed font-light text-parchment-cream/95 font-thai">
                <MarkdownRenderer content={section.content} />
              </div>

              {/* Requirement 4: บรรทัดจบเนื้อหาแต่ละส่วนทุกครั้งเพื่อง่ายต่อการเข้าใจความต่อเนื่อง */}
              <div className="pt-8 pb-4 relative flex items-center justify-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gold-warm/40 to-transparent" />
                <div className="absolute px-4 py-1 rounded-full bg-[#050D09] border border-gold-warm/30 text-gold-warm/90 text-[11px] font-thai font-medium flex items-center gap-2 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-warm" />
                  <span>
                    จบเนื้อหาส่วนที่ {section.index}
                    {section.index < sections.length ? ` • ต่อส่วนที่ ${section.index + 1}` : ' (สิ้นสุดรายงาน)'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-warm" />
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        /* ------------------------------------------------------------------ */
        /* ACCESS GATED: Preview + VIP Lock Gate Card                         */
        /* ------------------------------------------------------------------ */
        <div className="space-y-10">
          {/* Teaser Preview Box (First Section Peek) */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-[#091711] border border-emerald-border/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-border/40 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-emerald-surface text-gold-light font-mono font-bold">
                ตัวอย่างเนื้อหา (Preview)
              </span>
              <span className="text-parchment-muted/70 font-mono">
                {news.korNo}
              </span>
            </div>

            <div className="text-base sm:text-lg text-parchment-cream/80 font-light leading-relaxed font-thai">
              <MarkdownRenderer content={teaserSnippet} />
            </div>

            {/* Gradient Fade-Out Curtain */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050D09] via-[#050D09]/90 to-transparent pointer-events-none rounded-b-3xl" />
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* GATE CARD: Distinct Message for Guest vs Free Member               */}
          {/* ------------------------------------------------------------------ */}
          {!isLoggedIn ? (
            /* Case 1: Guest (Not Logged In) */
            <div className="relative rounded-3xl bg-gradient-to-b from-[#132A1F] via-[#0B1A12] to-[#060F0A] border-2 border-gold-warm/50 p-8 sm:p-12 text-center space-y-6 shadow-[0_0_60px_rgba(217,169,79,0.15)] overflow-hidden">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-warm/15 border border-gold-warm flex items-center justify-center text-gold-warm shadow-gold-sm">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <div className="text-xs uppercase tracking-widest text-gold-warm font-cinzel font-semibold">
                  MEMBER ACCESS REQUIRED
                </div>
                <h2 className="text-2xl sm:text-3xl font-thai-serif font-black text-parchment-cream">
                  กรุณาเข้าสู่ระบบเพื่ออ่านเนื้อหาฉบับเต็ม
                </h2>
                <p className="text-sm text-parchment-muted leading-relaxed font-light">
                  เนื้อหาบทวิเคราะห์ข่าวสารเปิดให้อ่านสำหรับสมาชิก The Safe Soul
                  โดยสมาชิกทั่วไป (Free Tier) สามารถเข้าสู่ระบบเพื่ออ่านเนื้อหาข่าวสารได้ทันที
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href={`/login`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm transition hover:scale-105 active:scale-95"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>เข้าสู่ระบบ / ลงทะเบียนรับลำดับสมาชิก</span>
                </Link>

                <Link
                  href="/news"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-emerald-border text-parchment-cream text-xs font-semibold transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>กลับหน้ารวมข่าว</span>
                </Link>
              </div>

              <div className="text-[11px] text-parchment-muted/60 pt-2">
                ยังไม่มีบัญชี? ลงทะเบียนใช้เวลาไม่ถึง 1 นาที และรับลำดับ Member ทันที
              </div>
            </div>
          ) : (
            /* Case 2: Free Tier Member on Deepdive Article */
            <div className="relative rounded-3xl bg-gradient-to-b from-[#1C2C1D] via-[#0E1E14] to-[#07110B] border-2 border-gold-warm/60 p-8 sm:p-12 text-center space-y-6 shadow-[0_0_60px_rgba(217,169,79,0.2)] overflow-hidden">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold-warm/25 to-slate-abyss border border-gold-warm flex items-center justify-center text-gold-warm shadow-gold-sm">
                <Crown className="w-8 h-8 fill-current" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-warm/20 text-gold-light border border-gold-warm/40 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
                  <span>หมวด DEEPDIVE พิเศษเฉพาะสมาชิกสนับสนุน</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-thai-serif font-black text-parchment-cream">
                  บทวิเคราะห์เฉพาะสมาชิกรายเดือน & ตลอดชีพ
                </h2>

                <p className="text-sm text-parchment-muted leading-relaxed font-light">
                  คุณเข้าสู่ระบบในฐานะ <strong className="text-emerald-300">Free Member (Member #{member?.memberNumber})</strong> เรียบร้อยแล้ว แต่เนื่องจากบทวิเคราะห์เชิงลึกหมวด Deepdive นี้สงวนสิทธิ์สำหรับสมาชิกผู้สนับสนุนรายเดือน (Supporter ฿199) และสมาชิกตลอดชีพ (Founding 100)
                </p>
              </div>

              <div className="p-5 max-w-lg mx-auto rounded-2xl bg-black/40 border border-emerald-border/60 text-xs text-parchment-muted space-y-2 text-left">
                <div className="font-semibold text-gold-light flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>สิทธิประโยชน์เมื่ออัปเกรดเป็น Supporter หรือ Founding 100:</span>
                </div>
                <ul className="space-y-1.5 pl-6 list-disc text-parchment-muted/90">
                  <li>ปลดล็อกการอ่านบทวิเคราะห์เชิงลึก Deepdive ทุกรายการไม่จำกัด</li>
                  <li>เข้าถึงคลังปัญญา 35 บทความฉบับ Deep Mode และเสียงบรรยาย High-Fidelity</li>
                  <li>รับสิทธิ์เข้าร่วมกลุ่มเสวนาพิเศษ Telegram & Discord</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm transition hover:scale-105 active:scale-95"
                >
                  <Crown className="w-4 h-4 fill-current" />
                  <span>อัปเกรดระดับสมาชิก เพื่ออ่าน Deepdive</span>
                </Link>

                <Link
                  href="/news"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-emerald-border text-parchment-cream text-xs font-semibold transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>กลับหน้ารวมข่าว</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

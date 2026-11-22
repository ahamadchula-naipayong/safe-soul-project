'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAudio, normalizeAudioUrl } from '@/context/AudioContext';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import {
  checkOceanArticleAccess,
  checkOceanAudioAccess,
  getVesselDisplayName,
} from '@/lib/oceanAccess';
import { ArticleStatus } from '@/types';
import {
  Lock,
  Crown,
  Sparkles,
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  Anchor,
  Clock,
  Headphones,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';

interface OceanContentGateProps {
  content: string;
  excerpt: string;
  archipelagoSlug?: string;
  archipelagoNumber: number;
  archipelagoTitleTh: string;
  archipelagoTitleEn: string;
  chapterNumber: number;
  chapterTitle: string;
  isUnlocked: boolean;
  status: ArticleStatus;
  publishedAt?: string;
  audioUrl?: string;
  audioDuration?: string;
  coverImage?: string;
}

export function OceanContentGate({
  content,
  excerpt,
  archipelagoSlug,
  archipelagoNumber,
  archipelagoTitleTh,
  archipelagoTitleEn,
  chapterNumber,
  chapterTitle,
  isUnlocked,
  status,
  publishedAt,
  audioUrl,
  audioDuration,
  coverImage,
}: OceanContentGateProps) {
  const { member, isLoggedIn } = useAuth();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudio();

  const access = checkOceanArticleAccess({
    realm: 'deep',
    archipelagoNumber,
    chapterNumber,
    isUnlocked,
    status,
    publishedAt,
    member,
  });

  const audioAccess = checkOceanAudioAccess({
    realm: 'deep',
    archipelagoNumber,
    chapterNumber,
    isUnlocked,
    status,
    publishedAt,
    member,
  });

  const trackId = `ocean-${archipelagoSlug || archipelagoNumber}-${chapterNumber}`;
  const canonicalAudioUrl = normalizeAudioUrl(audioUrl, chapterNumber, trackId);
  const isCurrentTrack =
    !!currentTrack &&
    (currentTrack.audioUrl === canonicalAudioUrl || currentTrack.id === trackId);

  const handlePlayDeepOceanAudio = () => {
    if (!audioAccess.canAccess || !canonicalAudioUrl) return;
    if (isCurrentTrack && currentTrack?.audioUrl === canonicalAudioUrl && isPlaying) {
      pauseTrack();
    } else {
      playTrack({
        id: trackId,
        title: `${chapterTitle} (${archipelagoTitleEn})`,
        seriesTitle: `ทะเลน้ำลึก • หมู่เกาะที่ ${archipelagoNumber}: ${archipelagoTitleTh}`,
        chapterNumber,
        audioUrl: canonicalAudioUrl,
        duration: audioDuration || '18 นาที',
        coverImage,
      });
    }
  };

  const teaserSnippet = content ? content.slice(0, 380) + '...' : excerpt;

  const renderDeepOceanAudioBar = () => {
    if (!audioUrl) return null;

    return (
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0A1F17] via-[#0E291E] to-[#081811] border border-cyan-400/35 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/90 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
              {audioAccess.canAccess ? (
                <Headphones className="w-6 h-6 text-cyan-300" />
              ) : (
                <Lock className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/30 font-bold">
                  Deep Ocean Audio Masterclass
                </span>
                <span className="text-xs font-mono text-gold-warm">
                  หมู่เกาะที่ {archipelagoNumber} • บทที่ {chapterNumber}/5
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-parchment-cream">
                เสียงบรรยายประจำบท: {chapterTitle}
              </h3>
              <p className="text-xs text-parchment-muted">
                {audioAccess.canAccess
                  ? `ไฟล์เสียง Normalized Studio Master (${audioDuration || '18 นาที'}) • เปิดฟังควบคู่กับการอ่านบทความได้ทันที`
                  : `เสียงพอดแคสต์ทะเลน้ำลึกสงวนสิทธิ์ตามแพ็กเกจ (${audioAccess.requiredVesselName || 'เรือประมงน้ำลึก / Founding 100'})`}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {audioAccess.canAccess ? (
              <button
                type="button"
                onClick={handlePlayDeepOceanAudio}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition shadow-gold-sm cursor-pointer ${
                  isCurrentTrack && isPlaying
                    ? 'bg-emerald-500 text-slate-abyss'
                    : 'gold-bevel-button text-slate-abyss hover:scale-105'
                }`}
              >
                {isCurrentTrack && isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>กำลังเล่นเสียงบทนี้ (หยุดชั่วคราว)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>เปิดฟังเสียงบรรยายบทนี้</span>
                  </>
                )}
              </button>
            ) : (
              <Link
                href={audioAccess.actionHref || '/pricing'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold text-xs transition"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>{audioAccess.actionLabel || 'อัปเกรดแพ็กเกจเพื่อฟังเสียงน้ำลึก'}</span>
              </Link>
            )}
          </div>
        </div>

        {isCurrentTrack && (
          <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs text-cyan-200">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>เครื่องเล่นเสียงด้านล่างหน้าจอเปิดทำงานอยู่ — สามารถเลื่อนอ่านบทความพร้อมฟังเสียงได้</span>
            </span>
            <span className="font-mono text-[11px] text-gold-light">
              {archipelagoTitleEn} #{chapterNumber}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (access.canAccess) {
    return (
      <div className="space-y-10">
        {/* Deep Ocean Audio Suite Player Bar */}
        {renderDeepOceanAudioBar()}

        {/* Unlocked Vessel Status & Release Schedule Banner */}
        <div className="p-4 rounded-2xl bg-[#0E261A] border border-gold-warm/40 text-xs text-parchment-cream flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
            <span className="font-semibold text-gold-light">
              สิทธิ์การเดินเรือ: {access.badgeText}
            </span>
            {member && (
              <>
                <span className="text-white/20">•</span>
                <span className="text-parchment-muted">
                  Member #{member.memberNumber} ({getVesselDisplayName(access.effectiveTier)})
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2.5 py-0.5 rounded-lg bg-black/50 border border-white/10 text-gold-light">
              กำหนดเผยแพร่: {access.scheduledText}
            </span>
            <span className="text-emerald-300 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>เข้าถึงฉบับสมบูรณ์</span>
            </span>
          </div>
        </div>

        {/* Full Markdown Article Content */}
        <article className="prose prose-invert max-w-none text-base sm:text-lg leading-relaxed font-light text-parchment-cream/95 font-thai">
          <MarkdownRenderer content={content} />
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Deep Ocean Audio Suite Player Bar (Shows lock/unlock state per package) */}
      {renderDeepOceanAudioBar()}

      {/* Teaser Preview Curtain */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-[#091711] border border-emerald-border/80 shadow-2xl space-y-4 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-border/40 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-emerald-surface text-gold-light font-mono font-bold">
            ตัวอย่างเนื้อหาทะเลน้ำลึก (Preview)
          </span>
          <span className="text-parchment-muted/70 font-mono">
            หมู่เกาะ {archipelagoNumber} • เกาะย่อยที่ {chapterNumber}
          </span>
        </div>

        <div className="text-base sm:text-lg text-parchment-cream/80 font-light leading-relaxed font-thai">
          <MarkdownRenderer content={teaserSnippet} />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050D09] via-[#050D09]/95 to-transparent pointer-events-none rounded-b-3xl" />
      </div>

      {/* Maritime Gate Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#132A1F] via-[#0B1A12] to-[#060F0A] border-2 border-gold-warm/50 p-8 sm:p-12 text-center space-y-6 shadow-[0_0_60px_rgba(217,169,79,0.18)] overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-warm/15 border border-gold-warm flex items-center justify-center text-gold-warm shadow-gold-sm">
          {access.lockReason === 'pending_slip' ? (
            <Clock className="w-8 h-8" />
          ) : !isLoggedIn ? (
            <Lock className="w-8 h-8" />
          ) : (
            <Crown className="w-8 h-8 fill-current" />
          )}
        </div>

        <div className="space-y-2.5 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-warm/20 text-gold-light border border-gold-warm/40 text-xs font-bold uppercase tracking-wider">
            <Anchor className="w-3.5 h-3.5 text-gold-warm" />
            <span>{access.badgeText}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-thai-serif font-black text-parchment-cream">
            {access.lockReason === 'login_required'
              ? 'กรุณาขึ้นเรือ (เข้าสู่ระบบ) เพื่ออ่านเนื้อหาทะเลน้ำลึก'
              : access.lockReason === 'pending_slip'
              ? 'สลิปการโอนเงินของคุณอยู่ระหว่างรอแอดมินตรวจสอบ'
              : access.lockReason === 'weekly_release_wait'
              ? `บทเรียนนี้จะเปิดเผยแพร่ใน${access.scheduledText}`
              : 'อัปเกรดระดับเรือเพื่อดำดิ่งสู่เนื้อหาทะเลน้ำลึกฉบับเต็ม'}
          </h2>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-black/55 border border-gold-warm/35 text-xs text-gold-light font-semibold">
            <Clock className="w-3.5 h-3.5 text-gold-warm shrink-0" />
            <span>ตารางเผยแพร่บทนี้: {access.scheduledText}</span>
          </div>

          <p className="text-sm text-parchment-muted leading-relaxed font-light">
            {access.lockReason === 'login_required' ? (
              <>
                บทความ <strong>&ldquo;{chapterTitle}&rdquo;</strong> ({archipelagoTitleEn} • {archipelagoTitleTh}) อยู่ในเขต{' '}
                <strong className="text-cyan-300">ทะเลน้ำลึก</strong> (กำหนดเผยแพร่:{' '}
                <strong className="text-gold-light">{access.scheduledText}</strong>) — สมัครสมาชิกเรือประมงน้ำตื้น (ฟรี) เพื่ออ่านบทที่ 1 ของหมู่เกาะที่ 1–7 เมื่อถึงกำหนดเผยแพร่ หรือเลือกเรือประมงน้ำลึก / Founding 100 เพื่อปลดล็อกเนื้อหาเชิงลึก
              </>
            ) : access.lockReason === 'pending_slip' ? (
              <>
                ทีมงานได้รับหลักฐานการโอนเงินของ <strong>Member #{member?.memberNumber}</strong> แล้ว และกำลังตรวจสอบความถูกต้อง ในระหว่างนี้คุณสามารถอ่านทะเลน้ำตื้นครบ 7 เกาะได้ทันที
              </>
            ) : access.lockReason === 'weekly_release_wait' ? (
              <>
                บทความนี้มีกำหนดเปิดเผยแพร่ใน <strong className="text-gold-light">{access.scheduledText}</strong> สำหรับสมาชิก{' '}
                <strong className="text-cyan-300">{getVesselDisplayName(access.effectiveTier)}</strong>{' '}
                หากต้องการเปิดอ่านล่วงหน้าครบทั้ง 10 หมู่เกาะ (50 บท) ทันทีโดยไม่ต้องรอตารางเวลาเผยแพร่รายสัปดาห์ สามารถอัปเกรดเป็น{' '}
                <strong className="text-gold-light">เรือสำราญทุกมรสุม (Founding 100 ตลอดชีพ)</strong>
              </>
            ) : (
              <>
                ขณะนี้คุณเดินเรือในระดับ <strong className="text-emerald-300">{getVesselDisplayName(access.effectiveTier)}</strong> — เนื้อหาเกาะย่อยที่ {chapterNumber} นี้มีกำหนดเผยแพร่ใน{' '}
                <strong className="text-gold-light">{access.scheduledText}</strong> และสงวนสิทธิ์สำหรับผู้ถือตั๋ว{' '}
                <strong className="text-gold-light">{access.requiredVesselName}</strong>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
          <Link
            href={access.actionHref || '/pricing'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm transition hover:scale-105 active:scale-95"
          >
            {!isLoggedIn ? <UserCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{access.actionLabel || 'ดูแผนระดับเรือสมาชิก'}</span>
          </Link>

          <Link
            href="/journey"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-emerald-border text-parchment-cream text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้ารวมบทความ Safe for Journey</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

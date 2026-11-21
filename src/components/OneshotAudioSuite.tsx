'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Play,
  Pause,
  Lock,
  Volume2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAudio, AudioTrack, normalizeAudioUrl } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { checkOceanAudioAccess } from '@/lib/oceanAccess';
import { OneshotChapter } from '@/types';

interface OneshotAudioSuiteProps {
  chapter: OneshotChapter;
  className?: string;
}

export function OneshotAudioSuite({
  chapter,
  className = '',
}: OneshotAudioSuiteProps) {
  const { member } = useAuth();
  const { playTrack, pauseTrack, currentTrack, isPlaying } = useAudio();
  const [showTierModal, setShowTierModal] = useState(false);

  const num = chapter.chapterNumber;
  const trackId = chapter.id || `oneshot-${num}`;
  const fullDur = chapter.audio?.full?.duration || chapter.audioDuration || '16:30';
  const fullUrl = normalizeAudioUrl(
    chapter.audio?.full?.url || chapter.audioUrl || `/audio/oneshot/island${num}-full.mp3`,
    num,
    trackId
  );

  const isCurrentTrack =
    !!currentTrack &&
    (currentTrack.audioUrl === fullUrl || currentTrack.id === trackId);

  const audioAccess = checkOceanAudioAccess({
    realm: 'shallow',
    chapterNumber: num,
    isUnlocked: true,
    status: chapter.status || 'published',
    publishedAt: chapter.publishedAt,
    member,
  });
  const hasAudioAccess = audioAccess.canAccess;

  const fullTrack: AudioTrack = {
    id: trackId,
    title: `${chapter.titleEn}: ${chapter.titleTh}`,
    seriesTitle: `ทะเลน้ำตื้น (S.A.F.E.) • เกาะที่ ${num}/7`,
    chapterNumber: num,
    audioUrl: fullUrl,
    duration: fullDur,
    coverImage: chapter.image,
  };

  const handlePlayAudio = () => {
    if (!hasAudioAccess) {
      setShowTierModal(true);
      return;
    }

    if (isCurrentTrack && currentTrack?.audioUrl === fullUrl && isPlaying) {
      pauseTrack();
    } else {
      playTrack(fullTrack);
    }
  };

  return (
    <>
      <div
        className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0A1F17] via-[#0E291E] to-[#081811] border border-gold-warm/40 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-4 print:hidden ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/90 border border-gold-warm/40 flex items-center justify-center text-gold-warm shrink-0 shadow-inner">
              {hasAudioAccess ? (
                <Headphones className="w-6 h-6 text-gold-warm" />
              ) : (
                <Lock className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-warm/20 text-gold-light border border-gold-warm/40 font-bold">
                  Shallow Waters Audio Masterclass
                </span>
                <span className="text-xs font-mono text-emerald-300">
                  ทะเลน้ำตื้น • เกาะที่ {num}/7
                </span>
                {hasAudioAccess && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{audioAccess.badgeText}</span>
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-parchment-cream">
                เสียงบรรยายประจำบท (ฉบับสมบูรณ์): {chapter.titleEn}
              </h3>
              <p className="text-xs text-parchment-muted">
                {hasAudioAccess
                  ? `ไฟล์เสียง Normalized Studio Master ฉบับเต็ม (${fullDur} นาที) • เปิดฟังควบคู่กับการอ่านบทความได้ทันที`
                  : 'เข้าสู่ระบบหรือสมัครสมาชิกฟรี (เรือประมงน้ำตื้น) เพื่อปลดล็อกเสียงบรรยายเกาะที่ 4–7'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {hasAudioAccess ? (
              <button
                type="button"
                onClick={handlePlayAudio}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-gold-sm cursor-pointer ${
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
              <button
                type="button"
                onClick={() => setShowTierModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold text-xs transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>เข้าสู่ระบบฟรีเพื่อฟังเสียงบทนี้</span>
              </button>
            )}
          </div>
        </div>

        {isCurrentTrack && (
          <div className="pt-3 border-t border-gold-warm/20 flex items-center justify-between text-xs text-gold-light">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>เครื่องเล่นเสียงด้านล่างหน้าจอเปิดทำงานอยู่ — สามารถเลื่อนอ่านบทความพร้อมฟังเสียงได้</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-300">
              Island #{num} • {fullDur}
            </span>
          </div>
        )}
      </div>

      {/* Tier Gate Modal for Islands 4-7 when not logged in */}
      {showTierModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#132B20] to-[#0A1711] border-2 border-gold-warm/60 p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <button
              type="button"
              onClick={() => setShowTierModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/80 text-parchment-muted hover:text-white transition cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-warm/20 border border-gold-warm/50 flex items-center justify-center text-gold-warm shadow-gold-sm">
              <Headphones className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-thai-serif font-black text-parchment-cream">
                เข้าสู่ระบบฟรีเพื่อฟังเสียงครบ 7 เกาะน้ำตื้น
              </h3>
              <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                ผู้มาเยือนทั่วไปสามารถทดลองฟังเสียงบรรยายได้ฟรีใน{' '}
                <strong className="text-gold-light">เกาะที่ 1–3</strong> สำหรับ{' '}
                <strong className="text-emerald-300">
                  เกาะที่ {num}: {chapter.titleEn}
                </strong>{' '}
                เพียงลงทะเบียนหรือเข้าสู่ระบบสมาชิกฟรี (เรือประมงน้ำตื้น) ก็สามารถเปิดฟังฉบับเต็มได้ทันทีโดยไม่มีค่าใช้จ่าย
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/login"
                onClick={() => setShowTierModal(false)}
                className="w-full py-3 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm transition text-center"
              >
                เข้าสู่ระบบ / สมัครสมาชิกฟรี
              </Link>
              <button
                type="button"
                onClick={() => setShowTierModal(false)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-parchment-cream text-xs font-semibold transition cursor-pointer"
              >
                ไว้คราวหลัง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

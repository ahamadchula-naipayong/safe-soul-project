'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Play,
  Pause,
  Sparkles,
  Lock,
  Volume2,
  X,
  Radio,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useAudio, AudioTrack } from '@/context/AudioContext';
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

  const audioInfo = chapter.audio;
  const num = chapter.chapterNumber;

  const audioBase = (process.env.NEXT_PUBLIC_AUDIO_BASE_URL || '').replace(/\/+$/, '');
  const part1Url = `${audioBase}${audioInfo?.parts?.[0]?.url || `/audio/oneshot/island${num}-part1.mp3`}`;
  const part1Dur = audioInfo?.parts?.[0]?.duration || '07:00';

  const part2Url = `${audioBase}${audioInfo?.parts?.[1]?.url || `/audio/oneshot/island${num}-part2.mp3`}`;
  const part2Dur = audioInfo?.parts?.[1]?.duration || '09:00';

  const fullUrl = part1Url;
  const fullDur = audioInfo?.full?.duration || '16:00';

  const fullTrackId = `oneshot-${num}-full`;
  const part1TrackId = `oneshot-${num}-part1`;
  const part2TrackId = `oneshot-${num}-part2`;

  const isFullPlaying = currentTrack?.id === fullTrackId && isPlaying;
  const isPart1Playing = currentTrack?.id === part1TrackId && isPlaying;
  const isPart2Playing = currentTrack?.id === part2TrackId && isPlaying;

  const audioAccess = checkOceanAudioAccess({
    realm: 'shallow',
    chapterNumber: num,
    isUnlocked: true,
    status: chapter.status || 'published',
    publishedAt: chapter.publishedAt,
    member,
  });
  const hasAudioAccess = audioAccess.canAccess;

  // Construct Part 2 track object (so Part 1 can auto-advance to Part 2)
  const part2Track: AudioTrack = {
    id: part2TrackId,
    title: `${chapter.titleEn} (Part 2)`,
    seriesTitle: 'ทะเลน้ำตื้น (S.A.F.E.)',
    chapterNumber: num,
    partNumber: 2,
    partTitle: 'Part 2/2',
    audioUrl: part2Url,
    duration: part2Dur,
    coverImage: chapter.image,
  };

  // Part 1 with nextTrack linked to Part 2 for auto-advancing
  const part1Track: AudioTrack = {
    id: part1TrackId,
    title: `${chapter.titleEn} (Part 1)`,
    seriesTitle: 'ทะเลน้ำตื้น (S.A.F.E.)',
    chapterNumber: num,
    partNumber: 1,
    partTitle: 'Part 1/2 • ต่อเนื่อง',
    nextTrack: part2Track,
    audioUrl: part1Url,
    duration: part1Dur,
    coverImage: chapter.image,
  };

  const fullTrack: AudioTrack = {
    id: fullTrackId,
    title: `${chapter.titleEn} (ฉบับสมบูรณ์ Part 1 → 2)`,
    seriesTitle: 'ทะเลน้ำตื้น (S.A.F.E.)',
    chapterNumber: num,
    partNumber: 1,
    partTitle: 'Full Master • ต่อเนื่อง Part 1→2',
    nextTrack: part2Track,
    audioUrl: fullUrl,
    duration: fullDur,
    coverImage: chapter.image,
  };

  const handlePlaySelected = (track: AudioTrack) => {
    if (!hasAudioAccess) {
      setShowTierModal(true);
      return;
    }

    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  return (
    <div
      className={`rounded-3xl bg-gradient-to-b from-[#132B20]/90 via-[#0B1A13]/95 to-black/90 border border-gold-warm/40 p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-5 ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-gold-warm/15 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pb-4 border-b border-gold-warm/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-warm/15 border border-gold-warm/40 text-gold-light text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-gold-warm animate-pulse" />
            <span>FITRAH SOUNDSCAPE • พอดแคสต์เสียงบรรยายประจำเกาะ</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-thai-serif font-black text-parchment-cream">
            วิทยุคลื่นปัญญา: {chapter.titleEn}
          </h3>
          <p className="text-xs text-parchment-muted">
            บันทึกเสียงคุณภาพสตูดิโอ แยกออกเป็น 2 ช่วง หรือเลือกเปิดฟังแบบต่อไฟล์ฉบับเต็มต่อเนื่อง
          </p>
        </div>

        {/* Tier status indicator */}
        <div className="shrink-0">
          {hasAudioAccess ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{audioAccess.badgeText}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowTierModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>เข้าสู่ระบบฟรีเพื่อฟังเกาะที่ 4–7</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Play Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10">
        {/* OPTION 1: FULL CONTINUOUS AUDIO */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handlePlaySelected(fullTrack)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handlePlaySelected(fullTrack);
          }}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
            isFullPlaying
              ? 'bg-gold-warm/20 border-gold-light ring-2 ring-gold-warm shadow-[0_0_25px_rgba(217,169,79,0.25)]'
              : 'bg-black/50 hover:bg-black/75 border-gold-warm/30 hover:border-gold-warm/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-warm text-slate-abyss">
              แนะนำ • ฉบับเต็ม
            </span>
            <span className="text-xs font-mono text-gold-light font-bold">
              {fullDur}
            </span>
          </div>

          <div>
            <div className="text-sm font-bold text-parchment-cream">
              เล่นฉบับสมบูรณ์ (Part 1 + 2)
            </div>
            <div className="text-[11px] text-parchment-muted/80 mt-0.5">
              ไฟล์เชื่อมต่อเสียงสมบูรณ์แบบ ฟังยาวต่อเนื่องไม่มีสะดุด
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
            <span className="text-gold-light font-medium flex items-center gap-1">
              {isFullPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current text-gold-warm" />
                  <span>กำลังเล่นเสียง...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-gold-warm" />
                  <span>กดฟังฉบับเต็ม</span>
                </>
              )}
            </span>
            {isFullPlaying && (
              <span className="flex items-end gap-0.5 h-3.5">
                <span className="w-1 bg-gold-warm animate-pulse h-2" />
                <span className="w-1 bg-gold-warm animate-pulse h-3.5" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-gold-warm animate-pulse h-2.5" style={{ animationDelay: '300ms' }} />
              </span>
            )}
          </div>
        </div>

        {/* OPTION 2: PART 1 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handlePlaySelected(part1Track)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handlePlaySelected(part1Track);
          }}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
            isPart1Playing
              ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.2)]'
              : 'bg-black/50 hover:bg-black/75 border-white/10 hover:border-emerald-400/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Part 1 of 2
            </span>
            <span className="text-xs font-mono text-emerald-300 font-bold">
              {part1Dur}
            </span>
          </div>

          <div>
            <div className="text-sm font-bold text-parchment-cream">
              ช่วงที่ 1: บทนำ & มิติแห่งตน
            </div>
            <div className="text-[11px] text-parchment-muted/80 mt-0.5">
              ปูพื้นฐานแนวคิดและการระวังตน (จบแล้วจะเล่น Part 2 ให้อัตโนมัติ)
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
            <span className="text-emerald-300 font-medium flex items-center gap-1">
              {isPart1Playing ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current text-emerald-400" />
                  <span>กำลังเล่น Part 1...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                  <span>กดฟัง Part 1 (ออโต้ต่อ)</span>
                </>
              )}
            </span>
            {isPart1Playing && (
              <span className="flex items-end gap-0.5 h-3.5">
                <span className="w-1 bg-emerald-400 animate-pulse h-2" />
                <span className="w-1 bg-emerald-400 animate-pulse h-3.5" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-emerald-400 animate-pulse h-2.5" style={{ animationDelay: '300ms' }} />
              </span>
            )}
          </div>
        </div>

        {/* OPTION 3: PART 2 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handlePlaySelected(part2Track)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handlePlaySelected(part2Track);
          }}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
            isPart2Playing
              ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.2)]'
              : 'bg-black/50 hover:bg-black/75 border-white/10 hover:border-cyan-400/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Part 2 of 2
            </span>
            <span className="text-xs font-mono text-cyan-300 font-bold">
              {part2Dur}
            </span>
          </div>

          <div>
            <div className="text-sm font-bold text-parchment-cream">
              ช่วงที่ 2: การตื่นรู้, ศรัทธา & จริยธรรม
            </div>
            <div className="text-[11px] text-parchment-muted/80 mt-0.5">
              เจาะลึกสัจธรรม ภาคปฏิบัติ และบทสรุปส่งท้าย
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
            <span className="text-cyan-300 font-medium flex items-center gap-1">
              {isPart2Playing ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current text-cyan-400" />
                  <span>กำลังเล่น Part 2...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
                  <span>กดฟัง Part 2</span>
                </>
              )}
            </span>
            {isPart2Playing && (
              <span className="flex items-end gap-0.5 h-3.5">
                <span className="w-1 bg-cyan-400 animate-pulse h-2" />
                <span className="w-1 bg-cyan-400 animate-pulse h-3.5" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-cyan-400 animate-pulse h-2.5" style={{ animationDelay: '300ms' }} />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Audio Tier Gate Modal */}
      {showTierModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#132B20] to-[#0A1711] border-2 border-gold-warm/60 p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <button
              type="button"
              onClick={() => setShowTierModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/80 text-parchment-muted hover:text-white transition"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-warm/20 border border-gold-warm/50 flex items-center justify-center text-gold-warm shadow-gold-sm">
              <Headphones className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-thai-serif font-black text-parchment-cream">
                เข้าสู่ระบบฟรีเพื่อฟังเสียงครบ 7 เกาะน้ำตื้น
              </h4>
              <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                ผู้มาเยือนทั่วไปสามารถทดลองฟังเสียงพอดแคสต์ใน <strong className="text-gold-light">ทะเลน้ำตื้น 3 เกาะแรก (เกาะที่ 1–3)</strong> ได้ฟรีทันที! สำหรับ <strong className="text-emerald-300">เกาะที่ 4–7</strong> เพียงเข้าสู่ระบบหรือลงทะเบียนสมาชิกฟรี (<strong className="text-emerald-300">เรือประมงน้ำตื้น</strong>) ก็สามารถปลดล็อกฟังครบทั้ง 7 เกาะได้ทันที
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-gold-warm/30 text-xs text-parchment-muted text-left space-y-1">
              <div>• <strong className="text-gold-light">ไม่เข้าสู่ระบบ:</strong> ฟังฟรี ทะเลน้ำตื้น 3 เกาะแรก (เกาะที่ 1–3)</div>
              <div>• <strong className="text-emerald-300">สมาชิกฟรี (เรือประมงน้ำตื้น):</strong> ฟังครบทั้ง 7 เกาะทะเลน้ำตื้น</div>
              <div>• <strong className="text-cyan-300">Supporter / Founding 100:</strong> ฟังครบ 7 เกาะน้ำตื้น + ทะเลน้ำลึกตามสิทธิ์แพ็กเกจ</div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/login"
                onClick={() => setShowTierModal(false)}
                className="w-full py-3 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm transition text-center"
              >
                เข้าสู่ระบบ / สมัครสมาชิกฟรี (ฟังครบ 7 เกาะ)
              </Link>
              <button
                type="button"
                onClick={() => setShowTierModal(false)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-parchment-cream text-xs font-semibold transition"
              >
                ไว้คราวหลัง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

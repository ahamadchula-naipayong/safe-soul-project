'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Share2, Printer, Check, Copy, Headphones, Play, Pause, Lock, X } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { checkOceanAudioAccess } from '@/lib/oceanAccess';
import { ArticleStatus } from '@/types';

export interface ArticleAudioTrack {
  id: string;
  title: string;
  seriesTitle: string;
  chapterNumber: number;
  audioUrl?: string;
  duration?: string;
  coverImage?: string;
  realm?: 'shallow' | 'deep';
  archipelagoNumber?: number;
  isUnlocked?: boolean;
  status?: ArticleStatus;
  publishedAt?: string;
}

interface ArticleActionToolbarProps {
  title: string;
  description?: string;
  audioTrack?: ArticleAudioTrack;
  className?: string;
}

export function ArticleActionToolbar({
  title,
  description,
  audioTrack,
  className = '',
}: ArticleActionToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);

  const { member } = useAuth();
  const { playTrack, pauseTrack, currentTrack, isPlaying } = useAudio();

  const isCurrentPlaying = audioTrack && currentTrack?.id === audioTrack.id && isPlaying;

  const inferredRealm: 'shallow' | 'deep' =
    audioTrack?.realm || (audioTrack?.id?.startsWith('oneshot') ? 'shallow' : 'deep');

  const audioAccess = audioTrack
    ? checkOceanAudioAccess({
        realm: inferredRealm,
        archipelagoNumber: audioTrack.archipelagoNumber,
        chapterNumber: audioTrack.chapterNumber,
        isUnlocked: audioTrack.isUnlocked ?? inferredRealm === 'shallow',
        status: audioTrack.status || 'published',
        publishedAt: audioTrack.publishedAt,
        member,
      })
    : null;

  const hasAudioAccess = !!audioAccess?.canAccess;

  const handleAudioClick = () => {
    if (!audioTrack) return;

    if (!hasAudioAccess) {
      setShowTierModal(true);
      return;
    }

    if (isCurrentPlaying) {
      pauseTrack();
    } else {
      playTrack({
        id: audioTrack.id,
        title: audioTrack.title,
        seriesTitle: audioTrack.seriesTitle,
        chapterNumber: audioTrack.chapterNumber,
        audioUrl:
          audioTrack.audioUrl ||
          (inferredRealm === 'shallow'
            ? `/audio/oneshot/island${audioTrack.chapterNumber}-part1.mp3`
            : 'https://assets.mixkit.co/music/preview/mixkit-spirit-of-the-desert-1248.mp3'),
        duration: audioTrack.duration || '15:00',
        coverImage: audioTrack.coverImage,
      });
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url,
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.log('Share fallback to clipboard:', err);
        } else {
          return;
        }
      }
    }

    // Fallback: Copy link
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // In case clipboard fails
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2.5 print:hidden ${className}`}>
        {/* Audio Podcast Button (if audioTrack provided) */}
        {audioTrack && (
          <button
            type="button"
            onClick={handleAudioClick}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition shadow-sm group cursor-pointer ${
              isCurrentPlaying
                ? 'bg-gold-warm text-slate-abyss border-gold-light shadow-gold-sm'
                : 'bg-black/60 hover:bg-emerald-surface/90 border-white/15 hover:border-gold-warm/50 text-parchment-cream hover:text-gold-light'
            }`}
            title={audioAccess?.badgeText || 'ฟังเสียงบรรยายบทความ'}
          >
            {isCurrentPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>หยุดเสียง</span>
              </>
            ) : (
              <>
                <Headphones className="w-3.5 h-3.5 text-gold-warm group-hover:scale-110 transition-transform" />
                <span>ฟังเสียงพอดแคสต์</span>
                {!hasAudioAccess && <Lock className="w-3 h-3 text-parchment-muted/80 ml-0.5" />}
              </>
            )}
          </button>
        )}

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-emerald-surface/90 border border-white/15 hover:border-gold-warm/50 text-xs text-parchment-cream hover:text-gold-light transition shadow-sm group cursor-pointer"
          title="แชร์บทเรียนนี้สู่เครือข่ายสังคม หรือคัดลอกลิงก์"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">คัดลอกลิงก์แล้ว!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-gold-warm group-hover:scale-110 transition-transform" />
              <span>แชร์</span>
            </>
          )}
        </button>

        {/* Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-emerald-surface/90 border border-white/15 hover:border-gold-warm/50 text-xs text-parchment-cream hover:text-gold-light transition shadow-sm group cursor-pointer"
          title="สั่งพิมพ์บทเรียน หรือบันทึกเป็น PDF"
        >
          <Printer className="w-3.5 h-3.5 text-gold-warm group-hover:scale-110 transition-transform" />
          <span>พิมพ์ / PDF</span>
        </button>
      </div>

      {/* Tier Gate Modal for Audio */}
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
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/80 text-parchment-muted hover:text-white transition"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-warm/20 border border-gold-warm/50 flex items-center justify-center text-gold-warm shadow-gold-sm">
              <Headphones className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-thai-serif font-black text-parchment-cream">
                {inferredRealm === 'shallow'
                  ? 'เข้าสู่ระบบฟรีเพื่อฟังเสียงครบ 7 เกาะน้ำตื้น'
                  : 'สิทธิ์การฟังเสียงทะเลน้ำลึก'}
              </h3>
              <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                {inferredRealm === 'shallow' ? (
                  <>
                    ผู้ที่ไม่เข้าสู่ระบบสามารถเปิดฟังเสียงได้ใน{' '}
                    <strong className="text-gold-light">ทะเลน้ำตื้น 3 เกาะแรก (เกาะที่ 1–3)</strong>{' '}
                    ส่วนเกาะที่ 4–7 เพียงเข้าสู่ระบบหรือสมัครสมาชิกฟรี (
                    <strong className="text-emerald-300">เรือประมงน้ำตื้น</strong>)
                    ก็สามารถฟังเสียงได้ครบทั้ง 7 เกาะทันที
                  </>
                ) : (
                  <>
                    เสียงพอดแคสต์บรรยายใน <strong className="text-cyan-300">ทะเลน้ำลึก</strong>{' '}
                    เปิดให้ตามสิทธิ์แพ็กเกจของสมาชิก{' '}
                    <strong className="text-cyan-300">เรือประมงน้ำลึก (Supporter ฿199/ด)</strong> และ{' '}
                    <strong className="text-gold-light">
                      เรือสำราญทุกมรสุม (Founding 100 Lifetime)
                    </strong>
                  </>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-gold-warm/30 text-xs text-parchment-muted text-left space-y-1">
              <div>• <strong className="text-gold-light">ไม่เข้าสู่ระบบ:</strong> ฟังฟรี ทะเลน้ำตื้น 3 เกาะแรก (เกาะที่ 1–3)</div>
              <div>• <strong className="text-emerald-300">สมาชิกฟรี (เรือประมงน้ำตื้น):</strong> ฟังครบทั้ง 7 เกาะทะเลน้ำตื้น</div>
              <div>• <strong className="text-cyan-300">Supporter / Founding 100:</strong> ฟังครบ 7 เกาะน้ำตื้น + ทะเลน้ำลึกตามสิทธิ์แพ็กเกจ</div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={audioAccess?.actionHref || (inferredRealm === 'shallow' ? '/login' : '/pricing')}
                onClick={() => setShowTierModal(false)}
                className="w-full py-3 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm transition text-center"
              >
                {audioAccess?.actionLabel ||
                  (inferredRealm === 'shallow'
                    ? 'เข้าสู่ระบบ / สมัครสมาชิกฟรี'
                    : 'ดูแผนสมาชิกและอัปเกรด')}
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
    </>
  );
}

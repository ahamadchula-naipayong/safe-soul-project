'use client';

import React, { useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Radio,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

function formatSeconds(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function StickyAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    togglePlay,
    seekTo,
    setRate,
    setTrackVolume,
    closePlayer,
  } = useAudio();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  if (!currentTrack) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setTrackVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setTrackVolume(0);
      setIsMuted(true);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setRate(nextRate);
  };

  const seekForward10 = () => seekTo(Math.min(currentTime + 10, duration || currentTime + 10));
  const seekBackward10 = () => seekTo(Math.max(currentTime - 10, 0));

  return (
    <aside
      aria-label="Audio Player"
      className="fixed bottom-0 left-0 right-0 z-40 w-full max-w-[100vw] overflow-hidden pointer-events-none"
    >
      <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-2 sm:pb-3 pointer-events-auto">
        <div className="w-full max-w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-dark via-emerald-card to-slate-dark border border-gold-warm/45 shadow-2xl backdrop-blur-xl px-2.5 py-2 sm:px-4 sm:py-2.5 text-parchment-cream">
          {/* Ultra-compact Progress Scrubber Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 w-full min-w-0">
            <span className="text-[10px] font-mono text-parchment-muted tabular-nums shrink-0 w-8 sm:w-9 text-right">
              {formatSeconds(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              aria-label="แถบเลื่อนเวลาเสียง"
              className="flex-1 min-w-0 h-1 bg-emerald-border/70 rounded-lg appearance-none cursor-pointer accent-gold-warm focus:outline-none"
            />
            <span className="text-[10px] font-mono text-parchment-muted tabular-nums shrink-0 w-8 sm:w-9">
              {formatSeconds(duration)}
            </span>
          </div>

          {/* Single Compact Control Row (Fits cleanly inside 360px+ mobile screens without overflow!) */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 w-full min-w-0">
            {/* Left: Compact Play/Pause (mobile) + Cover (desktop) + Truncated Title */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
              {/* Mobile Play/Pause right on left for 1-thumb reach */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'หยุดชั่วคราว' : 'เล่นเสียง'}
                className="sm:hidden w-9 h-9 rounded-full bg-gold-gradient text-slate-abyss flex items-center justify-center font-bold shadow-gold-sm shrink-0 active:scale-95 transition cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Cover thumbnail on sm+ */}
              <div className="hidden sm:flex relative w-9 h-9 rounded-lg overflow-hidden bg-emerald-deep border border-gold/30 shrink-0 items-center justify-center">
                {currentTrack.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentTrack.coverImage}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Radio className="w-4 h-4 text-gold-warm" />
                )}
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">
                {currentTrack.seriesTitle && (
                  <div className="text-[10px] text-gold-warm font-semibold truncate leading-tight">
                    {currentTrack.seriesTitle}
                  </div>
                )}
                <h4 className="text-xs sm:text-sm font-semibold text-parchment-cream truncate leading-snug">
                  {currentTrack.title}
                </h4>
              </div>
            </div>

            {/* Center/Right: Compact Playback Controls */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* -10s */}
              <button
                type="button"
                onClick={seekBackward10}
                title="ย้อนหลัง 10 วินาที"
                aria-label="ย้อนหลัง 10 วินาที"
                className="p-1.5 text-parchment-muted hover:text-gold-light transition rounded-full hover:bg-white/5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Desktop Play/Pause */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'หยุดชั่วคราว' : 'เล่นเสียง'}
                className="hidden sm:flex w-9 h-9 rounded-full bg-gold-gradient text-slate-abyss items-center justify-center font-bold shadow-gold-sm hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* +10s */}
              <button
                type="button"
                onClick={seekForward10}
                title="ไปข้างหน้า 10 วินาที"
                aria-label="ไปข้างหน้า 10 วินาที"
                className="p-1.5 text-parchment-muted hover:text-gold-light transition rounded-full hover:bg-white/5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Speed */}
              <button
                type="button"
                onClick={cyclePlaybackRate}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-mono font-bold text-gold-light bg-emerald-deep/80 border border-gold/30 rounded-md hover:bg-emerald-surface transition cursor-pointer tabular-nums"
                title="เปลี่ยนความเร็วเสียง"
              >
                {playbackRate}x
              </button>

              {/* Desktop Volume */}
              <div className="hidden md:flex items-center gap-1.5 pl-1">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  aria-label="เปิด/ปิดเสียง"
                  className="text-parchment-muted hover:text-gold-light transition cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setTrackVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  aria-label="ระดับเสียง"
                  className="w-14 h-1 bg-emerald-border rounded appearance-none cursor-pointer accent-gold-warm"
                />
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={closePlayer}
                className="p-1.5 text-parchment-muted hover:text-gold-light rounded-full hover:bg-white/10 transition cursor-pointer"
                title="ปิดเครื่องเล่นเสียง"
                aria-label="ปิดเครื่องเล่นเสียง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

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
  ExternalLink,
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
  const [isExpanded, setIsExpanded] = useState(true);

  if (!currentTrack) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
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
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setRate(nextRate);
  };

  const seekForward10 = () => {
    seekTo(Math.min(currentTime + 10, duration));
  };

  const seekBackward10 = () => {
    seekTo(Math.max(currentTime - 10, 0));
  };

  return (
    <aside aria-label="Audio Player" className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-2 sm:pb-3">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-dark via-emerald-card to-slate-dark border border-gold/40 shadow-2xl backdrop-blur-xl p-3 sm:p-4 text-parchment-cream">
          {/* Top progress bar for smooth seeking */}
          <div className="relative w-full mb-3 flex items-center gap-2">
            <span className="text-[11px] font-mono text-parchment-muted/80 w-10 text-right">
              {formatSeconds(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-emerald-border/60 rounded-lg appearance-none cursor-pointer accent-gold-warm focus:outline-none"
            />
            <span className="text-[11px] font-mono text-parchment-muted/80 w-10">
              {formatSeconds(duration)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-emerald-deep border border-gold/30 shrink-0 shadow-sm flex items-center justify-center">
                {currentTrack.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentTrack.coverImage}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Radio className="w-6 h-6 text-gold-warm animate-pulse" />
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                    <span className="w-1 h-3 bg-gold-warm animate-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-5 bg-gold-warm animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2 bg-gold-warm animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-warm px-1.5 py-0.5 rounded bg-gold-dim/30 border border-gold/30">
                    Podcast
                  </span>
                  {currentTrack.seriesTitle && (
                    <span className="text-xs text-parchment-muted truncate">
                      {currentTrack.seriesTitle}
                    </span>
                  )}
                  {currentTrack.partTitle && (
                    <span className="text-[10px] text-emerald-300 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 shrink-0">
                      {currentTrack.partTitle}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-parchment-cream truncate">
                  {currentTrack.title}
                </h4>
              </div>
            </div>

            {/* Controls + Mobile Close Button */}
            <div className="flex items-center justify-between sm:justify-center w-full sm:w-auto gap-2.5 sm:gap-4">
              <div className="flex items-center gap-2.5 sm:gap-4">
                {/* -10s */}
                <button
                  onClick={seekBackward10}
                  title="ย้อนหลัง 10 วินาที"
                  className="p-2 text-parchment-muted hover:text-white transition rounded-full hover:bg-white/5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-full bg-gold-gradient text-slate-abyss flex items-center justify-center font-bold shadow-gold-sm hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                {/* +10s */}
                <button
                  onClick={seekForward10}
                  title="ไปข้างหน้า 10 วินาที"
                  className="p-2 text-parchment-muted hover:text-white transition rounded-full hover:bg-white/5 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Speed Button */}
                <button
                  onClick={cyclePlaybackRate}
                  className="px-2.5 py-1 text-xs font-mono font-bold text-gold-light bg-emerald-deep/80 border border-gold/30 rounded-lg hover:bg-emerald-surface transition cursor-pointer"
                  title="เปลี่ยนความเร็วเสียง"
                >
                  {playbackRate}x
                </button>
              </div>

              {/* Mobile-visible Close button */}
              <button
                onClick={closePlayer}
                className="sm:hidden p-2 text-parchment-muted hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
                title="ปิดเครื่องเล่นเสียง"
                aria-label="ปิดเครื่องเล่นเสียง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Right side: Volume & Close (Desktop/Tablet) */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={handleToggleMute}
                className="text-parchment-muted hover:text-gold-light transition cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
                className="w-16 h-1 bg-emerald-border rounded appearance-none cursor-pointer accent-gold-warm"
              />

              <div className="h-4 w-px bg-white/10 mx-1" />

              <button
                onClick={closePlayer}
                className="p-1.5 text-parchment-muted/70 hover:text-white rounded-full hover:bg-white/5 transition cursor-pointer"
                title="ปิดเครื่องเล่นเสียง"
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

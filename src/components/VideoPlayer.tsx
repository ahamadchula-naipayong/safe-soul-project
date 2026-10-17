'use client';

import React, { useState } from 'react';
import { Play, Sparkles, Film } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
  coverImage?: string;
}

export function VideoPlayer({ videoUrl, title = 'วิดีโอแอนิเมชันประจำบท', coverImage }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // If no videoUrl provided, default to a clean placeholder
  const embedUrl = videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-b from-emerald-card to-slate-dark shadow-2xl">
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-emerald-deep/90 border-b border-emerald-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-gold-warm">
          <Film className="w-4 h-4" />
          <span>แอนิเมชัน 4 มิติแห่งปัญญา</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-parchment-muted/80">
          <Sparkles className="w-3 h-3 text-gold-warm" />
          <span>The Safe Soul Animation Series</span>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black">
        {!isPlaying ? (
          <div className="relative w-full h-full flex items-center justify-center group cursor-pointer" onClick={() => setIsPlaying(true)}>
            {/* Poster image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80'}
              alt={title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition duration-300"
            />
            {/* Sacred Geometry overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-dark via-transparent to-black/40" />

            {/* Play Button */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold-gradient text-slate-abyss flex items-center justify-center shadow-gold-md group-hover:scale-110 active:scale-95 transition duration-300">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-parchment-cream bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 group-hover:border-gold/50 transition">
                คลิกเพื่อชมคลิปแอนิเมชันประจำบท
              </span>
            </div>
          </div>
        ) : (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}

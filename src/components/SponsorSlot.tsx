'use client';

import React, { useState } from 'react';
import { SponsorSlot as SponsorSlotType } from '@/types';
import { ExternalLink, Megaphone } from 'lucide-react';

interface SponsorSlotProps {
  slot?: SponsorSlotType;
  placement?: 'article_top' | 'article_bottom' | 'podcast_sticky' | 'sidebar';
  className?: string;
}

export function SponsorSlot({ slot, placement = 'article_top', className = '' }: SponsorSlotProps) {
  // If slot not provided or not active, return null
  if (!slot || !slot.is_active) {
    return null;
  }

  const handleClick = () => {
    // Analytics tracking could be dispatched here
    console.log(`[SPONSOR CLICK] Sponsor: ${slot.sponsor_name}, ID: ${slot.id}`);
  };

  if (placement === 'podcast_sticky') {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-dark/90 border border-gold/20 text-xs text-parchment-muted ${className}`}>
        <span className="text-[10px] uppercase font-bold text-gold-warm bg-gold-dim/40 px-1.5 py-0.5 rounded">
          Sponsor
        </span>
        <span className="truncate">สนับสนุนโดย {slot.sponsor_name}</span>
        <a
          href={slot.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="text-gold-light hover:underline flex items-center gap-1 shrink-0 ml-auto"
        >
          <span>เยี่ยมชม</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div className={`my-8 overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-r from-emerald-card via-emerald-surface to-slate-card shadow-lg ${className}`}>
      <div className="px-4 py-2 bg-emerald-deep/90 border-b border-emerald-border/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gold-warm font-semibold">
          <Megaphone className="w-3.5 h-3.5" />
          <span>ผู้สนับสนุน The Safe Soul Project</span>
        </div>
        <span className="text-[11px] text-parchment-muted/70">พันธมิตรเพื่อการสร้างคุณค่า</span>
      </div>

      <a
        href={slot.target_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block group relative"
      >
        <div className="relative aspect-[21/9] sm:aspect-[24/7] w-full overflow-hidden bg-black/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slot.banner_image_url}
            alt={slot.sponsor_name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4 sm:p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <span className="text-xs uppercase font-bold text-gold-warm tracking-wider">
                  Sponsored Partner
                </span>
                <h4 className="text-base sm:text-xl font-bold text-parchment-cream">
                  {slot.sponsor_name}
                </h4>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gold-gradient text-slate-abyss text-xs font-bold flex items-center gap-1 group-hover:scale-105 transition shadow-sm">
                <span>เรียนรู้เพิ่มเติม</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

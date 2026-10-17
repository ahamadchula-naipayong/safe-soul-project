'use client';

import React from 'react';
import { ContentMode } from '@/types';
import { Sparkles, Brain, Feather, Compass } from 'lucide-react';

interface DualModeToggleProps {
  mode: ContentMode;
  onToggle: (mode: ContentMode) => void;
  className?: string;
}

export function DualModeToggle({ mode, onToggle, className = '' }: DualModeToggleProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Switcher Container */}
      <div className="relative flex items-center p-1.5 rounded-full bg-slate-dark/90 border border-emerald-border/80 shadow-inner backdrop-blur-md">
        {/* Background slider pill */}
        <div
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-300 ease-out shadow-md ${
            mode === 'easy'
              ? 'left-1.5 bg-gradient-to-r from-emerald-light to-emerald-surface border border-emerald-400/30'
              : 'left-[calc(50%+3px)] bg-gradient-to-r from-gold-dim via-gold-muted to-gold border border-gold-light/40'
          }`}
        />

        {/* Easy Mode Button */}
        <button
          onClick={() => onToggle('easy')}
          className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 ${
            mode === 'easy' ? 'text-parchment-light' : 'text-parchment-muted/70 hover:text-parchment-cream'
          }`}
        >
          <Feather className={`w-4 h-4 ${mode === 'easy' ? 'text-emerald-300' : 'text-parchment-muted'}`} />
          <span>Easy Mode (ครอบครัว & เล่าเรื่อง)</span>
        </button>

        {/* Deep Mode Button */}
        <button
          onClick={() => onToggle('deep')}
          className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 ${
            mode === 'deep' ? 'text-slate-abyss font-bold' : 'text-parchment-muted/70 hover:text-parchment-cream'
          }`}
        >
          <Brain className={`w-4 h-4 ${mode === 'deep' ? 'text-slate-abyss' : 'text-gold-warm'}`} />
          <span>Deep Mode (ตรรกะ & วิทยาศาสตร์)</span>
        </button>
      </div>

      {/* Explanatory subtitle */}
      <div className="flex items-center gap-1.5 text-[11px] text-parchment-muted/80">
        {mode === 'easy' ? (
          <>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>โหมดภาษาง่าย อุปมาอุปไมย เข้าใจง่าย เหมาะสำหรับทุกคนในครอบครัว</span>
          </>
        ) : (
          <>
            <Compass className="w-3.5 h-3.5 text-gold-warm" />
            <span>โหมดวิเคราะห์เชิงลึก ญาณวิทยา ตรรกศาสตร์ วิทยาศาสตร์สมอง และเทววิทยา</span>
          </>
        )}
      </div>
    </div>
  );
}

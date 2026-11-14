'use client';

import React, { useState } from 'react';
import { ContentMode } from '@/types';
import { Brain, Feather, Compass, Info, X } from 'lucide-react';

interface DualModeToggleProps {
  mode: ContentMode;
  onToggle: (mode: ContentMode) => void;
  className?: string;
}

export function DualModeToggle({ mode, onToggle, className = '' }: DualModeToggleProps) {
  const [showNotice, setShowNotice] = useState(false);

  const handleEasyClick = () => {
    setShowNotice(true);
    setTimeout(() => {
      setShowNotice(false);
    }, 4500);
  };

  return (
    <div className={`flex flex-col items-center gap-2 relative ${className}`}>
      {/* Toast Notice when clicking Easy Mode */}
      {showNotice && (
        <div className="absolute -top-12 z-50 px-4 py-2 rounded-xl bg-[#0B2418] border border-gold-warm text-gold-light text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2 backdrop-blur-md">
          <Info className="w-4 h-4 text-gold-warm shrink-0" />
          <span>อ่าน Deep Mode ก่อนนะครับ โหมดนี้จะเพิ่มให้ทีหลังนะครับ</span>
          <button
            onClick={() => setShowNotice(false)}
            className="p-0.5 hover:text-white transition ml-1"
            aria-label="ปิดการแจ้งเตือน"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Switcher Container */}
      <div className="relative flex items-center p-1.5 rounded-full bg-slate-dark/90 border border-emerald-border/80 shadow-inner backdrop-blur-md">
        {/* Background slider pill (locked on Deep Mode) */}
        <div
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-300 ease-out shadow-md left-[calc(50%+3px)] bg-gradient-to-r from-gold-dim via-gold-muted to-gold border border-gold-light/40`}
        />

        {/* Easy Mode Button */}
        <button
          type="button"
          onClick={handleEasyClick}
          className="relative z-10 flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-parchment-muted/70 hover:text-parchment-cream transition-colors duration-200 cursor-pointer"
          title="อ่าน Deep Mode ก่อนนะครับ โหมดนี้จะเพิ่มให้ทีหลังนะครับ"
        >
          <Feather className="w-4 h-4 text-parchment-muted" />
          <span>Easy Mode</span>
          <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold">
            Upcoming
          </span>
        </button>

        {/* Deep Mode Button */}
        <button
          type="button"
          onClick={() => onToggle('deep')}
          className="relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 text-slate-abyss font-bold cursor-pointer"
        >
          <Brain className="w-4 h-4 text-slate-abyss" />
          <span>Deep Mode (ตรรกะ & วิทยาศาสตร์)</span>
        </button>
      </div>

      {/* Explanatory subtitle */}
      <div className="flex items-center gap-1.5 text-[11px] text-parchment-muted/80">
        <Compass className="w-3.5 h-3.5 text-gold-warm" />
        <span>Deep Mode: โหมดวิเคราะห์เชิงลึก ญาณวิทยา ตรรกศาสตร์ วิทยาศาสตร์สมอง และเทววิทยา (พร้อมใช้งาน)</span>
      </div>
    </div>
  );
}

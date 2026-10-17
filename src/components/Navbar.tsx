'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAudio } from '@/context/AudioContext';
import { FreeEbookModal } from '@/components/FreeEbookModal';
import {
  Compass,
  ShoppingBag,
  Menu,
  X,
  Radio,
  BookOpen,
  Crown,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const { totalItemsCount, openCart } = useCart();
  const { currentTrack, isPlaying } = useAudio();

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#08110D]/95 backdrop-blur-md border-b border-amber-500/20 text-parchment-cream transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        {/* Subtle Luxury Gold Filament at the top */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold-warm/80 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-surface via-[#122A1E] to-slate-abyss border border-gold-warm/50 flex items-center justify-center shadow-gold-sm group-hover:border-gold-light group-hover:shadow-gold-md transition duration-500">
              <Compass className="w-6 h-6 text-gold-warm group-hover:rotate-45 group-hover:text-gold-light transition duration-500" />
              <div className="absolute inset-0 rounded-xl bg-gold-warm/10 opacity-0 group-hover:opacity-100 transition duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel font-extrabold text-sm sm:text-base tracking-[0.15em] text-parchment-cream group-hover:text-gold-luxury transition duration-300">
                THE SAFE SOUL
              </span>
              <span className="text-[10px] text-gold-warm/90 font-thai font-semibold tracking-wider uppercase flex items-center gap-1">
                <span>4 มิติแห่งปัญญา</span>
                <span className="text-white/30">•</span>
                <span>Safe from the Dunya</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-xs sm:text-sm font-thai font-medium text-parchment-muted">
            <Link
              href="/series"
              className="hover:text-gold-light transition hover:-translate-y-0.5 transform duration-150 tracking-wide"
            >
              7 ธีมหลัก
            </Link>
            <Link
              href="/articles/art-of-self-awareness"
              className="hover:text-gold-light transition hover:-translate-y-0.5 transform duration-150 flex items-center gap-1.5"
            >
              <span>อ่านบทความ & พอดแคสต์</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-light/40 text-emerald-300 border border-emerald-400/30 font-sans">
                Dual Mode
              </span>
            </Link>
            <Link
              href="/store"
              className="hover:text-gold-light transition hover:-translate-y-0.5 transform duration-150 tracking-wide"
            >
              Merch & E-Book
            </Link>
            <Link
              href="/pricing"
              className="hover:text-gold-light transition hover:-translate-y-0.5 transform duration-150 flex items-center gap-1.5 text-gold-warm font-semibold tracking-wide"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>สมาชิก & Founding 100</span>
            </Link>
            <Link
              href="/admin"
              className="hover:text-gold-light transition hover:-translate-y-0.5 transform duration-150 flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-deep/60 border border-gold/20"
              title="แผงควบคุมแอดมินสำหรับเปลี่ยนรูปภาพและบทความ"
            >
              <SlidersHorizontal className="w-3 h-3 text-gold-warm" />
              <span>แผงควบคุม</span>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Audio Indicator if Playing */}
            {currentTrack && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-deep/90 border border-gold/40 text-xs text-gold-light animate-pulse shadow-gold-sm">
                <Radio className="w-3.5 h-3.5 text-gold-warm" />
                <span className="max-w-[110px] truncate font-thai">{currentTrack.title}</span>
              </div>
            )}

            {/* Free E-book CTA */}
            <button
              onClick={() => setIsEbookModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-surface/80 hover:bg-emerald-light border border-gold/40 text-gold-light font-thai font-semibold text-xs shadow-gold-sm transition hover:scale-105 active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-gold-warm" />
              <span>รับ E-Book ฟรี</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-emerald-dark/90 hover:bg-emerald-surface border border-gold/30 text-parchment-cream hover:text-gold-light transition shadow-sm"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full gold-bevel-button text-slate-abyss text-[11px] font-bold flex items-center justify-center shadow-gold-sm animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-parchment-muted hover:text-white rounded-lg hover:bg-white/5"
              aria-label="เปิดเมนู"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-border bg-[#0B1511]/95 backdrop-blur-2xl px-5 py-6 space-y-4 text-sm animate-fade-in font-thai">
            <Link
              href="/series"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-parchment-cream hover:text-gold-light font-medium"
            >
              7 ธีมหลัก (Safe Series)
            </Link>
            <Link
              href="/articles/art-of-self-awareness"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-parchment-cream hover:text-gold-light font-medium"
            >
              อ่านบทความ (Easy / Deep Mode)
            </Link>
            <Link
              href="/store"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-parchment-cream hover:text-gold-light font-medium"
            >
              Merch & E-Book Store
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-gold-warm font-semibold flex items-center gap-2"
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>สมาชิก & Founding 100</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-parchment-muted hover:text-gold-light font-medium flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-gold-warm" />
              <span>แผงควบคุมระบบ (Admin Control)</span>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsEbookModalOpen(true);
              }}
              className="w-full py-3 px-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-center text-xs shadow-gold-sm"
            >
              รับฟรี E-Book 7 บทหลัก
            </button>
          </div>
        )}
      </header>

      {/* Free Ebook Modal */}
      <FreeEbookModal
        isOpen={isEbookModalOpen}
        onClose={() => setIsEbookModalOpen(false)}
      />
    </>
  );
}

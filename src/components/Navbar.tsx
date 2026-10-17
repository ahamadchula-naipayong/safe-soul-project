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
} from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const { totalItemsCount, openCart } = useCart();
  const { currentTrack, isPlaying } = useAudio();

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-slate-dark/95 backdrop-blur-md border-b border-emerald-border/70 text-parchment-cream transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-surface to-emerald-dark border border-gold/40 flex items-center justify-center shadow-gold-sm group-hover:border-gold-warm transition">
              <Compass className="w-6 h-6 text-gold-warm group-hover:rotate-45 transition duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-extrabold text-sm sm:text-base tracking-wide text-parchment-cream group-hover:text-gold-light transition">
                THE SAFE SOUL PROJECT
              </span>
              <span className="text-[10px] sm:text-xs text-gold-warm font-medium tracking-wider uppercase">
                4 มิติแห่งปัญญา • ดุนยาที่ปลอดภัย
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-medium text-parchment-muted">
            <Link
              href="/series"
              className="hover:text-gold-light transition hover:-translate-y-0.5 transform duration-150"
            >
              7 ธีมหลัก (Series)
            </Link>
            <Link
              href="/articles/art-of-self-awareness"
              className="hover:text-gold-light transition hover:-translate-y-0.5 transform duration-150 flex items-center gap-1.5"
            >
              <span>อ่านบทความ & ฟัง Podcast</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-light/50 text-emerald-300 border border-emerald-400/30">
                Dual Mode
              </span>
            </Link>
            <Link
              href="/store"
              className="hover:text-gold-light transition hover:-translate-y-0.5 transform duration-150"
            >
              Merch & E-Book
            </Link>
            <Link
              href="/pricing"
              className="hover:text-gold-light transition hover:-translate-y-0.5 transform duration-150 flex items-center gap-1 text-gold-warm font-semibold"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>สมาชิก & Founding 100</span>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Indicator if Playing */}
            {currentTrack && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-deep/80 border border-gold/30 text-xs text-gold-light animate-pulse">
                <Radio className="w-3.5 h-3.5 text-gold-warm" />
                <span className="max-w-[100px] truncate">{currentTrack.title}</span>
              </div>
            )}

            {/* Free E-book CTA */}
            <button
              onClick={() => setIsEbookModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold/30 text-gold-light font-semibold text-xs shadow-sm transition hover:scale-105 active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-gold-warm" />
              <span>รับ E-Book ฟรี</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-emerald-dark hover:bg-emerald-surface border border-emerald-border/80 text-parchment-cream hover:text-gold-light transition"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold-gradient text-slate-abyss text-[11px] font-bold flex items-center justify-center shadow-gold-sm animate-bounce">
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
          <div className="md:hidden border-t border-emerald-border bg-emerald-card/95 backdrop-blur-xl px-4 py-6 space-y-4 text-sm animate-fade-in">
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
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsEbookModalOpen(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-center text-xs shadow-gold-sm"
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

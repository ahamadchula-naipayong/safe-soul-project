'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
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
  UserCheck,
  Layers,
  Coffee,
  ChevronRight,
  ExternalLink,
  FileText,
} from 'lucide-react';

export function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const { totalItemsCount, openCart } = useCart();
  const { currentTrack, isPlaying } = useAudio();
  const { member, isLoggedIn } = useAuth();

  // Prevent background scroll when off-canvas drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#08110D]/95 backdrop-blur-md border-b border-amber-500/20 text-parchment-cream transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)] font-thai">
        {/* Subtle Luxury Gold Filament at the top */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold-warm/80 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: Off-canvas Drawer Trigger & Brand Logo (Acting as Home Button) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Auto-hide Off-canvas Drawer Trigger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-xl bg-emerald-card/90 hover:bg-emerald-surface border border-gold-warm/40 text-parchment-cream hover:text-gold-light transition shadow-sm flex items-center gap-2 group cursor-pointer"
              aria-label="เปิดเมนูนำทางแบบ Auto-hide"
              title="เปิดเมนูนำทาง (Off-canvas Drawer)"
            >
              <Menu className="w-5 h-5 text-gold-warm group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline text-xs font-semibold tracking-wider text-gold-light">
                เมนู
              </span>
            </button>

            {/* Logo acts as Home button */}
            <Link
              href="/"
              className="flex items-center gap-3 group transition transform hover:opacity-95"
              aria-label="หน้าแรก Safe Soul Project"
              title="กลับสู่หน้าแรก"
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-surface via-[#122A1E] to-slate-abyss border border-gold-warm/50 flex items-center justify-center shadow-gold-sm group-hover:border-gold-light group-hover:shadow-gold-md transition duration-500">
                <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-gold-warm group-hover:rotate-45 group-hover:text-gold-light transition duration-500" />
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Direct Link to News Deepdive */}
            <Link
              href="/news"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-card/90 hover:bg-emerald-surface border border-gold-warm/50 hover:border-gold-light text-gold-light font-semibold text-xs shadow-gold-sm transition hover:scale-105 active:scale-95"
              title="สำนักข่าว The Key of Return • วิเคราะห์สถานการณ์โลกและภูมิรัฐศาสตร์"
            >
              <FileText className="w-3.5 h-3.5 text-gold-warm" />
              <span>สำนักข่าว The Key of Return</span>
            </Link>

            {/* Member Identity / Login Status */}
            {isLoggedIn && member ? (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-warm/15 hover:bg-gold-warm/25 border border-gold-warm/60 text-gold-light font-bold text-xs shadow-gold-sm transition hover:scale-105 active:scale-95"
                title={`คุณคือ ${member.name} (คลิกดูบัตรสมาชิก)`}
              >
                <Crown className="w-3.5 h-3.5 text-gold-warm fill-current" />
                <span>Member #{member.memberNumber}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-surface/80 hover:bg-emerald-light border border-gold/40 text-gold-light font-semibold text-xs shadow-gold-sm transition hover:scale-105 active:scale-95"
                title="เข้าสู่ระบบหรือลงทะเบียนรับสิทธิ์ Member"
              >
                <UserCheck className="w-3.5 h-3.5 text-gold-warm" />
                <span>เข้าสู่ระบบ / สมาชิก</span>
              </Link>
            )}

            {/* Free E-book CTA */}
            <button
              onClick={() => setIsEbookModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-surface/80 hover:bg-emerald-light border border-gold/40 text-gold-light font-semibold text-xs shadow-gold-sm transition hover:scale-105 active:scale-95"
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
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full gold-bevel-button text-slate-abyss text-[11px] font-bold flex items-center justify-center shadow-gold-sm transition-transform">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------------- */}
      {/* AUTO-HIDE OFF-CANVAS DRAWER (Sliding from Left with Backdrop Blur)     */}
      {/* ---------------------------------------------------------------------- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-thai">
          {/* Backdrop Blur Overlay with Auto-hide on Click */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Sliding Drawer Container */}
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-80 sm:w-96 max-w-[88vw] bg-gradient-to-b from-[#0F241A] via-[#091510] to-[#060D0A] border-r border-gold-warm/30 shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col justify-between p-6 sm:p-7 relative z-50 transform transition-transform duration-300 ease-out">
              {/* Drawer Header */}
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-5 border-b border-emerald-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-surface border border-gold-warm/40 flex items-center justify-center text-gold-warm">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-cinzel font-bold text-sm text-parchment-cream tracking-wider">
                        THE SAFE SOUL
                      </div>
                      <div className="text-[10px] text-gold-warm/80 font-medium">
                        4 มิติแห่งปัญญา
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-xl bg-black/40 hover:bg-emerald-surface border border-white/10 text-parchment-muted hover:text-white transition"
                    aria-label="ปิดเมนู"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Nav Links List */}
                <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                  {/* Member Login / Identity Quick Access */}
                  <Link
                    href="/login"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gold-warm/20 via-emerald-surface/60 to-emerald-card/40 border border-gold-warm/40 text-parchment-cream transition group"
                  >
                    <div className="flex items-center gap-3">
                      <Crown className="w-4 h-4 text-gold-warm fill-current" />
                      <div>
                        {isLoggedIn && member ? (
                          <>
                            <div className="text-sm font-bold text-gold-light">
                              Member #{member.memberNumber} • {member.name}
                            </div>
                            <div className="text-xs text-parchment-muted font-light">
                              แตะเพื่อดูบัตรสมาชิก / สลับบัญชี
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-semibold text-gold-light">
                              เข้าสู่ระบบ / สมาชิก (Member)
                            </div>
                            <div className="text-xs text-parchment-muted font-light">
                              รับสิทธิ์และลำดับ Member ถาวร
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gold-warm group-hover:translate-x-1 transition" />
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-card/40 hover:bg-emerald-surface/90 border border-transparent hover:border-gold-warm/30 text-parchment-cream transition group"
                  >
                    <div className="flex items-center gap-3">
                      <Compass className="w-4 h-4 text-gold-warm" />
                      <span className="text-sm font-semibold">หน้าแรก</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-parchment-muted group-hover:translate-x-1 transition" />
                  </Link>

                  <Link
                    href="/articles/art-of-self-awareness"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-surface/80 border border-transparent hover:border-emerald-border text-parchment-cream transition group"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-gold-warm" />
                      <div>
                        <div className="text-sm font-semibold">อ่านบทความ & พอดแคสต์</div>
                        <div className="text-xs text-parchment-muted font-light">Deep Mode (Easy Mode: Upcoming)</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-parchment-muted group-hover:translate-x-1 transition" />
                  </Link>

                  <Link
                    href="/store"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-surface/80 border border-transparent hover:border-emerald-border text-parchment-cream transition group"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-4 h-4 text-amber-300" />
                      <div>
                        <div className="text-sm font-semibold">Safe for Support</div>
                        <div className="text-xs text-parchment-muted font-light">มุมปลอดภัยเพื่อสนับสนุน</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-parchment-muted group-hover:translate-x-1 transition" />
                  </Link>

                  <Link
                    href="/pricing"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-surface/80 border border-transparent hover:border-gold-warm/40 text-parchment-cream transition group"
                  >
                    <div className="flex items-center gap-3">
                      <Crown className="w-4 h-4 text-gold-warm fill-current" />
                      <div>
                        <div className="text-sm font-semibold text-gold-light">สมาชิก & Founding 100</div>
                        <div className="text-xs text-parchment-muted font-light">ระดับผู้ร่วมก่อตั้งและสิทธิพิเศษ</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-parchment-muted group-hover:translate-x-1 transition" />
                  </Link>

                  <Link
                    href="/portal"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-surface/80 border border-transparent hover:border-emerald-border text-parchment-cream transition group"
                  >
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-emerald-300" />
                      <div>
                        <div className="text-sm font-semibold text-emerald-300">พอร์ทัลสมาชิก (Member Sanctuary)</div>
                        <div className="text-xs text-parchment-muted font-light">คลังเสียง, สรุปบทเรียน & บันทึก</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-parchment-muted group-hover:translate-x-1 transition" />
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-parchment-muted hover:text-parchment-cream transition group"
                  >
                    <div className="flex items-center gap-3">
                      <SlidersHorizontal className="w-4 h-4 text-gold-warm" />
                      <div className="text-xs">แผงควบคุมระบบ (Admin Control)</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-parchment-muted group-hover:translate-x-1 transition" />
                  </Link>
                </nav>
              </div>

              {/* Drawer Footer CTA */}
              <div className="pt-5 border-t border-emerald-border/60 space-y-3">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsEbookModalOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-center text-xs shadow-gold-sm transition hover:brightness-105"
                >
                  รับฟรี E-Book 7 บทหลัก
                </button>

                <div className="text-[11px] text-center text-parchment-muted/60 font-light">
                  © Safe Soul Project • Digital Sanctuary
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Free Ebook Modal */}
      <FreeEbookModal
        isOpen={isEbookModalOpen}
        onClose={() => setIsEbookModalOpen(false)}
      />
    </>
  );
}

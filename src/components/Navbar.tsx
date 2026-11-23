'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Compass,
  ShoppingBag,
  Menu,
  X,
  Crown,
  SlidersHorizontal,
  UserCheck,
  ChevronRight,
  FileText,
  Mail,
  Anchor,
  Sun,
  Moon,
} from 'lucide-react';

export function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { totalItemsCount, openCart } = useCart();
  const { member, isLoggedIn, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleCartClick = () => {
    if (totalItemsCount === 0 && pathname !== '/store') {
      router.push('/store');
    } else {
      openCart();
    }
  };

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          {/* Left: Off-canvas Drawer Trigger & Brand Logo (Acting as Home Button) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
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
              aria-label="หน้าแรก The Fitrah Shield"
              title="กลับสู่หน้าแรก"
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-surface via-[#122A1E] to-slate-abyss border border-gold-warm/50 flex items-center justify-center p-1 shadow-gold-sm group-hover:border-gold-light group-hover:shadow-gold-md transition duration-500 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo/logo-transparent.png"
                  alt="The Fitrah Shield Logo"
                  className="w-full h-full object-contain group-hover:scale-110 transition duration-500"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel font-extrabold text-sm sm:text-base tracking-[0.15em] text-parchment-cream group-hover:text-gold-luxury transition duration-300">
                  THE FITRAH SHIELD
                </span>
                <span className="text-[10px] text-gold-warm/90 font-thai font-semibold tracking-wider uppercase flex items-center gap-1">
                  <span>เกราะพิทักษ์ฟิฏเราะฮฺ</span>
                  <span className="text-white/30 hidden xs:inline">•</span>
                  <span className="hidden xs:inline">4 มิติแห่งปัญญา</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Buttons (Icon-only symbols on narrow mobile portrait, icon+text on sm+) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* 1. "โดดขึ้นเรือ!" Quick Jump to /journey (All Articles Hub) */}
            <Link
              href="/journey"
              aria-label="โดดขึ้นเรือ! เข้าสู่คลังบทความ Safe for Journey"
              className="inline-flex items-center justify-center gap-1.5 p-2.5 sm:px-4 sm:py-2 rounded-xl gold-bevel-button text-slate-abyss font-extrabold text-xs shadow-gold-sm transition hover:scale-105 active:scale-95"
              title="โดดขึ้นเรือ! • เข้าสู่คลังบทความ Safe for Journey ทั้งหมด"
            >
              <Anchor className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-abyss" />
              <span className="hidden sm:inline">โดดขึ้นเรือ!</span>
            </Link>

            {/* 2. Direct Link to News Deepdive ("อ่านข่าว KOR") */}
            <Link
              href="/news"
              aria-label="อ่านข่าว KOR — สำนักข่าว The Key of Return"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-card/90 hover:bg-emerald-surface border border-gold-warm/50 hover:border-gold-light text-gold-light font-semibold text-xs shadow-gold-sm transition hover:scale-105 active:scale-95"
              title="อ่านข่าว KOR • สำนักข่าว The Key of Return วิเคราะห์สถานการณ์โลกและภูมิรัฐศาสตร์"
            >
              <FileText className="w-3.5 h-3.5 text-gold-warm" />
              <span>อ่านข่าว KOR</span>
            </Link>

            {/* 3. Member Identity / Login Status (Icon symbol on mobile portrait, icon+text on sm+) */}
            {isLoggedIn && member ? (
              <Link
                href="/login"
                aria-label={`บัตรสมาชิก Member #${member.memberNumber}`}
                className="inline-flex items-center justify-center gap-1.5 p-2.5 sm:px-3 sm:py-2 rounded-xl bg-gold-warm/15 hover:bg-gold-warm/25 border border-gold-warm/60 text-gold-light font-bold text-xs shadow-gold-sm transition hover:scale-105 active:scale-95"
                title={`คุณคือ ${member.name} (คลิกดูบัตรสมาชิก)`}
              >
                <Crown className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gold-warm fill-current" />
                <span className="hidden sm:inline">Member #{member.memberNumber}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="เข้าสู่ระบบ หรือ สมัครสมาชิก"
                className="inline-flex items-center justify-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-surface/80 hover:bg-emerald-light border border-gold/40 text-gold-light font-semibold text-xs shadow-gold-sm transition hover:scale-105 active:scale-95"
                title="เข้าสู่ระบบหรือลงทะเบียนรับสิทธิ์ Member"
              >
                <UserCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gold-warm" />
                <span className="hidden sm:inline">เข้าสู่ระบบ / สมาชิก</span>
              </Link>
            )}

            {/* 4. Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'สลับเป็นโหมดสว่าง (อ่านสบายตา)' : 'สลับเป็นโหมดมืด'}
              title={theme === 'dark' ? 'สลับเป็นโหมดสว่าง (Warm Parchment)' : 'สลับเป็นโหมดมืด (Dark Sanctuary)'}
              className="inline-flex items-center justify-center p-2.5 rounded-xl bg-emerald-surface/80 hover:bg-emerald-light border border-gold/40 hover:border-gold-warm text-gold-warm hover:text-amber-300 shadow-gold-sm transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* 5. "ติดต่อเรา" (Icon-only Mail button) */}
            <Link
              href="/contact"
              aria-label="ติดต่อเรา"
              className="hidden sm:inline-flex items-center justify-center p-2.5 rounded-xl bg-emerald-surface/80 hover:bg-emerald-light border border-gold/40 hover:border-gold-warm text-gold-warm hover:text-amber-300 shadow-gold-sm transition hover:scale-105 active:scale-95"
              title="ติดต่อเรา • ส่งข้อความ พูดคุย ร้องขอ หรือแจ้งปัญหา"
            >
              <Mail className="w-5 h-5" />
            </Link>

            {/* Cart Button: Navigates directly to /store when empty, or opens CartDrawer when items exist */}
            {totalItemsCount === 0 && pathname !== '/store' ? (
              <Link
                href="/store"
                className="relative p-2.5 rounded-xl bg-emerald-dark/90 hover:bg-emerald-surface border border-gold/30 hover:border-gold-warm text-parchment-cream hover:text-gold-light transition shadow-sm cursor-pointer flex items-center gap-1.5"
                aria-label="ไปยังร้านค้า Safe for Support"
                title="ยังไม่มีสินค้าในตะกร้า • คลิกเพื่อไปยังหน้าร้านค้า Safe for Support ทันที"
              >
                <ShoppingBag className="w-5 h-5 text-gold-warm" />
              </Link>
            ) : (
              <button
                onClick={openCart}
                className="relative p-2.5 rounded-xl bg-emerald-dark/90 hover:bg-emerald-surface border border-gold/30 hover:border-gold-warm text-parchment-cream hover:text-gold-light transition shadow-sm cursor-pointer"
                aria-label="เปิดตะกร้าสินค้า Safe for Support"
                title="เปิดตะกร้าสินค้าและสินค้าแนะนำ"
              >
                <ShoppingBag className="w-5 h-5 text-gold-warm" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full gold-bevel-button text-slate-abyss text-[11px] font-bold flex items-center justify-center shadow-gold-sm transition-transform">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Quick Navigation Strip (ปรากฏเฉพาะจอมือถือและแท็บเล็ตเพื่อความสะดวกในการสลับหน้า) */}
        <div className="lg:hidden border-t border-emerald-border/50 bg-[#060E0A]/95 px-3 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 overflow-x-auto no-scrollbar text-[11px] font-semibold">
            {[
              { href: '/', label: 'หน้าแรก', icon: Compass },
              { href: '/journey', label: 'คลังบทความ', icon: Anchor },
              { href: '/news', label: 'อ่านข่าว KOR', icon: FileText },
              { href: '/pricing', label: 'แผนสมาชิก', icon: Crown },
              { href: '/store', label: 'ร้านค้า', icon: ShoppingBag },
            ].map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition flex-1 ${
                    isActive
                      ? 'bg-gold-warm/20 text-gold-light border border-gold-warm/50 font-bold'
                      : 'text-parchment-muted hover:text-parchment-cream hover:bg-emerald-surface/40'
                  }`}
                >
                  <Icon className="w-3 h-3 text-gold-warm shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
                  <Link
                    href="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition"
                    title="กลับสู่หน้าแรก The Fitrah Shield"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-surface via-[#122A1E] to-slate-abyss border border-gold-warm/40 flex items-center justify-center p-1 text-gold-warm shadow-gold-sm overflow-hidden group-hover:scale-105 transition-transform">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/logo/logo-transparent.png"
                        alt="The Fitrah Shield Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-cinzel font-bold text-sm text-parchment-cream tracking-wider group-hover:text-gold-light transition">
                        THE FITRAH SHIELD
                      </div>
                      <div className="text-[10px] text-gold-warm/80 font-medium">
                        เกราะพิทักษ์ฟิฏเราะฮฺ • 4 มิติแห่งปัญญา
                      </div>
                    </div>
                  </Link>

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

                  {/* Updated Sidebar Item: Safe for Journey -> /journey */}
                  <Link
                    href="/journey"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-surface/80 via-emerald-card/60 to-black/40 border border-gold-warm/40 hover:border-gold-light text-parchment-cream transition group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gold-warm/15 border border-gold-warm/40 flex items-center justify-center text-gold-warm group-hover:scale-110 transition-transform">
                        <Compass className="w-4 h-4 text-gold-warm" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gold-light flex items-center gap-1.5">
                          <span>Safe for Journey</span>
                        </div>
                        <div className="text-xs text-parchment-muted font-light">
                          มุ่งสู่ทะเลอันไร้ที่สิ้นสุดกัน
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gold-warm group-hover:translate-x-1 transition" />
                  </Link>

                  {/* News Archive Link in Drawer as well for mobile convenience */}
                  <Link
                    href="/news"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-surface/80 border border-transparent hover:border-emerald-border text-parchment-cream transition group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gold-warm" />
                      <div>
                        <div className="text-sm font-semibold">อ่านข่าว KOR</div>
                        <div className="text-xs text-parchment-muted font-light">สำนักข่าว The Key of Return • วิเคราะห์สถานการณ์โลก</div>
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
                        <div className="text-xs text-parchment-muted font-light">สำรวจคลังสัมภาระบนเรือ</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-parchment-muted group-hover:translate-x-1 transition" />
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl bg-gold-warm/10 hover:bg-gold-warm/20 border border-gold-warm/30 text-gold-light transition group"
                    >
                      <div className="flex items-center gap-3">
                        <SlidersHorizontal className="w-4 h-4 text-gold-warm" />
                        <div className="text-xs font-bold">แผงควบคุมระบบ (Admin Control)</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gold-warm group-hover:translate-x-1 transition" />
                    </Link>
                  )}
                </nav>
              </div>

              {/* Drawer Footer CTA -> Theme Switcher & Contact Us */}
              <div className="pt-5 border-t border-emerald-border/60 space-y-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-surface/80 hover:bg-emerald-surface border border-gold-warm/35 text-gold-light font-semibold text-xs flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-gold-warm" />
                    ) : (
                      <Moon className="w-4 h-4 text-gold-warm" />
                    )}
                    <span>
                      {theme === 'dark'
                        ? 'โหมดสว่าง (Warm Parchment)'
                        : 'โหมดมืด (Dark Sanctuary)'}
                    </span>
                  </span>
                  <span className="text-[10px] opacity-80">สลับธีม</span>
                </button>

                <Link
                  href="/contact"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full py-3 px-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-center text-xs shadow-gold-sm transition hover:brightness-105 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>ติดต่อเรา (พูดคุย / ร้องขอ / แจ้งเรื่อง)</span>
                </Link>

                <div className="text-[11px] text-center text-parchment-muted/60 font-light">
                  © The Fitrah Shield • Digital Sanctuary
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React from 'react';
import Link from 'next/link';
import { Compass, Shield, BookOpen, Crown, MessageSquare, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#070D0B] border-t border-emerald-border/80 text-parchment-cream relative overflow-hidden pt-16 pb-12">
      {/* Subtle gold glow line on top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-warm to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-surface to-emerald-dark border border-gold/40 flex items-center justify-center shadow-gold-sm">
                <Compass className="w-6 h-6 text-gold-warm" />
              </div>
              <span className="font-serif font-extrabold text-base tracking-wide text-parchment-cream">
                THE SAFE SOUL PROJECT
              </span>
            </div>

            <p className="text-xs sm:text-sm text-parchment-muted/90 leading-relaxed max-w-sm">
              แพลตฟอร์มความรู้ พอดแคสต์ และแอนิเมชันแห่งปัญญา &quot;4 มิติแห่งปัญญา&quot; เพื่อการสร้างภูมิคุ้มกันทางจิตวิญญาณ อยู่ร่วมกับโลกยุคใหม่โดยไม่ยอมให้โลกกลืนกินหัวใจ
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-parchment-muted">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-deep/60 border border-gold/20">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Discord Community</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-deep/60 border border-gold/20">
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>Telegram Private</span>
              </span>
            </div>
          </div>

          {/* 4 Dimensions of Wisdom */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-warm">
              4 มิติแห่งปัญญา
            </h4>
            <ul className="space-y-2 text-xs text-parchment-muted">
              <li>มิติที่ 1: มิติแห่งตน & การครองสติ</li>
              <li>มิติที่ 2: ปัญญา ตรรกศาสตร์ & วิทยาศาสตร์</li>
              <li>มิติที่ 3: จิตวิญญาณ & ความสงบแท้จริง</li>
              <li>มิติที่ 4: ความสัมพันธ์ ครอบครัว & มรดกนิรันดร์</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-warm">
              เนื้อหา & ระบบ
            </h4>
            <ul className="space-y-2 text-xs text-parchment-muted">
              <li>
                <Link href="/series" className="hover:text-gold-light transition">
                  7 ธีมหลัก (Safe Series)
                </Link>
              </li>
              <li>
                <Link href="/articles/art-of-self-awareness" className="hover:text-gold-light transition">
                  Dual-Mode Article Engine
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-gold-light transition">
                  สมาชิก 3 ระดับ & Founding 100
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-gold-light transition">
                  Merch & Digital Delivery
                </Link>
              </li>
              <li>
                <Link href="/admin/sponsors" className="hover:text-gold-light transition">
                  จัดการ Sponsor Slots (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Membership & Founding */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-warm">
              ผู้สนับสนุนพิเศษ
            </h4>
            <p className="text-xs text-parchment-muted leading-relaxed">
              ร่วมเป็น 1 ใน 100 ท่านแรกของ Founding Member สิทธิ์ตลอดชีพพร้อม Full Master E-book 240 หน้า
            </p>
            <Link
              href="/pricing#founding-checkout"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold-gradient text-slate-abyss text-xs font-bold hover:brightness-110 shadow-gold-sm transition"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>ดูสิทธิ์ที่เหลือ</span>
            </Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-parchment-muted/60">
          <p>© {new Date().getFullYear()} The Safe Soul Project. สงวนลิขสิทธิ์ทุกประการ.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-parchment-cream cursor-pointer transition">นโยบายความเป็นส่วนตัว</span>
            <span className="hover:text-parchment-cream cursor-pointer transition">ข้อกำหนดการใช้งาน</span>
            <span className="hover:text-parchment-cream cursor-pointer transition">Stripe Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

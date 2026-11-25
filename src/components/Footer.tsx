import React from 'react';
import Link from 'next/link';
import { Compass, Crown, MessageSquare, FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#070D0B] border-t border-emerald-border/80 text-parchment-cream relative overflow-hidden pt-16 pb-12 font-thai">
      {/* Subtle gold glow line on top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-warm to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-surface via-[#122A1E] to-slate-abyss border border-gold-warm/40 flex items-center justify-center p-1.5 shadow-gold-sm overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo/logo-transparent.png"
                  alt="The Fitrah Shield Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-cinzel font-extrabold text-base tracking-wider text-parchment-cream">
                THE FITRAH SHIELD
              </span>
            </div>

            <p className="text-xs sm:text-sm text-parchment-muted/90 leading-relaxed max-w-sm">
              แพลตฟอร์มความรู้ พอดแคสต์ และแอนิเมชันแห่งปัญญา &quot;4 มิติแห่งปัญญา&quot; เพื่อการสร้างภูมิคุ้มกันทางจิตวิญญาณเดิมแท้ อยู่ร่วมกับโลกยุคใหม่โดยไม่ยอมให้โลกกลืนกินหัวใจ
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-parchment-muted">
              <a
                href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/YMHttezcdr'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-deep/60 hover:bg-indigo-950/70 border border-gold/20 hover:border-indigo-400/50 text-parchment-cream transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Discord Community</span>
              </a>
            </div>
          </div>

          {/* 4 Dimensions of Wisdom */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-warm">
              4 มิติแห่งปัญญา
            </h4>
            <ul className="space-y-2 text-xs text-parchment-muted">
              <li>มิติที่ 1: มิติแห่งตน & การครองสติ (Self)</li>
              <li>มิติที่ 2: ปัญญา ตรรกศาสตร์ & วิทยาศาสตร์ (Awareness)</li>
              <li>มิติที่ 3: จิตวิญญาณ & ความศรัทธาแท้จริง (Faith)</li>
              <li>มิติที่ 4: จริยธรรมเชิงประจักษ์ & มรดกนิรันดร์ (Ethics)</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-warm">
              เนื้อหา & ระบบ
            </h4>
            <ul className="space-y-2 text-xs text-parchment-muted">
              <li>
                <Link href="/journey" className="hover:text-gold-light transition flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-gold-warm" />
                  <span>Safe for Journey (รวมบทความ)</span>
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-gold-light transition flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>สำนักข่าว The Key of Return</span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-gold-light transition">
                  สมาชิก 3 ระดับ & Founding 100
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-gold-light transition">
                  Safe for Support (สนับสนุน)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-light transition">
                  ติดต่อเรา (พูดคุย / ร้องขอ / ร้องเรียน)
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
          <p>© {new Date().getFullYear()} The Fitrah Shield. สงวนลิขสิทธิ์ทุกประการ.</p>
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

'use client';

import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, ShieldCheck, Flame, ArrowRight } from 'lucide-react';
import { FoundingSlotsQuota } from '@/types';

interface FoundingCountdownProps {
  initialQuota?: FoundingSlotsQuota;
  showCheckoutButton?: boolean;
}

export function FoundingCountdown({
  initialQuota = {
    max_slots: 100,
    claimed_slots: 83,
    remaining_slots: 17,
    percentage_claimed: 83,
  },
  showCheckoutButton = true,
}: FoundingCountdownProps) {
  const [quota, setQuota] = useState<FoundingSlotsQuota>(initialQuota);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Optionally fetch live quota from API
    async function fetchQuota() {
      try {
        const res = await fetch('/api/founding-quota');
        if (res.ok) {
          const data = await res.json();
          if (data && data.claimed_slots !== undefined) {
            setQuota({
              max_slots: 100,
              claimed_slots: data.claimed_slots,
              remaining_slots: 100 - data.claimed_slots,
              percentage_claimed: data.claimed_slots,
            });
          }
        }
      } catch {
        // Fallback to initial quota
      }
    }

    fetchQuota();
  }, []);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#1B382B] via-[#12261C] to-[#0A140F] border-2 border-gold/60 shadow-gold-md overflow-hidden text-parchment-cream transition-all duration-300"
    >
      {/* Background Gold Ambient Shimmer */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-warm/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-gradient text-slate-abyss text-xs font-extrabold uppercase tracking-wider shadow-sm">
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>Tier 3: Founding 100 Lifetime</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold animate-pulse">
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span>โควตาจำกัดเพียง 100 ท่านแรกเท่านั้น</span>
        </div>
      </div>

      {/* Headline & Pricing */}
      <div className="mb-6">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-parchment-light mb-2">
          ผู้ร่วมก่อตั้งและสนับสนุนตลอดชีพ
        </h3>
        <p className="text-sm text-parchment-muted leading-relaxed">
          จ่ายครั้งเดียว ปลดล็อกครบ 57 บท (7 เกาะน้ำตื้น + 10 หมู่เกาะน้ำลึก 50 บท) และเสียงพอดแคสต์ทั้งหมดตลอดชีพ พร้อมรับ E-Book ทางอีเมลสมาชิก (ฉบับน้ำตื้น 73 หน้า + สิทธิ์จองฉบับน้ำลึก Coming Soon) และส่วนลด Merch 20%
        </p>
      </div>

      {/* Quota Progress Counter Box */}
      <div className="p-4 rounded-xl bg-black/40 border border-gold/30 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-parchment-muted flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-gold-warm" />
            สถานะการจองสิทธิ์ Real-Time:
          </span>
          <span className="text-sm font-bold text-gold-light">
            จองแล้ว {quota.claimed_slots} จาก {quota.max_slots} สิทธิ์
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 bg-emerald-border/70 rounded-full overflow-hidden p-0.5 border border-gold/20">
          <div
            className="h-full bg-gold-gradient rounded-full transition-all duration-1000 ease-out shadow-sm"
            style={{ width: `${quota.percentage_claimed}%` }}
          />
        </div>

        {/* Remaining Callout */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-parchment-muted/80">ความคืบหน้า {quota.percentage_claimed}%</span>
          <span className="text-amber-300 font-extrabold text-sm flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-gold-warm animate-spin-slow" />
            เหลือเพียง {quota.remaining_slots} สิทธิ์สุดท้าย!
          </span>
        </div>
      </div>

      {/* Benefits List */}
      <ul className="space-y-2.5 text-xs sm:text-sm text-parchment-muted mb-6">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-warm" />
          <span>ปลดล็อกครบ 57 ตอน (7 เกาะน้ำตื้น + 50 เกาะย่อยทะเลน้ำลึก) และระบบเสียงตลอดชีพ</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-warm" />
          <span>รับ E-Book ฉบับเกาะทะเลน้ำตื้นทางอีเมลสมาชิก + สิทธิ์รับฉบับทะเลน้ำลึก (Coming Soon) ฟรีเมื่อเปิดตัว</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-warm" />
          <span>บทบาทพิเศษ <strong className="text-gold-light">Founding Member (สีทอง)</strong> บน Discord ทางการ</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-warm" />
          <span>ปลดล็อกหมายเลขโทรศัพท์สายตรง Captain_Hadee ในหน้าติดต่อเรา</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-warm" />
          <span>ส่วนลด 20% สำหรับสินค้า Official Merch ทุกรายการในสโตร์</span>
        </li>
      </ul>

      {/* Action CTA */}
      {showCheckoutButton && (
        <a
          href="/pricing#founding-checkout"
          className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] shadow-gold-md transition"
        >
          <span>รับสิทธิ์ Founding 100 Lifetime (฿3,990 จ่ายครั้งเดียว)</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

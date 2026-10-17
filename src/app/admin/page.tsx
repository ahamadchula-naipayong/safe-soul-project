'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { mockSeries, mockChapters, mockFoundingQuota, mockSponsors } from '@/lib/supabase/mockData';
import {
  Layers,
  BookOpen,
  Crown,
  Megaphone,
  Sparkles,
  TrendingUp,
  Image,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Users,
  Settings,
  Plus,
} from 'lucide-react';

export default function AdminHubPage() {
  const [quota, setQuota] = useState(mockFoundingQuota);
  const [quotaSaved, setQuotaSaved] = useState(false);

  const handleAdjustQuota = (newClaimed: number) => {
    if (newClaimed < 0 || newClaimed > quota.max_slots) return;
    setQuota({
      max_slots: 100,
      claimed_slots: newClaimed,
      remaining_slots: 100 - newClaimed,
      percentage_claimed: newClaimed,
    });
    setQuotaSaved(true);
    setTimeout(() => setQuotaSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold/30 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-gold-warm text-xs font-cinzel font-bold uppercase tracking-widest mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>THE SAFE SOUL EXECUTIVE CONTROL CENTER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-parchment-cream">
              ระบบควบคุม & จัดการเนื้อหาหลังบ้าน
            </h1>
            <p className="text-xs sm:text-sm text-parchment-muted mt-1">
              แผงควบคุมระดับสูง ออกแบบให้ใช้งานง่าย เปลี่ยนรูปภาพ แก้ไขบทความ Easy/Deep Mode และคุมโควตาได้ในคลิกเดียว
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/articles"
              className="px-4 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-2 shadow-gold-sm"
            >
              <BookOpen className="w-4 h-4 fill-current" />
              <span>จัดการ 35 บทความ</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Chapters */}
          <div className="luxury-glass rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-parchment-muted">จำนวนบทความทั้งหมด</span>
              <BookOpen className="w-5 h-5 text-gold-warm" />
            </div>
            <div className="text-3xl font-serif font-black text-parchment-light">
              {mockChapters.length} <span className="text-sm font-sans text-parchment-muted">/ 35 ตอน</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>รองรับ Dual-Mode ทุกบท</span>
            </div>
          </div>

          {/* Founding 100 Quota */}
          <div className="luxury-glass rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-parchment-muted">สิทธิ์ Founding 100 ที่เหลือ</span>
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-serif font-black text-gold-light">
              {quota.remaining_slots} <span className="text-sm font-sans text-parchment-muted">สิทธิ์</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gold-warm">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>จองแล้ว {quota.claimed_slots}% ของโควตา</span>
            </div>
          </div>

          {/* Active Sponsors */}
          <div className="luxury-glass rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-parchment-muted">แบนเนอร์สปอนเซอร์</span>
              <Megaphone className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-3xl font-serif font-black text-parchment-light">
              {mockSponsors.filter((s) => s.is_active).length} <span className="text-sm font-sans text-parchment-muted">แบนเนอร์</span>
            </div>
            <div className="mt-3 text-xs text-parchment-muted">
              เปิดแสดงผลในหน้าบทความ & พอดแคสต์
            </div>
          </div>

          {/* Series Dimension */}
          <div className="luxury-glass rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-parchment-muted">ซีรีส์หลักแห่งปัญญา</span>
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-serif font-black text-parchment-light">
              {mockSeries.length} <span className="text-sm font-sans text-parchment-muted">ซีรีส์</span>
            </div>
            <div className="mt-3 text-xs text-parchment-muted">
              4 มิติ: กาย, ใจ, ปัญญา, มรดกนิรันดร์
            </div>
          </div>
        </div>

        {/* Founding 100 Quota Direct Controller Box */}
        <div className="luxury-glass rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gold-warm uppercase tracking-wider mb-1">
                <Crown className="w-4 h-4 fill-current" />
                <span>ตัวปรับสิทธิ์ Founding 100 Quota Controller</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-parchment-cream">
                ควบคุมจำนวนสิทธิ์คงเหลือบนหน้าเว็บแบบสด
              </h3>
              <p className="text-xs text-parchment-muted mt-1">
                คุณสามารถปรับตัวเลขจำนวนสิทธิ์ที่ถูกจองแล้ว เพื่อสร้างความต้องการ (Urgency) หรืออัปเดตตามยอดจริง
              </p>
            </div>

            {quotaSaved && (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-300 flex items-center gap-1.5 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>บันทึกสถานะโควตาสำเร็จ!</span>
              </span>
            )}
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-black/50 border border-gold/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 w-full md:w-1/2">
              <div className="flex justify-between text-xs">
                <span className="text-parchment-muted">ความคืบหน้าการจอง:</span>
                <span className="font-bold text-gold-light">{quota.claimed_slots} / 100 สิทธิ์</span>
              </div>
              <div className="w-full h-3 bg-emerald-dark rounded-full overflow-hidden border border-gold/30">
                <div
                  className="h-full bg-gold-gradient rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${quota.percentage_claimed}%` }}
                />
              </div>
              <span className="text-[11px] text-amber-300 font-semibold block">
                แสดงผลบนหน้าบ้าน: เหลือเพียง {quota.remaining_slots} สิทธิ์สุดท้าย!
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAdjustQuota(quota.claimed_slots - 1)}
                className="px-3 py-2 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold/30 text-parchment-cream text-xs font-bold transition"
              >
                - ลดคนจอง 1
              </button>
              <button
                onClick={() => handleAdjustQuota(quota.claimed_slots + 1)}
                className="px-3 py-2 rounded-xl bg-gold-gradient text-slate-abyss text-xs font-bold hover:brightness-110 shadow-gold-sm transition"
              >
                + เพิ่มคนจอง 1
              </button>
              <button
                onClick={() => handleAdjustQuota(83)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-parchment-muted text-xs transition"
              >
                รีเซ็ตค่ามาตรฐาน (83)
              </button>
            </div>
          </div>
        </div>

        {/* Admin Navigation Hub Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Article & Content Engine Manager */}
          <Link
            href="/admin/articles"
            className="group luxury-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-gold/60 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-surface border border-gold/40 flex items-center justify-center text-gold-warm group-hover:scale-110 transition duration-300 shadow-gold-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-parchment-cream group-hover:text-gold-light transition">
                  ระบบจัดการบทความ & สื่อมัลติมีเดีย (Article Engine)
                </h3>
                <p className="text-xs sm:text-sm text-parchment-muted mt-2 leading-relaxed">
                  เปลี่ยนรูปภาพหน้าปกบทความได้ง่ายๆ ในคลิกเดียว แก้ไขเนื้อหา Easy Mode และ Deep Mode แยกกันได้อย่างชัดเจน พร้อมทดสอบเสียงพอดแคสต์และคลิปวิดีโอแอนิเมชันทันที
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-border/40 flex items-center justify-between text-xs font-semibold text-gold-warm group-hover:text-gold-light">
              <span>เข้าสู่หน้าแก้ไขบทความทั้ง 35 ตอน</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: Sponsor Slots Manager */}
          <Link
            href="/admin/sponsors"
            className="group luxury-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-gold/60 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-surface border border-gold/40 flex items-center justify-center text-gold-warm group-hover:scale-110 transition duration-300 shadow-gold-sm">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-parchment-cream group-hover:text-gold-light transition">
                  ระบบจัดการแบนเนอร์สปอนเซอร์ (Sponsor Slots)
                </h3>
                <p className="text-xs sm:text-sm text-parchment-muted mt-2 leading-relaxed">
                  เปิดหรือปิดการแสดงผลแบนเนอร์ผู้สนับสนุนในหน้าบทความและหน้าเครื่องเล่นพอดแคสต์ได้ทันที ดูสถิติคนดู (Impressions) และยอดคลิก (Clicks) แบบ Real-time
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-border/40 flex items-center justify-between text-xs font-semibold text-gold-warm group-hover:text-gold-light">
              <span>เข้าสู่หน้าคุมแบนเนอร์ผู้สนับสนุน</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

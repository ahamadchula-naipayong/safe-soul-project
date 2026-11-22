'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, ViewAsMode } from '@/context/AuthContext';
import {
  Eye,
  Shield,
  Compass,
  Anchor,
  Crown,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  UserX,
} from 'lucide-react';

const VIEW_MODES: {
  id: ViewAsMode;
  label: string;
  shortLabel: string;
  summary: string;
  color: string;
}[] = [
  {
    id: 'actual',
    label: 'มุมมองจริง (Admin / Co-Admin)',
    shortLabel: 'Admin (ปกติ)',
    summary: 'สิทธิ์ผู้ดูแลระบบเต็มรูปแบบ • เข้าถึงทุกบทความและแผงควบคุมหลังบ้าน',
    color: 'bg-gold-warm text-slate-abyss border-gold-light font-bold',
  },
  {
    id: 'visitor',
    label: 'ผู้มาเยือน (ยังไม่เข้าสู่ระบบ)',
    shortLabel: 'ยังไม่ล็อกอิน',
    summary:
      'อ่านฟรีน้ำตื้น 7 เกาะ + ฟังเสียงน้ำตื้นเฉพาะเกาะ 1–3 • น้ำลึกและข่าวล็อกให้สมัครสมาชิก',
    color: 'bg-slate-800 text-parchment-cream border-white/30 font-bold',
  },
  {
    id: 'free_tier_1',
    label: 'Free-tier (เรือประมงน้ำตื้น ฿0)',
    shortLabel: 'Free-tier',
    summary:
      'อ่าน+ฟังเสียงน้ำตื้นครบ 7 เกาะ + อ่านบทที่ 1 ของน้ำลึกเกาะ 1–7 (เมื่อถึงวันเผยแพร่ 05:00 น.) + อ่านข่าวทั่วไป (ล็อกข่าว Deepdive)',
    color: 'bg-emerald-500 text-slate-abyss border-emerald-300 font-bold',
  },
  {
    id: 'supporter_tier_2',
    label: 'รายเดือน (เรือประมงน้ำลึก ฿199/ด.)',
    shortLabel: 'รายเดือน (Supporter)',
    summary:
      'อ่าน+ฟังเสียงน้ำตื้นครบ 7 เกาะ + ปลดล็อกบทความและเสียงน้ำลึกทุกบทที่ถึงกำหนดตารางเผยแพร่ (ตี 5 ของวัน) + อ่านข่าว Deepdive ทั้งหมด',
    color: 'bg-cyan-400 text-slate-abyss border-cyan-200 font-bold',
  },
  {
    id: 'founding_tier_3',
    label: 'ตลอดชีพ (เรือสำราญทุกมรสุม Founding 100)',
    shortLabel: 'ตลอดชีพ (Founding 100)',
    summary:
      'อภิสิทธิ์สูงสุด • ปลดล็อกล่วงหน้าครบ 100% ทั้ง 57 บทความ + 57 ไฟล์เสียงทันทีโดยไม่ต้องรอตารางวันเผยแพร่รายสัปดาห์ + ข่าว Deepdive ทั้งหมด',
    color: 'bg-amber-400 text-slate-abyss border-amber-200 font-bold',
  },
];

export function AdminViewAsBar() {
  const { isAdmin, rawMember, viewAsMode, setViewAsMode } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Completely invisible to regular visitors and non-admin members
  if (!isAdmin || !rawMember) return null;

  const activeConfig =
    VIEW_MODES.find((m) => m.id === viewAsMode) || VIEW_MODES[0];

  return (
    <div className="fixed bottom-3 left-3 z-50 max-w-[calc(100vw-1.5rem)] sm:max-w-xl font-thai print:hidden">
      {!isExpanded ? (
        /* Collapsed Pill */
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#07130E]/95 border-2 border-gold-warm/60 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-emerald-surface/80 text-xs text-parchment-cream transition cursor-pointer"
            title="คลิกเพื่อจำลองมุมมองสมาชิกแต่ละระดับ (View As)"
          >
            <Eye className="w-3.5 h-3.5 text-gold-warm shrink-0" />
            <span className="text-[11px] text-parchment-muted hidden xs:inline">
              View As:
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] border ${activeConfig.color}`}
            >
              {activeConfig.shortLabel}
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-gold-light" />
          </button>

          {viewAsMode !== 'actual' && (
            <button
              type="button"
              onClick={() => setViewAsMode('actual')}
              className="px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-400/40 text-red-200 text-[11px] font-bold transition cursor-pointer"
              title="กลับสู่มุมมอง Admin ปกติ"
            >
              รีเซ็ต
            </button>
          )}

          <Link
            href="/admin"
            className="p-2 rounded-xl bg-gold-warm/20 hover:bg-gold-warm hover:text-slate-abyss border border-gold-warm/50 text-gold-light transition"
            title="ไปยังแผงควบคุมระบบ (Admin Control)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        /* Expanded Simulator Panel */
        <div className="rounded-3xl bg-gradient-to-b from-[#10261B]/98 via-[#0A1811]/98 to-[#050D09]/98 border-2 border-gold-warm/70 p-4 sm:p-5 shadow-[0_15px_50px_rgba(0,0,0,0.92)] backdrop-blur-2xl space-y-3.5 text-parchment-cream animate-fade-in">
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-emerald-border/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gold-warm/20 border border-gold-warm/50 flex items-center justify-center text-gold-warm">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gold-light flex items-center gap-1.5">
                  <span>จำลองมุมมองสมาชิก (Admin View As)</span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-950 border border-emerald-400/40 text-[10px] text-emerald-300 font-mono">
                    เฉพาะ Admin/Co-Admin
                  </span>
                </div>
                <div className="text-[11px] text-parchment-muted">
                  สลับดูหน้าเว็บไซต์จริงในมุมมองของสมาชิกแต่ละระดับได้ทันที
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-xl bg-black/50 hover:bg-white/10 text-parchment-muted hover:text-white transition cursor-pointer"
              title="ย่อแถบ View As"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VIEW_MODES.map((m) => {
              const isSelected = viewAsMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewAsMode(m.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                    isSelected
                      ? 'bg-gold-warm/20 border-gold-warm text-parchment-cream shadow-gold-sm ring-1 ring-gold-warm'
                      : 'bg-black/45 hover:bg-emerald-surface/50 border-white/10 text-parchment-muted hover:text-parchment-cream'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-gold-light truncate">
                      {m.shortLabel}
                    </span>
                    {m.id === 'actual' ? (
                      <Shield className="w-3.5 h-3.5 text-gold-warm shrink-0" />
                    ) : m.id === 'visitor' ? (
                      <UserX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : m.id === 'free_tier_1' ? (
                      <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : m.id === 'supporter_tier_2' ? (
                      <Anchor className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    ) : (
                      <Crown className="w-3.5 h-3.5 text-amber-300 fill-current shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-parchment-muted line-clamp-1">
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Tier Explanation Box */}
          <div className="p-3 rounded-xl bg-black/60 border border-gold-warm/30 text-xs space-y-1">
            <div className="font-bold text-gold-light">
              มุมมองที่กำลังแสดงผล: {activeConfig.label}
            </div>
            <p className="text-[11px] text-parchment-muted leading-relaxed">
              {activeConfig.summary}
            </p>
          </div>

          {/* Bottom Quick Links for Admin */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <Link
              href="/admin"
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs shadow-gold-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>เปิดแผงควบคุม Admin Control</span>
            </Link>

            <Link
              href="/admin/articles"
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-surface/80 hover:bg-emerald-surface border border-gold-warm/40 text-gold-light font-semibold text-xs"
            >
              <span>จัดการตารางเผยแพร่บทความ</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { mockSponsors } from '@/lib/supabase/mockData';
import { SponsorSlot } from '@/types';
import {
  Megaphone,
  CheckCircle,
  XCircle,
  ExternalLink,
  Plus,
  BarChart3,
  Sparkles,
  Save,
} from 'lucide-react';

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorSlot[]>(mockSponsors);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleStatus = (id: string) => {
    setSponsors((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-gold-warm text-xs font-bold uppercase tracking-wider mb-1">
              <Megaphone className="w-4 h-4" />
              <span>Admin Management Dashboard</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-parchment-cream">
              จัดการแบนเนอร์ผู้สนับสนุน (Sponsor Slots)
            </h1>
            <p className="text-xs sm:text-sm text-parchment-muted mt-1">
              เปิด/ปิดการแสดงผลแบนเนอร์สปอนเซอร์ในหน้าบทความและหน้าเครื่องเล่นพอดแคสต์ได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-xs flex items-center gap-1.5 shadow-gold-sm hover:brightness-110 transition"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500 text-xs text-emerald-200 flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>อัปเดตสถานะแบนเนอร์ผู้สนับสนุนสำเร็จเรียบร้อย!</span>
          </div>
        )}

        {/* Sponsor Slots Table / Cards */}
        <div className="space-y-6">
          {sponsors.map((slot) => (
            <div
              key={slot.id}
              className="rounded-2xl p-6 bg-emerald-card border border-emerald-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-center gap-4 flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slot.banner_image_url}
                  alt={slot.sponsor_name}
                  className="w-24 h-16 rounded-xl object-cover border border-gold/30 shrink-0"
                />

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gold-warm uppercase">
                      ตำแหน่ง: {slot.placement}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        slot.is_active
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-950 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {slot.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>เปิดใช้งาน (Active)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-red-400" />
                          <span>ปิดใช้งาน (Inactive)</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-parchment-cream truncate">
                    {slot.sponsor_name} ({slot.name})
                  </h3>

                  <a
                    href={slot.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-parchment-muted hover:text-gold-light flex items-center gap-1 truncate"
                  >
                    <span>{slot.target_url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Right: Stats & Switch Toggle */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-emerald-border/40">
                <div className="flex items-center gap-4 text-xs text-parchment-muted">
                  <div className="text-center">
                    <span className="block font-mono font-bold text-parchment-cream">1,248</span>
                    <span className="text-[10px]">Impressions</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-mono font-bold text-gold-light">94</span>
                    <span className="text-[10px]">Clicks</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleStatus(slot.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    slot.is_active
                      ? 'bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-500/40'
                      : 'bg-emerald-800/40 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-500/40'
                  }`}
                >
                  {slot.is_active ? 'ปิดแบนเนอร์นี้' : 'เปิดแสดงผลแบนเนอร์'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

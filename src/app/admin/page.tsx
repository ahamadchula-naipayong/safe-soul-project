'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockFoundingQuota, mockSponsors } from '@/lib/supabase/mockData';
import { useAuth, ViewAsMode } from '@/context/AuthContext';
import { GeminiCoAdminWidget } from '@/components/GeminiCoAdminWidget';
import { AdminAnalyticsPanel } from '@/components/AdminAnalyticsPanel';
import {
  BookOpen,
  Crown,
  Megaphone,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  ShoppingBag,
  Mail,
  FileSpreadsheet,
  Clock,
  Eye,
  Compass,
  Anchor,
  Shield,
  Calendar,
} from 'lucide-react';

export default function AdminHubPage() {
  const { viewAsMode, setViewAsMode } = useAuth();
  const [quota, setQuota] = useState(mockFoundingQuota);
  const [quotaSaved, setQuotaSaved] = useState(false);

  const [stats, setStats] = useState({
    oceanArticles: 57,
    membersTotal: 5,
    pendingSlips: 0,
    storeTotal: 5,
    storeDrafts: 0,
    storeScheduled: 0,
    unreadContacts: 0,
  });

  const refreshStats = () => {
    Promise.all([
      fetch('/api/admin/members', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/admin/store', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/contact', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
    ]).then(([memData, storeData, contactData]) => {
      setStats((prev) => ({
        ...prev,
        membersTotal: memData?.total ?? prev.membersTotal,
        pendingSlips: memData?.counts?.pending_slip ?? 0,
        storeTotal: storeData?.total ?? prev.storeTotal,
        storeDrafts: storeData?.counts?.draft ?? 0,
        storeScheduled: storeData?.counts?.scheduled ?? 0,
        unreadContacts: contactData?.unreadCount ?? 0,
      }));
    });
  };

  useEffect(() => {
    refreshStats();
  }, []);

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
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-12 px-4 sm:px-6 lg:px-8 font-thai">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold/30 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-gold-warm text-xs font-cinzel font-bold uppercase tracking-widest mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>THE FITRAH SHIELD EXECUTIVE CONTROL CENTER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-thai-serif font-black text-parchment-cream">
              ระบบควบคุม & จัดการเนื้อหาหลังบ้าน (Admin Control)
            </h1>
            <p className="text-xs sm:text-sm text-parchment-muted mt-1 font-light">
              จัดการคลังบทความมหาสมุทร, ส่วน Safe for Support (Draft/ตั้งเวลา/Publish), ตารางสมาชิก Excel/CSV, ข้อความติดต่อเรา และสปอนเซอร์ครบวงจร
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/guide"
              className="px-4 py-2.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>คู่มือ Admin & การเพิ่ม Co-Admin</span>
            </Link>
            <Link
              href="/admin/store"
              className="px-4 py-2.5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-gold-warm/40 text-gold-light font-bold text-xs flex items-center gap-1.5 transition"
            >
              <ShoppingBag className="w-4 h-4 text-gold-warm" />
              <span>จัดการ Safe for Support</span>
            </Link>
            <Link
              href="/admin/articles"
              className="px-5 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-2 shadow-gold-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>จัดการบทความ</span>
            </Link>
          </div>
        </div>

        {/* Quick Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-emerald-card/60 border border-emerald-border space-y-2">
            <div className="flex items-center justify-between text-xs text-parchment-muted">
              <span>บทความ Safe for Journey</span>
              <BookOpen className="w-4 h-4 text-gold-warm" />
            </div>
            <div className="text-2xl font-mono font-bold text-parchment-cream">
              {stats.oceanArticles} บทความ
            </div>
            <div className="text-[11px] text-emerald-400">
              ทะเลน้ำตื้น 7 เกาะ + ทะเลน้ำลึก 50 เกาะย่อย
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-card/60 border border-emerald-border space-y-2">
            <div className="flex items-center justify-between text-xs text-parchment-muted">
              <span>รายการ Safe for Support</span>
              <ShoppingBag className="w-4 h-4 text-gold-warm" />
            </div>
            <div className="text-2xl font-mono font-bold text-gold-light">
              {stats.storeTotal} รายการ
            </div>
            <div className="text-[11px] text-parchment-muted">
              Draft {stats.storeDrafts} • ตั้งเวลา {stats.storeScheduled}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-card/60 border border-emerald-border space-y-2">
            <div className="flex items-center justify-between text-xs text-parchment-muted">
              <span>สมาชิกทั้งหมดในตาราง</span>
              <Users className="w-4 h-4 text-gold-warm" />
            </div>
            <div className="text-2xl font-mono font-bold text-parchment-cream">
              {stats.membersTotal} บัญชี
            </div>
            <div className="text-[11px] text-amber-300">
              {stats.pendingSlips > 0
                ? `รอตรวจสอบสลิปโอนเงิน ${stats.pendingSlips} รายการ!`
                : 'ตรวจสอบสลิปครบถ้วนแล้ว'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-card/60 border border-emerald-border space-y-2">
            <div className="flex items-center justify-between text-xs text-parchment-muted">
              <span>โควตา Founding 100</span>
              <Crown className="w-4 h-4 text-gold-warm fill-current" />
            </div>
            <div className="text-2xl font-mono font-bold text-gold-light">
              {quota.claimed_slots} / {quota.max_slots}
            </div>
            <div className="text-[11px] text-parchment-muted">
              คงเหลือ {quota.remaining_slots} สิทธิ์ • สปอนเซอร์ {mockSponsors.filter((s) => s.is_active).length} จุด
            </div>
          </div>
        </div>

        {/* Gemini AI Co-Admin Console & Google AI Studio Login Popup */}
        <GeminiCoAdminWidget onActionSuccess={refreshStats} />

        {/* Admin "View As" Perspective Switcher & Tier Comparison Matrix */}
        <div className="luxury-glass rounded-3xl p-6 sm:p-8 space-y-5 border-2 border-gold-warm/45">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-border/60 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-gold-warm uppercase tracking-wider">
                <Eye className="w-4 h-4" />
                <span>Admin Perspective Simulator • จำลองมุมมองสมาชิก (View As)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                สลับทดสอบมุมมองเว็บไซต์แต่ละระดับสมาชิก (Free-tier / รายเดือน / ตลอดชีพ)
              </h3>
              <p className="text-xs text-parchment-muted font-light">
                คลิกเลือกระดับมุมมองด้านล่าง (หรือใช้แถบปุ่มลอยมุมซ้ายล่างของหน้าจอ) เพื่อดูหน้าเว็บไซต์จริงในมุมมองของสมาชิกแต่ละกลุ่ม
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/journey"
                className="px-4 py-2 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs shadow-gold-sm"
              >
                ไปดูหน้าคลังบทความในมุมมองนี้ →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                id: 'actual' as ViewAsMode,
                title: 'มุมมองจริง (Admin)',
                badge: 'Admin / Co-Admin',
                shallow: 'อ่าน + ฟังเสียงครบ 7 เกาะ',
                deep: 'เข้าถึงทุกบท + จัดการหลังบ้าน',
                news: 'อ่านครบทุกหมวดหมู่',
              },
              {
                id: 'visitor' as ViewAsMode,
                title: 'ผู้มาเยือน (ยังไม่ล็อกอิน)',
                badge: 'Guest Visitor',
                shallow: 'อ่านครบ 7 เกาะ • ฟังเสียงเฉพาะเกาะ 1–3',
                deep: 'ล็อกทั้งหมด (แสดงตัวอย่าง + วันเผยแพร่)',
                news: 'ล็อกให้อ่านเฉพาะสมาชิกที่เข้าสู่ระบบ',
              },
              {
                id: 'free_tier_1' as ViewAsMode,
                title: 'Free-tier (฿0)',
                badge: 'เรือประมงน้ำตื้น',
                shallow: 'อ่าน + ฟังเสียงครบทั้ง 7 เกาะ + รับ E-Book 73 หน้า',
                deep: 'อ่านฟรีบทที่ 1 ของหมู่เกาะ 1–7 (เมื่อถึงวันเผยแพร่ 05:00 น.)',
                news: 'อ่านข่าวทั่วไป + West Asia (ล็อก Deepdive)',
              },
              {
                id: 'supporter_tier_2' as ViewAsMode,
                title: 'รายเดือน (฿199/ด.)',
                badge: 'เรือประมงน้ำลึก (Supporter)',
                shallow: 'อ่าน + ฟังเสียงครบทั้ง 7 เกาะ',
                deep: 'ปลดล็อกบทความ + เสียงน้ำลึกทุกบทที่ถึงกำหนดตารางเผยแพร่ (05:00 น.)',
                news: 'ปลดล็อกข่าวทั้งหมดรวมถึงหมวด Deepdive',
              },
              {
                id: 'founding_tier_3' as ViewAsMode,
                title: 'ตลอดชีพ (฿3,990)',
                badge: 'เรือสำราญทุกมรสุม (Founding 100)',
                shallow: 'อ่าน + ฟังเสียงครบทั้ง 7 เกาะ',
                deep: 'ปลดล็อกล่วงหน้าครบ 100% (50 บท + 50 ไฟล์เสียง) ทันทีไม่ต้องรอตารางสัปดาห์',
                news: 'ปลดล็อกข่าวทั้งหมดรวมถึงหมวด Deepdive ตลอดชีพ',
              },
            ].map((item) => {
              const active = viewAsMode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setViewAsMode(item.id)}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                    active
                      ? 'bg-gold-warm/20 border-gold-warm ring-2 ring-gold-warm shadow-gold-sm'
                      : 'bg-black/45 hover:bg-emerald-surface/40 border-emerald-border/70'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-gold-light border border-gold-warm/30">
                        {item.badge}
                      </span>
                      {active && (
                        <span className="text-[10px] font-bold text-emerald-300">● กำลังใช้งาน</span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-parchment-cream pt-1">
                      {item.title}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-parchment-muted border-t border-white/10 pt-2">
                    <div>
                      <strong className="text-gold-light">น้ำตื้น:</strong> {item.shallow}
                    </div>
                    <div>
                      <strong className="text-cyan-300">น้ำลึก:</strong> {item.deep}
                    </div>
                    <div>
                      <strong className="text-emerald-300">สำนักข่าว:</strong> {item.news}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Traffic & Member Activity Records Dashboard */}
        <AdminAnalyticsPanel />

        {/* Founding 100 Live Quota Control */}
        <div className="luxury-glass rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-gold-warm uppercase tracking-wider">
              <Crown className="w-4 h-4 fill-current" />
              <span>Real-time Founding 100 Quota Adjuster</span>
            </div>
            <h3 className="text-xl font-thai-serif font-bold text-parchment-cream">
              ปรับจำนวนโควตาผู้ร่วมก่อตั้งตลอดชีพ (Founding 100)
            </h3>
            <p className="text-xs text-parchment-muted font-light">
              ปรับตัวเลขผู้ถือสิทธิ์เพื่อให้แถบสถานะโควตาบนหน้าแรกและหน้าแผนสมาชิกอัปเดตตรงตามจริง
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleAdjustQuota(quota.claimed_slots - 1)}
              className="w-10 h-10 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/40 text-gold-light font-mono font-bold text-lg"
            >
              -
            </button>
            <div className="px-5 py-2 rounded-xl bg-black/50 border border-gold-warm/40 text-center min-w-[110px]">
              <div className="text-xl font-mono font-black text-gold-light">
                {quota.claimed_slots} / 100
              </div>
              <div className="text-[10px] text-parchment-muted">สิทธิ์ที่จองแล้ว</div>
            </div>
            <button
              type="button"
              onClick={() => handleAdjustQuota(quota.claimed_slots + 1)}
              className="w-10 h-10 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/40 text-gold-light font-mono font-bold text-lg"
            >
              +
            </button>
            {quotaSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>อัปเดตแล้ว</span>
              </span>
            )}
          </div>
        </div>

        {/* Main Management Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Ocean Articles Engine */}
          <Link
            href="/admin/articles"
            className="group luxury-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-gold/60 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-surface border border-gold/40 flex items-center justify-center text-gold-warm group-hover:scale-110 transition duration-300 shadow-gold-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition">
                  จัดการบทความ Safe for Journey
                </h3>
                <p className="text-xs sm:text-sm text-parchment-muted mt-2 leading-relaxed font-light">
                  เขียน แก้ไข ลบ เพิ่มหมวดหมู่ เปลี่ยนปกภาพ บันทึกฉบับร่าง (Draft) ตั้งเวลาเผยแพร่ (Schedule) หรือเผยแพร่ทันทีทั้งทะเลน้ำตื้นและทะเลน้ำลึก
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-border/40 flex items-center justify-between text-xs font-semibold text-gold-warm group-hover:text-gold-light">
              <span>เข้าสู่ระบบจัดการบทความทั้งหมด</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: NEW Safe for Support Manager */}
          <Link
            href="/admin/store"
            className="group luxury-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-gold/60 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-surface border border-gold/40 flex items-center justify-center text-gold-warm group-hover:scale-110 transition duration-300 shadow-gold-sm">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-gold-warm/20 border border-gold-warm/50 text-gold-light text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Draft • ตั้งเวลา • Publish ทันที</span>
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition">
                  จัดการส่วน Safe for Support
                </h3>
                <p className="text-xs sm:text-sm text-parchment-muted mt-2 leading-relaxed font-light">
                  จัดการสินค้าของที่ระลึกและผลงานดิจิทัลได้ง่ายเหมือนระบบบทความ อัปโหลดรูปภาพ ตั้งราคา เก็บเป็นฉบับร่าง ตั้งเวลาปล่อยล่วงหน้า หรือกดเผยแพร่ขึ้นหน้าเว็บทันที
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-border/40 flex items-center justify-between text-xs font-semibold text-gold-warm group-hover:text-gold-light">
              <span>เข้าสู่หน้าจัดการ Safe for Support</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: NEW Members Table & Slip Verification + Excel/CSV */}
          <Link
            href="/admin/members"
            className="group luxury-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-gold/60 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-surface border border-gold/40 flex items-center justify-center text-gold-warm group-hover:scale-110 transition duration-300 shadow-gold-sm">
                  <Users className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>Export / Import Excel & CSV</span>
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition">
                  ตารางข้อมูลสมาชิก & ตรวจสอบสลิปโอนเงิน
                </h3>
                <p className="text-xs sm:text-sm text-parchment-muted mt-2 leading-relaxed font-light">
                  ดูรายละเอียดสมาชิก เบอร์โทรศัพท์ อีเมล แยกหมวดหมู่ระดับเรือ ตรวจสลิปโอนเงิน แก้ไขสิทธิ์ และส่งออกหรือนำเข้าปรับแต่งเป็นไฟล์ Excel (.xlsx) และ CSV (.csv)
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-border/40 flex items-center justify-between text-xs font-semibold text-gold-warm group-hover:text-gold-light">
              <span>เปิดตารางจัดการสมาชิก ({stats.membersTotal} บัญชี)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 4: Contact Us Inbox */}
          <Link
            href="/admin/contacts"
            className="group luxury-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-gold/60 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-surface border border-gold/40 flex items-center justify-center text-gold-warm group-hover:scale-110 transition duration-300 shadow-gold-sm">
                  <Mail className="w-6 h-6" />
                </div>
                {stats.unreadContacts > 0 && (
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-abyss text-[11px] font-black">
                    ข้อความใหม่ {stats.unreadContacts} รายการ
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition">
                  กล่องข้อความติดต่อเรา (พูดคุย / ร้องขอ / ร้องเรียน)
                </h3>
                <p className="text-xs sm:text-sm text-parchment-muted mt-2 leading-relaxed font-light">
                  อ่านข้อความที่ผู้ใช้งานส่งเข้ามาผ่านหน้า &ldquo;ติดต่อเรา&rdquo; แยกตามหมวดหมู่ พร้อมคลิกตอบกลับไปยังอีเมลของผู้ติดต่อได้ทันที
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-border/40 flex items-center justify-between text-xs font-semibold text-gold-warm group-hover:text-gold-light">
              <span>เปิดอ่านข้อความติดต่อทั้งหมด</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 5: Sponsor Slots Manager */}
          <Link
            href="/admin/sponsors"
            className="md:col-span-2 group luxury-glass rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-gold/60 transition-all duration-300"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-surface border border-gold/40 flex items-center justify-center text-gold-warm shrink-0 group-hover:scale-110 transition duration-300 shadow-gold-sm">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition">
                  ระบบจัดการแบนเนอร์สปอนเซอร์ (Sponsor Slots)
                </h3>
                <p className="text-xs sm:text-sm text-parchment-muted mt-1 leading-relaxed font-light">
                  เปิดหรือปิดการแสดงผลแบนเนอร์ผู้สนับสนุนในหน้าบทความและเครื่องเล่นพอดแคสต์ พร้อมดูสถิติ Impressions และ Clicks
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-gold-warm group-hover:text-gold-light">
              <span>เข้าสู่หน้าคุมแบนเนอร์</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

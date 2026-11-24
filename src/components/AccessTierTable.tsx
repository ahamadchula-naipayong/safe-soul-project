'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  Anchor,
  Crown,
  Sailboat,
  Sparkles,
  BookOpen,
  ArrowRight,
  Shield,
  MessageSquare,
  Flame,
  Radio,
  FileText,
  Compass,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Percent,
} from 'lucide-react';
import { mockFoundingQuota } from '@/lib/supabase/mockData';

export type MaritimeTierId = 'shallow_boat' | 'deep_boat' | 'grand_cruise';

interface AccessTierTableProps {
  onOpenFreeModal?: () => void;
  onSelectTier?: (tier: 'free_tier_1' | 'supporter_tier_2' | 'founding_tier_3') => void;
  selectedTierId?: MaritimeTierId;
  className?: string;
}

export function AccessTierTable({
  onOpenFreeModal,
  onSelectTier,
  selectedTierId = 'grand_cruise',
  className = '',
}: AccessTierTableProps) {
  const [activeTierId, setActiveTierId] = useState<MaritimeTierId>(selectedTierId);
  const [showMatrixTable, setShowMatrixTable] = useState(false);

  const tiers = [
    {
      id: 'shallow_boat' as MaritimeTierId,
      backendKey: 'free_tier_1' as const,
      name: 'เรือประมงน้ำตื้น',
      badge: 'สมาชิกทั่วไป (Free Member)',
      subtitle: 'เข้าสู่ระบบฟรี • เดินเรือเลียบชายฝั่ง',
      price: 'ฟรี',
      pricePeriod: 'ตลอดชีพ (฿0)',
      icon: Sailboat,
      accentColor: 'emerald',
      cardBorder: 'border-emerald-500/30 hover:border-emerald-400/60',
      cardBg: 'bg-gradient-to-b from-emerald-950/30 via-black/60 to-black/80',
      activeRing: 'ring-2 ring-emerald-400 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.15)]',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      buttonText: 'สมัครลงเรือฟรี',
      action: onOpenFreeModal,
      buttonLink: onOpenFreeModal ? undefined : '/login',
      tagline: 'เริ่มต้นศึกษาอ่านคลื่นลมและสร้างภูมิคุ้มกันระดับพื้นฐาน',
      infographic: {
        shallow: {
          status: 'อ่านได้ครบ 7 เกาะ',
          detail: 'เข้าถึงเนื้อหา 7 เกาะแห่งปัญญา (S.A.F.E. Series) ฉบับเต็มตลอดชีพ',
          type: 'check',
        },
        deepOcean: {
          status: 'อ่านฟรี บทที่ 1 ของทั้ง 7 เกาะเปิด',
          detail: 'ทดลองอ่านเกาะย่อยแรกของ Safe from Dunya ถึง Barzakh (รวม 7 บท)',
          type: 'partial',
        },
        news: {
          status: 'อ่านหมวดทั่วไป & West Asia',
          detail: 'เข้าถึงรายงานสถานการณ์สำคัญและบทวิเคราะห์ภูมิรัฐศาสตร์ตะวันออกกลาง',
          type: 'check',
        },
        ebook: {
          status: 'รับ E-Book ทะเลน้ำตื้นทางอีเมล (฿199 → ฟรี ฿0)',
          detail: 'หนังสือดิจิทัล 73 หน้า จัดส่งทางอีเมลที่ใช้สมัครสมาชิก (ขอรับซ้ำได้ไม่จำกัดครั้ง)',
          type: 'check',
        },
        audio: {
          status: 'ฟังเสียงครบ 7 เกาะทะเลน้ำตื้น',
          detail: 'สมาชิกฟรีฟังเสียงพอดแคสต์ทะเลน้ำตื้นได้ครบทั้ง 7 เกาะ (ผู้ไม่ล็อกอินฟังได้ 3 เกาะแรก)',
          type: 'check',
        },
        community: {
          status: 'บัตรประจำเรือดิจิทัล (Sanctuary Pass)',
          detail: 'ระบบติดตามการอ่านและบันทึกลำดับ Member # ในระบบ',
          type: 'check',
        },
      },
    },
    {
      id: 'deep_boat' as MaritimeTierId,
      backendKey: 'supporter_tier_2' as const,
      name: 'เรือประมงน้ำลึก',
      badge: 'สมาชิกรายเดือน (Supporter)',
      subtitle: 'หยั่งลึกสู่มรสุมความจริง • รายสัปดาห์',
      price: '฿199',
      pricePeriod: '/ เดือน (หรือ ฿1,990 / ปี)',
      icon: Anchor,
      accentColor: 'cyan',
      cardBorder: 'border-cyan-500/40 hover:border-cyan-400/70',
      cardBg: 'bg-gradient-to-b from-[#0A2627]/60 via-[#041215]/80 to-black/90',
      activeRing: 'ring-2 ring-cyan-400 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      buttonText: 'ลงเรือประมงน้ำลึก (฿199/ด)',
      buttonLink: '/pricing?tier=supporter_tier_2#checkout-box',
      tagline: 'ติดตามการเดินเรือต่อเนื่องทุกสัปดาห์ ปลดล็อกเสียงและข่าวเชิงลึก',
      infographic: {
        shallow: {
          status: 'อ่านได้ครบ 7 เกาะ',
          detail: 'เข้าถึงเนื้อหา 7 เกาะแห่งปัญญาเต็มรูปแบบทั้ง Easy และ Deep Mode',
          type: 'check',
        },
        deepOcean: {
          status: 'เผยแพร่ตอนใหม่สัปดาห์ละ 1 บท',
          detail: 'อ่านเนื้อหาทะเลน้ำลึกครบตามรอบประจำสัปดาห์ (ต่อเนื่องทั้ง 10 ซีรีส์)',
          type: 'check',
        },
        news: {
          status: 'ปลดล็อกฉบับเต็ม Deepdive ทุกข่าว',
          detail: 'เข้าถึงบทวิเคราะห์เจาะลึก ถอดรหัสยุทธศาสตร์ กฎหมายระหว่างประเทศ และตรรกะสัจธรรม 100%',
          type: 'check',
        },
        ebook: {
          status: 'รับ E-Book ทะเลน้ำตื้นทางอีเมล (฿199 → ฟรี ฿0)',
          detail: 'รับไฟล์ PDF 73 หน้าทางอีเมลสมาชิก (ส่วน E-Book ทะเลน้ำลึก 10 หมู่เกาะ สถานะ: Coming Soon)',
          type: 'check',
        },
        audio: {
          status: 'ฟังเสียงน้ำตื้นครบ 7 เกาะ + น้ำลึกตามแพ็กเกจ',
          detail: 'ฟังเสียงพอดแคสต์ทะเลน้ำตื้น 7 เกาะ และทะเลน้ำลึกทุกตอนที่ปลดล็อกรายสัปดาห์',
          type: 'gold',
        },
        community: {
          status: 'สิทธิ์เข้าร่วม Discord ชุมชนจิตวิญญาณ',
          detail: 'แลกเปลี่ยนและติดตามข่าวสารพิเศษร่วมกับกลุ่มผู้สนับสนุน',
          type: 'check',
        },
      },
    },
    {
      id: 'grand_cruise' as MaritimeTierId,
      backendKey: 'founding_tier_3' as const,
      name: 'เรือสำราญทุกมรสุม',
      badge: 'สมาชิกตลอดชีพ (Founding 100)',
      subtitle: 'ผู้ร่วมก่อตั้ง • อภิสิทธิ์สูงสุดไร้ขีดจำกัด',
      price: '฿3,990',
      pricePeriod: 'จ่ายครั้งเดียวตลอดชีพ (Lifetime)',
      icon: Crown,
      highlight: true,
      accentColor: 'gold',
      cardBorder: 'border-gold-warm/60 hover:border-gold-light',
      cardBg: 'bg-gradient-to-b from-[#1C3B2C]/90 via-[#10241A]/95 to-[#08120E] shadow-[0_0_40px_rgba(217,169,79,0.18)]',
      activeRing: 'ring-2 ring-gold-warm border-gold-light shadow-[0_0_40px_rgba(217,169,79,0.3)]',
      badgeStyle: 'bg-gold-warm text-slate-abyss font-black border-gold-light',
      buttonText: 'รับสิทธิ์ Founding 100 Lifetime (฿3,990)',
      buttonLink: '/pricing?tier=founding_tier_3#checkout-box',
      tagline: 'ข้ามผ่านทุกมรสุม ปลดล็อกเนื้อหาทั้งหมด 57 บททันที พร้อมของขวัญดิจิทัลและชุมชนลับ',
      quota: {
        total: mockFoundingQuota.max_slots || 100,
        booked: mockFoundingQuota.claimed_slots || 83,
        remaining: mockFoundingQuota.remaining_slots || 17,
      },
      infographic: {
        shallow: {
          status: 'ปลดล็อกครบ 7 เกาะ 100%',
          detail: 'เข้าถึงเนื้อหา 7 เกาะแห่งปัญญาตลอดชีพ พร้อมสิทธิ์ทดสอบฟีเจอร์ใหม่ก่อนใคร',
          type: 'gold',
        },
        deepOcean: {
          status: 'ปลดล็อกครบ 10 หมู่เกาะ (50 บท) ทันที',
          detail: 'เข้าถึงเนื้อหาเชิงลึกทั้ง 10 หมู่เกาะครบถ้วนทันที โดยไม่ต้องรอรอบสัปดาห์',
          type: 'gold',
        },
        news: {
          status: 'ปลดล็อกฉบับเต็ม Deepdive ทุกข่าว 100%',
          detail: 'เข้าถึงสำนักข่าว The Key of Return ทุกหมวดและทุกบทวิเคราะห์เจาะลึกตลอดชีพ',
          type: 'gold',
        },
        ebook: {
          status: 'รับ E-Book น้ำตื้นทางอีเมล + จองสิทธิ์ฉบับน้ำลึก (Coming Soon)',
          detail: 'รับ E-Book ทะเลน้ำตื้น 73 หน้าทางอีเมลทันที และรับสิทธิ์ส่ง E-Book ทะเลน้ำลึก 10 หมู่เกาะฟรีเมื่อเปิดตัว',
          type: 'gold',
        },
        audio: {
          status: 'ปลดล็อกเสียงครบทุกบท (น้ำตื้น 7 + น้ำลึก 50) ตลอดชีพ',
          detail: 'ฟังเสียงบรรยายคุณภาพสตูดิโอครบทั้ง 57 บทความตลอดชีพโดยไม่มีค่าบริการรายเดือน',
          type: 'gold',
        },
        community: {
          status: 'Exclusive Discord (ยศทอง) + สายตรง Captain_Hadee',
          detail: 'สิทธิ์เข้าร่วมกลุ่มผู้ร่วมก่อตั้ง ปรึกษาวิชาการกับทีมงาน ปลดล็อกเบอร์โทรสายตรง และส่วนลด 20% สินค้า Merch ทุกชิ้น',
          type: 'gold',
        },
      },
    },
  ];

  const handleSelectTier = (tier: (typeof tiers)[number]) => {
    setActiveTierId(tier.id);
    if (onSelectTier) {
      onSelectTier(tier.backendKey);
    }
  };

  const activeTier = tiers.find((t) => t.id === activeTierId) || tiers[2];

  // Comparison Matrix Rows (3 Columns: เรือประมงน้ำตื้น, เรือประมงน้ำลึก, เรือสำราญทุกมรสุม)
  const comparisonRows = [
    {
      category: '1. มุ่งสู่ทะเลอันไร้ที่สิ้นสุดกัน (Ocean Series - 57 บท)',
      items: [
        {
          label: 'ทะเลน้ำตื้น (7 เกาะแห่งปัญญา - S.A.F.E.)',
          desc: 'ศิลปะการระวังตน, ชิรก์, นัฟซู, ริสกี, กระแสลวง, ฮารอม, บัรซัค',
          shallow: 'อ่านได้ครบ 7 เกาะ',
          deep: 'อ่านได้ครบ 7 เกาะ',
          cruise: 'อ่านได้ครบ 7 เกาะ',
          shallowOk: true,
          deepOk: true,
          cruiseOk: true,
        },
        {
          label: 'ทะเลน้ำลึก บทที่ 1 ของ 7 เกาะเปิด',
          desc: 'เกาะย่อยแรกของ Safe from Dunya ถึง Barzakh',
          shallow: 'อ่านฟรี บทที่ 1 ครบทั้ง 7 เกาะ',
          deep: 'อ่านได้ทั้งหมด',
          cruise: 'อ่านได้ทั้งหมด',
          shallowOk: true,
          deepOk: true,
          cruiseOk: true,
        },
        {
          label: 'ทะเลน้ำลึก ตอนใหม่ประจำสัปดาห์ (Weekly Releases)',
          desc: 'ปล่อยบทใหม่ให้ศึกษาต่อเนื่องสัปดาห์ละ 1 บท',
          shallow: '-',
          deep: 'สัปดาห์ละ 1 บท',
          cruise: 'อ่านครบทุกบททันที',
          shallowOk: false,
          deepOk: true,
          cruiseOk: true,
        },
        {
          label: 'ทะเลน้ำลึก ฉบับสมบูรณ์ครบ 10 หมู่เกาะ (50 เกาะย่อย)',
          desc: 'เข้าถึงเนื้อหาเชิงลึกทั้ง 10 ซีรีส์ครบถ้วนก่อนใคร',
          shallow: '-',
          deep: 'รอปลดล็อกตามรอบ',
          cruise: 'ปลดล็อกครบ 50 บททันที',
          shallowOk: false,
          deepOk: false,
          cruiseOk: true,
        },
      ],
    },
    {
      category: '2. สำนักข่าว The Key of Return',
      items: [
        {
          label: 'ข่าวสารหมวดทั่วไป (General Dispatches)',
          desc: 'รายงานสถานการณ์สำคัญและบริบทสังคม',
          shallow: 'อ่านฉบับเต็ม',
          deep: 'อ่านฉบับเต็ม',
          cruise: 'อ่านฉบับเต็ม',
          shallowOk: true,
          deepOk: true,
          cruiseOk: true,
        },
        {
          label: 'ข่าวสารหมวด West Asia (ภูมิรัฐศาสตร์ตะวันออกกลาง)',
          desc: 'วิเคราะห์เจาะลึกปาเลสไตน์ เลบานอน อิหร่าน ซีเรีย อิรัก',
          shallow: 'อ่านฉบับเต็ม',
          deep: 'อ่านฉบับเต็ม',
          cruise: 'อ่านฉบับเต็ม',
          shallowOk: true,
          deepOk: true,
          cruiseOk: true,
        },
        {
          label: 'บทวิเคราะห์เจาะลึกพิเศษ (Deepdive Analysis)',
          desc: 'ถอดรหัสยุทธศาสตร์ กฎหมายระหว่างประเทศ และตรรกะสัจธรรมเชิงลึก',
          shallow: 'เฉพาะพรีวิว',
          deep: 'อ่านฉบับเต็มทุกบทความ',
          cruise: 'อ่านฉบับเต็มทุกบทความ',
          shallowOk: false,
          deepOk: true,
          cruiseOk: true,
        },
      ],
    },
    {
      category: '3. อภิสิทธิ์พิเศษ ดิจิทัล & ชุมชนจิตวิญญาณ',
      items: [
        {
          label: 'E-Book เกราะพิทักษ์ฟิฏเราะฮฺ (ฉบับเกาะทะเลน้ำตื้น 73 หน้า)',
          desc: 'ใส่ตะกร้าจาก ฿199 เป็นฟรี ฿0 จัดส่งทางอีเมลที่สมัครสมาชิก (ขอรับซ้ำได้ไม่จำกัดครั้ง)',
          shallow: 'ฟรีทางอีเมล (ส่งซ้ำได้)',
          deep: 'ฟรีทางอีเมล (ส่งซ้ำได้)',
          cruise: 'ฟรีทางอีเมล (ส่งซ้ำได้)',
          shallowOk: true,
          deepOk: true,
          cruiseOk: true,
        },
        {
          label: 'E-Book มหาสมุทรแห่งความจริง (ฉบับทะเลน้ำลึก 10 หมู่เกาะ)',
          desc: 'หนังสือดิจิทัลรวบรวมเนื้อหาเชิงลึก 10 หมู่เกาะ (สถานะปัจจุบัน: Coming Soon)',
          shallow: 'Coming Soon',
          deep: 'Coming Soon',
          cruise: 'Coming Soon (รับฟรีเมื่อเปิดตัว)',
          shallowOk: false,
          deepOk: false,
          cruiseOk: true,
        },
        {
          label: 'สิทธิ์การฟังเสียงพอดแคสต์บรรยาย',
          desc: 'ไม่เข้าระบบฟังได้เฉพาะน้ำตื้น 3 เกาะแรก • เข้าระบบฟังได้ตามระดับแพ็กเกจ',
          shallow: 'ฟังครบ 7 เกาะน้ำตื้น',
          deep: 'น้ำตื้น 7 + น้ำลึกรายสัปดาห์',
          cruise: 'ฟังครบทุกบท (57 บท) ตลอดชีพ',
          shallowOk: true,
          deepOk: true,
          cruiseOk: true,
        },
        {
          label: 'เข้าร่วม Exclusive Discord Sanctuary',
          desc: 'ห้องสนทนาแลกเปลี่ยนและปรึกษาความรู้เชิงปรัชญาและเทววิทยากับทีมงาน',
          shallow: '-',
          deep: 'บทบาท Supporter',
          cruise: 'บทบาท Founding (สีทอง)',
          shallowOk: false,
          deepOk: true,
          cruiseOk: true,
        },
        {
          label: 'ช่องทางสายตรงประสานงาน (Captain_Hadee)',
          desc: 'ปลดล็อกหมายเลขโทรศัพท์สายตรงเต็มรูปแบบในหน้าติดต่อเราเฉพาะสมาชิกตลอดชีพ',
          shallow: '-',
          deep: '-',
          cruise: 'ปลดล็อกสายตรงเต็มหมายเลข',
          shallowOk: false,
          deepOk: false,
          cruiseOk: true,
        },
        {
          label: 'ส่วนลด 20% สำหรับสินค้า Physical Merch',
          desc: 'ใช้เป็นส่วนลดหนังสือรูปเล่ม เสื้อผ้า และสิ่งของที่ระลึกในสโตร์',
          shallow: '-',
          deep: '-',
          cruise: 'ลด 20% ทุกรายการถาวร',
          shallowOk: false,
          deepOk: false,
          cruiseOk: true,
        },
      ],
    },
  ];

  return (
    <div className={`space-y-10 ${className}`}>
      {/* -------------------------------------------------------------------- */}
      {/* 1. SECTION HEADER                                                    */}
      {/* -------------------------------------------------------------------- */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-card/90 border border-gold-warm/40 text-gold-light text-xs font-semibold shadow-gold-sm">
          <Anchor className="w-4 h-4 text-gold-warm" />
          <span>MARITIME ACCESS SANCTUARY • ตารางเปรียบเทียบสิทธิ์การเข้าถึงข้อมูล</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-thai-serif font-black text-parchment-cream tracking-tight">
          ระดับการเดินเรือแห่งปัญญา
        </h2>
        <p className="text-xs sm:text-sm text-parchment-muted max-w-2xl mx-auto leading-relaxed">
          คลิกเลือกระดับเรือเพื่อส่องดูสิทธิ์การเข้าถึงในรูปแบบ Active Dashboard แบบเข้าใจง่าย
          หรือเปิดดูตารางเปรียบเทียบฉบับเต็มด้านล่าง
        </p>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. THREE VESSEL CARDS (3 COLUMNS - NO VISITOR COLUMN)                */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {tiers.map((tier) => {
          const IconComp = tier.icon;
          const isSelected = activeTierId === tier.id;

          return (
            <div
              key={tier.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectTier(tier)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectTier(tier);
                }
              }}
              className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between relative transition-all duration-300 backdrop-blur-xl cursor-pointer select-none text-left ${
                tier.cardBg
              } ${tier.cardBorder} ${
                isSelected
                  ? tier.activeRing
                  : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              {/* Highlight ribbon for Lifetime */}
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gold-warm text-slate-abyss text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <Flame className="w-3.5 h-3.5 fill-current text-red-700" />
                  <span>แนะนำสูงสุด • ลิมิเต็ด 100 ท่าน</span>
                </div>
              )}

              {/* Card Header & Content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                      tier.id === 'grand_cruise'
                        ? 'bg-gold-warm/25 border-gold-warm text-gold-warm shadow-gold-sm'
                        : tier.id === 'deep_boat'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${tier.badgeStyle}`}
                  >
                    {tier.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-thai-serif font-black text-parchment-cream">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-parchment-muted mt-1 leading-snug">
                    {tier.subtitle}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-white/10">
                  <div className="text-3xl font-serif font-black text-gold-light">
                    {tier.price}{' '}
                    <span className="text-xs font-sans text-parchment-muted font-normal block sm:inline mt-0.5 sm:mt-0">
                      {tier.pricePeriod}
                    </span>
                  </div>
                </div>

                {/* Quota bar if Grand Cruise */}
                {tier.quota && (
                  <div className="p-3 rounded-xl bg-black/60 border border-gold-warm/30 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-parchment-cream font-medium">
                      <span className="flex items-center gap-1 text-gold-warm font-semibold">
                        <Flame className="w-3 h-3 fill-current text-red-500" />
                        <span>โควตาผู้ร่วมก่อตั้ง</span>
                      </span>
                      <span className="text-gold-light font-bold">
                        {tier.quota.booked} / {tier.quota.total} สิทธิ์
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gold-gradient h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(tier.quota.booked / tier.quota.total) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-amber-300 font-bold">
                      เหลือเพียง {tier.quota.remaining} สิทธิ์สุดท้าย!
                    </div>
                  </div>
                )}

                {/* Quick 4-item bullet list */}
                <ul className="space-y-2 text-xs text-parchment-cream/90 pt-2 border-t border-white/5">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tier.infographic.shallow.status}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    {tier.infographic.deepOcean.type === 'partial' ? (
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                    ) : (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <span>{tier.infographic.deepOcean.status}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tier.infographic.news.status}</span>
                  </li>
                  {tier.id === 'grand_cruise' ? (
                    <li className="flex items-start gap-2 text-gold-light font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-gold-warm shrink-0 mt-0.5" />
                      <span>{tier.infographic.ebook.status}</span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2 text-parchment-muted">
                      <BookOpen className="w-3.5 h-3.5 text-parchment-muted shrink-0 mt-0.5" />
                      <span>{tier.infographic.ebook.status}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Button & Active Indicator */}
              <div className="pt-6 mt-4 border-t border-white/5 space-y-2">
                {tier.action ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      tier.action!();
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold/40 text-gold-light text-xs font-bold transition shadow-sm text-center"
                  >
                    {tier.buttonText}
                  </button>
                ) : (
                  <Link
                    href={tier.buttonLink || '#'}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition shadow-sm text-center block ${
                      tier.highlight
                        ? 'gold-bevel-button text-slate-abyss'
                        : tier.id === 'deep_boat'
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-abyss font-bold shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-parchment-cream'
                    }`}
                  >
                    {tier.buttonText}
                  </Link>
                )}

                <div className="text-center">
                  <span
                    className={`text-[11px] font-medium transition ${
                      isSelected ? 'text-gold-light font-bold' : 'text-parchment-muted/60'
                    }`}
                  >
                    {isSelected ? '✓ กำลังแสดงรายละเอียดด้านล่าง' : 'แตะเพื่อเลือกสิทธิ์นี้'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. ACTIVE DASHBOARD / INFOGRAPHIC VIEW                                */}
      {/* -------------------------------------------------------------------- */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0E2017] via-[#091610] to-[#040A07] border-2 border-gold-warm/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-8 animate-fade-in">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial-gradient from-gold-warm/15 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

        {/* Dashboard Top Title with Active Vessel Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gold-warm/30 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-gold-warm/40 text-gold-light text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-gold-warm animate-spin-slow" />
              <span>ACTIVE VESSEL DASHBOARD • แผงสรุปสิทธิ์ประจำเรือ</span>
            </div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl sm:text-3xl font-thai-serif font-black text-parchment-cream">
                {activeTier.name}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeTier.badgeStyle}`}>
                {activeTier.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-parchment-muted">{activeTier.tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            {activeTier.action ? (
              <button
                type="button"
                onClick={activeTier.action}
                className="px-6 py-3 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/50 text-gold-light text-xs sm:text-sm font-bold transition shadow-sm"
              >
                {activeTier.buttonText}
              </button>
            ) : (
              <Link
                href={activeTier.buttonLink || '#'}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                  activeTier.highlight
                    ? 'gold-bevel-button text-slate-abyss'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-abyss'
                }`}
              >
                {activeTier.buttonText}
              </Link>
            )}
          </div>
        </div>

        {/* 6 Infographic Feature Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 relative z-10">
          {/* Card 1: ทะเลน้ำตื้น */}
          <div className="p-5 rounded-2xl bg-black/50 border border-emerald-500/30 space-y-2 hover:border-emerald-400 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5 font-semibold">
                <Sailboat className="w-4 h-4" />
                <span>ทะเลน้ำตื้น (7 เกาะ)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                เข้าถึง 100%
              </span>
            </div>
            <div className="text-sm font-bold text-parchment-cream">
              {activeTier.infographic.shallow.status}
            </div>
            <p className="text-xs text-parchment-muted leading-relaxed">
              {activeTier.infographic.shallow.detail}
            </p>
          </div>

          {/* Card 2: ทะเลน้ำลึก */}
          <div className="p-5 rounded-2xl bg-black/50 border border-cyan-500/30 space-y-2 hover:border-cyan-400 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-cyan-400 flex items-center gap-1.5 font-semibold">
                <Anchor className="w-4 h-4" />
                <span>ทะเลน้ำลึก (10 หมู่เกาะ / 50 บท)</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  activeTier.id === 'grand_cruise'
                    ? 'bg-gold-warm/20 text-gold-warm border-gold-warm/40'
                    : activeTier.id === 'deep_boat'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                    : 'bg-white/10 text-parchment-muted border-white/10'
                }`}
              >
                {activeTier.id === 'grand_cruise'
                  ? 'ปลดล็อกครบ 50 บท'
                  : activeTier.id === 'deep_boat'
                  ? 'ตามรอบสัปดาห์'
                  : 'อ่านฟรี 7 บทแรก'}
              </span>
            </div>
            <div className="text-sm font-bold text-parchment-cream">
              {activeTier.infographic.deepOcean.status}
            </div>
            <p className="text-xs text-parchment-muted leading-relaxed">
              {activeTier.infographic.deepOcean.detail}
            </p>
          </div>

          {/* Card 3: สำนักข่าว The Key of Return */}
          <div className="p-5 rounded-2xl bg-black/50 border border-gold-warm/30 space-y-2 hover:border-gold-light transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-gold-warm flex items-center gap-1.5 font-semibold">
                <FileText className="w-4 h-4" />
                <span>สำนักข่าว The Key of Return</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  activeTier.id === 'shallow_boat'
                    ? 'bg-white/10 text-parchment-muted border-white/10'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}
              >
                {activeTier.id === 'shallow_boat' ? 'บทความทั่วไป' : 'Deepdive ฉบับเต็ม'}
              </span>
            </div>
            <div className="text-sm font-bold text-parchment-cream">
              {activeTier.infographic.news.status}
            </div>
            <p className="text-xs text-parchment-muted leading-relaxed">
              {activeTier.infographic.news.detail}
            </p>
          </div>

          {/* Card 4: คลังดิจิทัล & E-Book */}
          <div className="p-5 rounded-2xl bg-black/50 border border-white/15 space-y-2 hover:border-gold-warm/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-parchment-cream flex items-center gap-1.5 font-semibold">
                <BookOpen className="w-4 h-4 text-gold-warm" />
                <span>คลังดิจิทัล & E-Book</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  activeTier.id === 'grand_cruise'
                    ? 'bg-gold-warm text-slate-abyss border-gold-light'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}
              >
                {activeTier.id === 'grand_cruise'
                  ? 'ส่งทางอีเมล + จองน้ำลึก'
                  : 'ส่งทางอีเมล (ฟรี ฿0)'}
              </span>
            </div>
            <div className="text-sm font-bold text-parchment-cream">
              {activeTier.infographic.ebook.status}
            </div>
            <p className="text-xs text-parchment-muted leading-relaxed">
              {activeTier.infographic.ebook.detail}
            </p>
          </div>

          {/* Card 5: พอดแคสต์เสียงบรรยายในบทความ */}
          <div className="p-5 rounded-2xl bg-black/50 border border-white/15 space-y-2 hover:border-cyan-400/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-parchment-cream flex items-center gap-1.5 font-semibold">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>เสียงบรรยายในบทความ</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  activeTier.id === 'shallow_boat'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
                }`}
              >
                {activeTier.id === 'shallow_boat'
                  ? 'ฟังครบ 7 เกาะน้ำตื้น'
                  : 'น้ำตื้น + น้ำลึกตามแพ็กเกจ'}
              </span>
            </div>
            <div className="text-sm font-bold text-parchment-cream">
              {activeTier.infographic.audio.status}
            </div>
            <p className="text-xs text-parchment-muted leading-relaxed">
              {activeTier.infographic.audio.detail}
            </p>
          </div>

          {/* Card 6: ชุมชนจิตวิญญาณ & อภิสิทธิ์ */}
          <div className="p-5 rounded-2xl bg-black/50 border border-white/15 space-y-2 hover:border-gold-warm/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-parchment-cream flex items-center gap-1.5 font-semibold">
                <MessageSquare className="w-4 h-4 text-gold-warm" />
                <span>ชุมชนจิตวิญญาณ & อภิสิทธิ์</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  activeTier.id === 'grand_cruise'
                    ? 'bg-gold-warm text-slate-abyss border-gold-light'
                    : activeTier.id === 'deep_boat'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}
              >
                {activeTier.id === 'grand_cruise'
                  ? 'ยศทอง + ลด 20%'
                  : activeTier.id === 'deep_boat'
                  ? 'Discord Supporter'
                  : 'บัตรสมาชิกทั่วไป'}
              </span>
            </div>
            <div className="text-sm font-bold text-parchment-cream">
              {activeTier.infographic.community.status}
            </div>
            <p className="text-xs text-parchment-muted leading-relaxed">
              {activeTier.infographic.community.detail}
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. TOGGLE FOR FULL 3-COLUMN MATRIX TABLE                             */}
      {/* -------------------------------------------------------------------- */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setShowMatrixTable(!showMatrixTable)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-black/70 hover:bg-emerald-950/60 border border-gold-warm/40 text-gold-light text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer"
        >
          <Shield className="w-4 h-4 text-gold-warm" />
          <span>
            {showMatrixTable
              ? 'ซ่อนตารางเปรียบเทียบเต็มรูปแบบ (Hide Full Matrix)'
              : 'เปิดดูตารางเปรียบเทียบเทียบกัน 3 ระดับ (View Full 3-Tier Matrix)'}
          </span>
          {showMatrixTable ? (
            <ChevronUp className="w-4 h-4 text-gold-warm" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gold-warm" />
          )}
        </button>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 5. FULL 3-TIER MATRIX TABLE (DESKTOP & SCROLLABLE)                   */}
      {/* -------------------------------------------------------------------- */}
      {showMatrixTable && (
        <div className="rounded-3xl bg-black/85 border border-gold-warm/30 backdrop-blur-2xl overflow-hidden shadow-2xl animate-fade-in">
          <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950/80 via-black to-slate-abyss/90 border-b border-emerald-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gold-warm" />
              <span className="font-thai-serif font-bold text-sm sm:text-base text-parchment-cream">
                ตารางเปรียบเทียบสิทธิ์ 3 ระดับเรือ (Access Matrix)
              </span>
            </div>
            <span className="text-[11px] font-mono text-parchment-muted">
              The Fitrah Shield Unified Matrix
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-emerald-border/60 bg-black/90">
                  <th className="p-4 sm:p-5 text-parchment-muted font-bold min-w-[240px]">
                    หมวดหมู่เนื้อหา & บริการ
                  </th>
                  <th className="p-4 text-center min-w-[170px] bg-emerald-950/25">
                    <div className="font-thai font-bold text-emerald-300 text-sm">
                      เรือประมงน้ำตื้น
                    </div>
                    <div className="text-[10px] text-parchment-muted font-normal">
                      สมาชิกทั่วไป (ฟรี ฿0)
                    </div>
                  </th>
                  <th className="p-4 text-center min-w-[180px] bg-cyan-950/25">
                    <div className="font-thai font-bold text-cyan-300 text-sm">
                      เรือประมงน้ำลึก
                    </div>
                    <div className="text-[10px] text-parchment-muted font-normal">
                      ฿199 / เดือน
                    </div>
                  </th>
                  <th className="p-4 text-center min-w-[200px] bg-gold-warm/15 border-l border-gold-warm/30">
                    <div className="font-thai font-bold text-gold-light flex items-center justify-center gap-1 text-sm">
                      <Crown className="w-4 h-4 text-gold-warm" />
                      <span>เรือสำราญทุกมรสุม</span>
                    </div>
                    <div className="text-[10px] text-gold-light/80 font-normal">
                      ฿3,990 จ่ายครั้งเดียวตลอดชีพ
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-border/30">
                {comparisonRows.map((cat, catIdx) => (
                  <React.Fragment key={catIdx}>
                    {/* Category Header Row */}
                    <tr className="bg-emerald-deep/40">
                      <td
                        colSpan={4}
                        className="p-3.5 px-5 font-thai-serif font-bold text-xs text-gold-light uppercase tracking-wider"
                      >
                        {cat.category}
                      </td>
                    </tr>

                    {/* Feature Rows */}
                    {cat.items.map((item, itemIdx) => (
                      <tr
                        key={itemIdx}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4 sm:p-5">
                          <div className="font-semibold text-parchment-cream text-xs sm:text-sm">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-parchment-muted/80 mt-0.5">
                            {item.desc}
                          </div>
                        </td>

                        {/* 1. Shallow boat */}
                        <td className="p-4 text-center bg-emerald-950/10">
                          <div className="flex flex-col items-center justify-center gap-1">
                            {item.shallowOk ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <X className="w-4 h-4 text-parchment-muted/40" />
                            )}
                            <span className="text-[10px] text-parchment-cream/80">
                              {item.shallow}
                            </span>
                          </div>
                        </td>

                        {/* 2. Deep boat */}
                        <td className="p-4 text-center bg-cyan-950/10">
                          <div className="flex flex-col items-center justify-center gap-1">
                            {item.deepOk ? (
                              <Check className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <X className="w-4 h-4 text-parchment-muted/40" />
                            )}
                            <span className="text-[10px] text-cyan-200">
                              {item.deep}
                            </span>
                          </div>
                        </td>

                        {/* 3. Cruise */}
                        <td className="p-4 text-center bg-gold-warm/5 border-l border-gold-warm/20 font-semibold">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Check className="w-4 h-4 text-gold-warm" />
                            <span className="text-[10px] text-gold-light">
                              {item.cruise}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

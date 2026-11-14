'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FreeEbookModal } from '@/components/FreeEbookModal';
import { AccessTierTable } from '@/components/AccessTierTable';
import { QrSlipPaymentBox } from '@/components/QrSlipPaymentBox';
import { useAuth } from '@/context/AuthContext';
import {
  Crown,
  Sparkles,
  HelpCircle,
  ArrowRight,
  QrCode,
  Phone,
  CheckCircle2,
  UserCheck,
  Anchor,
} from 'lucide-react';

export default function PricingPage() {
  const { member, isLoggedIn, upgradeMembership } = useAuth();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'supporter_tier_2' | 'founding_tier_3'>('founding_tier_3');

  const [phone, setPhone] = useState('');
  const [slipDataUrl, setSlipDataUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tier');
      if (t === 'supporter_tier_2' || t === 'founding_tier_3') {
        setSelectedTier(t);
      }
    }
  }, []);

  useEffect(() => {
    if (member?.phone && !phone) {
      setPhone(member.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!slipDataUrl) {
      setCheckoutError('กรุณาแนบไฟล์สลิปการโอนเงินเพื่อให้ทีมงานตรวจสอบก่อนยืนยัน');
      return;
    }

    const amount =
      selectedTier === 'founding_tier_3'
        ? 3990
        : billingCycle === 'yearly'
        ? 1990
        : 199;

    setIsLoading(true);
    const res = await upgradeMembership({
      tier: selectedTier,
      phone: phone.trim() || member?.phone || '',
      paymentSlipDataUrl: slipDataUrl,
      paymentAmount: amount,
      billingCycle: selectedTier === 'founding_tier_3' ? 'lifetime' : billingCycle,
    });
    setIsLoading(false);

    if (!res.success) {
      setCheckoutError(res.error || 'ไม่สามารถส่งหลักฐานการชำระเงินได้');
    } else {
      setUpgradeSuccess(true);
      setSlipDataUrl('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-16 px-4 sm:px-6 lg:px-8 font-thai">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-deep/80 border border-gold/30 text-gold-light text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
            <span>ร่วมสนับสนุนและสร้างภูมิคุ้มกันทางจิตวิญญาณ</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-thai-serif font-black text-parchment-cream">
            แผนสมาชิก & สิทธิพิเศษ 3 ระดับเรือ
          </h1>

          <p className="text-sm sm:text-base text-parchment-muted max-w-xl mx-auto leading-relaxed">
            เลือกรูปแบบการสนับสนุนที่สอดคล้องกับเจตจำนงของคุณ ทันทีที่เลือกระดับเรือ ระบบจะแสดง QR เพื่อโอนเงินและช่องแนบสลิปตรวจสอบทันที
          </p>

          {/* Billing Cycle Switcher for Tier 2 */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-gold-light' : 'text-parchment-muted'}`}>
              รายเดือน
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-12 h-6 rounded-full bg-emerald-surface border border-gold/40 p-0.5 transition"
            >
              <div
                className={`w-4 h-4 rounded-full bg-gold-gradient transition-all duration-200 ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1 ${billingCycle === 'yearly' ? 'text-gold-light' : 'text-parchment-muted'}`}>
              <span>รายปี</span>
              <span className="text-[10px] text-slate-abyss bg-gold-warm px-1.5 py-0.5 rounded font-bold">
                ประหยัด 2 เดือน
              </span>
            </span>
          </div>
        </div>

        {/* Unified Maritime Access Sanctuary & Active Dashboard */}
        <div id="founding-checkout" className="scroll-mt-8">
          <AccessTierTable
            onOpenFreeModal={() => setIsEbookModalOpen(true)}
            onSelectTier={(tier) => {
              if (tier === 'free_tier_1') {
                window.location.href = '/login?tab=register&tier=free_tier_1';
              } else {
                setSelectedTier(tier);
                setUpgradeSuccess(false);
                const el = document.getElementById('checkout-box');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </div>

        {/* Immediate QR & Slip Upload Checkout Box */}
        <div
          id="checkout-box"
          className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0E2218] via-[#091510] to-[#060D0A] border border-gold-warm/40 shadow-2xl space-y-6 scroll-mt-24"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-border/50 pb-4">
            <div className="flex items-center gap-2 text-gold-warm text-xs font-bold uppercase tracking-wider">
              <QrCode className="w-4 h-4" />
              <span>ชำระเงินผ่าน QR Code & แนบสลิปตรวจสอบ (รอเชื่อมต่อ Stripe)</span>
            </div>
          </div>

          {/* Tier Switcher Pills inside Checkout Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gold-light block">
              เลือกระดับเรือที่ต้องการอัปเกรด / สมัครสมาชิก:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('supporter_tier_2');
                  setUpgradeSuccess(false);
                }}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                  selectedTier === 'supporter_tier_2'
                    ? 'bg-cyan-950/60 border-cyan-400 text-parchment-cream shadow-md'
                    : 'bg-black/35 border-emerald-border/60 text-parchment-muted hover:border-cyan-400/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Anchor className="w-4 h-4 text-cyan-300 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-cyan-200">เรือประมงน้ำลึก</div>
                    <div className="text-[11px] text-parchment-muted">Supporter Member</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-cyan-300">
                  {billingCycle === 'yearly' ? '฿1,990/ปี' : '฿199/ด.'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTier('founding_tier_3');
                  setUpgradeSuccess(false);
                }}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                  selectedTier === 'founding_tier_3'
                    ? 'bg-gold-warm/20 border-gold-warm text-parchment-cream shadow-gold-sm'
                    : 'bg-black/35 border-emerald-border/60 text-parchment-muted hover:border-gold-warm/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-gold-warm fill-current shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-gold-light">เรือสำราญทุกมรสุม</div>
                    <div className="text-[11px] text-parchment-muted">Founding 100 ตลอดชีพ</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-gold-light">฿3,990</span>
              </button>
            </div>
          </div>

          {upgradeSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-400/50 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-xl font-thai-serif font-bold text-parchment-cream">
                  ส่งหลักฐานสลิปโอนเงินสำเร็จแล้ว!
                </h4>
                <p className="text-xs sm:text-sm text-parchment-muted">
                  ระบบได้บันทึกคำขออัปเกรดของ <strong>Member #{member?.memberNumber}</strong> เข้าสู่ตารางตรวจสอบของแอดมินเรียบร้อยแล้ว
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs"
                >
                  ดูบัตรประจำตัวสมาชิก
                </Link>
                <Link
                  href="/journey"
                  className="px-5 py-2.5 rounded-xl bg-emerald-card border border-emerald-border text-parchment-cream font-semibold text-xs"
                >
                  ไปหน้า Safe for Journey
                </Link>
              </div>
            </div>
          ) : isLoggedIn && member ? (
            <form onSubmit={handleUpgradeSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-parchment-cream flex items-center justify-between">
                <span>
                  บัญชีปัจจุบัน: <strong className="text-gold-light">Member #{member.memberNumber} • {member.name}</strong>
                </span>
                <span className="font-mono text-parchment-muted">{member.email}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gold-warm" />
                  <span>เบอร์โทรศัพท์สำหรับติดต่อยืนยันสิทธิ์ *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-4 py-3 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-sm text-parchment-cream outline-none"
                />
              </div>

              <QrSlipPaymentBox
                tier={selectedTier}
                billingCycle={billingCycle}
                slipDataUrl={slipDataUrl}
                onSlipChange={(url) => setSlipDataUrl(url)}
              />

              {checkoutError && (
                <p className="text-xs text-red-300 bg-red-950/50 p-3 rounded-xl border border-red-500/30">
                  {checkoutError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm hover:brightness-110 shadow-gold-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>กำลังอัปโหลดสลิป...</span>
                ) : (
                  <>
                    <span>ยืนยันการโอนเงิน & ส่งสลิปให้แอดมินตรวจสอบ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Show QR & Slip Preview immediately even before logging in, plus direct CTA to Register with preselected tier */}
              <QrSlipPaymentBox
                tier={selectedTier}
                billingCycle={billingCycle}
                slipDataUrl={slipDataUrl}
                onSlipChange={(url) => setSlipDataUrl(url)}
              />

              <div className="p-4 rounded-2xl bg-gold-warm/10 border border-gold-warm/40 text-center space-y-3">
                <p className="text-xs sm:text-sm text-parchment-cream">
                  เพื่อบันทึกสลิปการโอนเงินผูกกับลำดับ <strong>Member Sequence</strong> และเบอร์โทรศัพท์ของคุณ กรุณาดำเนินการต่อในหน้าลงทะเบียนสมาชิก
                </p>
                <Link
                  href={`/login?tab=register&tier=${selectedTier}`}
                  className="w-full py-3.5 px-6 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm inline-flex items-center justify-center gap-2 transition hover:brightness-105"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    สมัครสมาชิกพร้อมแนบสลิปสำหรับ{' '}
                    {selectedTier === 'founding_tier_3' ? 'Founding 100 (฿3,990)' : 'Supporter (฿199)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6 pt-8">
          <h3 className="text-2xl font-thai-serif font-bold text-center text-parchment-cream flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-gold-warm" />
            <span>คำถามที่พบบ่อย (FAQ)</span>
          </h3>

          <div className="space-y-4 text-xs sm:text-sm text-parchment-muted">
            <div className="p-4 rounded-xl bg-emerald-card/50 border border-emerald-border/60">
              <h4 className="font-bold text-parchment-cream mb-1">
                การตรวจสอบสลิปโอนเงินใช้เวลานานเท่าใด และจะต่อ Stripe เมื่อไหร่?
              </h4>
              <p>
                ในช่วงเริ่มต้น คุณสามารถสแกน QR โอนเงินและแนบไฟล์สลิปในหน้าสมัครได้ทันที แอดมินจะตรวจสอบผ่านตารางสมาชิกหลังบ้านและเปิดสิทธิ์ให้โดยเร็วที่สุด และเร็วๆ นี้ระบบจะเชื่อมต่อกับ Stripe Checkout เพื่อตัดบัตรและอนุมัติอัตโนมัติทันที
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-card/50 border border-emerald-border/60">
              <h4 className="font-bold text-parchment-cream mb-1">
                ความแตกต่างหลักระหว่าง เรือประมงน้ำลึก (Supporter) กับ เรือสำราญทุกมรสุม (Founding 100)?
              </h4>
              <p>
                เรือประมงน้ำลึก (฿199/เดือน) จะปลดล็อกบทความทะเลน้ำลึกตามรอบสัปดาห์และข่าว Deepdive ทั้งหมด ส่วนเรือสำราญทุกมรสุม (฿3,990 จ่ายครั้งเดียวตลอดชีพ) จะปลดล็อกครบทั้ง 57 บทความทันทีโดยไม่ต้องรอรอบสัปดาห์ พร้อมรับ Master E-book 200+ หน้า
              </p>
            </div>
          </div>
        </div>
      </div>

      <FreeEbookModal
        isOpen={isEbookModalOpen}
        onClose={() => setIsEbookModalOpen(false)}
      />
    </div>
  );
}

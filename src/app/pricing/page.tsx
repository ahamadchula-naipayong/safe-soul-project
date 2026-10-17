'use client';

import React, { useState } from 'react';
import { FoundingCountdown } from '@/components/FoundingCountdown';
import { FreeEbookModal } from '@/components/FreeEbookModal';
import { mockFoundingQuota } from '@/lib/supabase/mockData';
import {
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle,
  ArrowRight,
  Flame,
  CreditCard,
  QrCode,
  Lock,
} from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState<'supporter_tier_2' | 'founding_tier_3'>('founding_tier_3');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleCheckout = async (tier: 'supporter_tier_2' | 'founding_tier_3') => {
    if (!checkoutEmail) {
      setSelectedTier(tier);
      const element = document.getElementById('checkout-box');
      element?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setCheckoutError('');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          orderType: 'subscription',
          customerEmail: checkoutEmail,
          priceId:
            tier === 'founding_tier_3'
              ? process.env.STRIPE_PRICE_FOUNDING_100
              : billingCycle === 'yearly'
              ? process.env.STRIPE_PRICE_YEARLY_SUPPORTER
              : process.env.STRIPE_PRICE_MONTHLY_SUPPORTER,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Stripe');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถเริ่มการชำระเงินได้';
      setCheckoutError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-deep/80 border border-gold/30 text-gold-light text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
            <span>ร่วมสนับสนุนและสร้างภูมิคุ้มกันทางจิตวิญญาณ</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-black text-parchment-cream">
            แผนสมาชิก & สิทธิพิเศษ 3 ระดับ
          </h1>

          <p className="text-sm sm:text-base text-parchment-muted max-w-xl mx-auto leading-relaxed">
            เลือกรูปแบบการสนับสนุนที่สอดคล้องกับเจตจำนงของคุณ พร้อมรับสิทธิ์การเข้าถึงคลังปัญญาและการเชื่อมต่อชุมชนคุณภาพ
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

        {/* Founding 100 Live Quota Visualizer */}
        <div id="founding-checkout" className="max-w-4xl mx-auto">
          <FoundingCountdown
            initialQuota={mockFoundingQuota}
            showCheckoutButton={false}
          />
        </div>

        {/* 3 Tiers Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* TIER 1: FREE MEMBER */}
          <div className="rounded-3xl p-6 sm:p-8 bg-emerald-card/60 border border-emerald-border/70 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-parchment-muted">
                  Tier 1
                </span>
                <h3 className="text-2xl font-serif font-bold text-parchment-cream mt-1">
                  Free Member
                </h3>
                <p className="text-xs text-parchment-muted mt-2">
                  สำหรับผู้เริ่มต้นศึกษาและต้องการทดลองอ่าน
                </p>
              </div>

              <div className="text-3xl font-serif font-black text-parchment-light">
                ฿0 <span className="text-xs font-sans text-parchment-muted">/ ตลอดชีพ</span>
              </div>

              <ul className="space-y-3.5 text-xs text-parchment-muted border-t border-emerald-border/40 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ดาวน์โหลด E-book 7 บทหลักฟรีทันที</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>เข้าถึงเนื้อหาบทที่ 1 - 3 ได้ฟรีตลอดชีพ</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>รับจดหมายข่าวสรุปแก่นปัญญาประจำเดือน</span>
                </li>
                <li className="flex items-center gap-2.5 text-parchment-muted/40">
                  <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px]">✕</span>
                  <span>ปลดล็อกบทที่ 4 - 35</span>
                </li>
                <li className="flex items-center gap-2.5 text-parchment-muted/40">
                  <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px]">✕</span>
                  <span>Discord & Telegram ชุมชนพิเศษ</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setIsEbookModalOpen(true)}
              className="mt-8 w-full py-3.5 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold/30 text-gold-light text-xs font-bold transition shadow-sm"
            >
              รับสิทธิ์ Free Member ทันที
            </button>
          </div>

          {/* TIER 2: SUPPORTER */}
          <div className="rounded-3xl p-6 sm:p-8 bg-emerald-surface/70 border-2 border-emerald-border/80 flex flex-col justify-between relative shadow-xl">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Tier 2 • ยอดนิยม
                </span>
                <h3 className="text-2xl font-serif font-bold text-parchment-cream mt-1">
                  Supporter
                </h3>
                <p className="text-xs text-parchment-muted mt-2">
                  ปลดล็อกคลังปัญญาครบวงจร ทั้งเสียงและบทความ
                </p>
              </div>

              <div className="text-3xl font-serif font-black text-gold-light">
                {billingCycle === 'monthly' ? '฿199' : '฿1,990'}
                <span className="text-xs font-sans text-parchment-muted">
                  {billingCycle === 'monthly' ? ' / เดือน' : ' / ปี (ประหยัด ฿398)'}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-parchment-cream/90 border-t border-emerald-border/40 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ปลดล็อกครบ 35 บท ทั้ง Easy และ Deep Mode</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ฟัง Sticky Podcast ความคมชัดสูงทุกตอน</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ดึงเข้า Discord พร้อมมอบบทบาท Supporter</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>รับลิงก์เข้ากลุ่ม Telegram พิเศษสำหรับผู้สนับสนุน</span>
                </li>
                <li className="flex items-center gap-2.5 text-parchment-muted/50">
                  <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px]">✕</span>
                  <span>E-book ฉบับเต็ม 240 หน้า (ต้องซื้อแยก ฿490)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('supporter_tier_2')}
              className="mt-8 w-full py-3.5 rounded-xl bg-gold-gradient text-slate-abyss text-xs font-bold hover:brightness-110 shadow-gold-sm transition"
            >
              เลือกแพ็กเกจ Supporter
            </button>
          </div>

          {/* TIER 3: FOUNDING 100 LIFETIME */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#1E3B2E] via-[#12261C] to-slate-card border-2 border-gold-warm flex flex-col justify-between relative shadow-gold-md">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gold-gradient text-slate-abyss text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-current text-red-700" />
              <span>เหลือ {mockFoundingQuota.remaining_slots} / 100 ที่</span>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-warm flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>Tier 3 • สิทธิพิเศษสูงสุดตลอดชีพ</span>
                </span>
                <h3 className="text-2xl font-serif font-bold text-parchment-light mt-1">
                  Founding 100 Lifetime
                </h3>
                <p className="text-xs text-parchment-muted mt-2">
                  ครั้งเดียวจบ เป็นผู้ร่วมก่อตั้งพร้อมสิทธิพิเศษพรีเมียมทุกมิติ
                </p>
              </div>

              <div className="text-3xl font-serif font-black text-gold-light">
                ฿3,990 <span className="text-xs font-sans text-parchment-muted">/ จ่ายครั้งเดียวตลอดชีพ</span>
              </div>

              <ul className="space-y-3.5 text-xs text-parchment-cream/95 border-t border-emerald-border/40 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>เข้าถึง 35 บทตลอดชีพ ทั้ง Easy & Deep Mode</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ดาวน์โหลด Full Master E-book 240 หน้าฟรี (ประทับตราอีเมล)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ส่วนลดพิเศษ 20% สำหรับสินค้า Physical Merch ทุกชิ้น</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>บทบาท Founding Member สีทองใน Discord ผ่าน Webhook อัตโนมัติ</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>ลิงก์เข้ากลุ่มลับ Telegram ส่วนตัวสำหรับผู้ร่วมก่อตั้ง</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('founding_tier_3')}
              className="mt-8 w-full py-3.5 rounded-xl bg-gold-gradient text-slate-abyss text-xs font-bold hover:brightness-110 shadow-gold-sm transition flex items-center justify-center gap-2"
            >
              <span>จองสิทธิ์ Founding 100 ทันที</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Checkout Execution Box */}
        <div id="checkout-box" className="max-w-xl mx-auto rounded-2xl p-6 sm:p-8 bg-emerald-card border border-gold/30 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-gold-warm text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>ระบบชำระเงินปลอดภัยผ่าน Stripe Checkout</span>
          </div>

          <h3 className="text-xl font-serif font-bold text-parchment-cream">
            ยืนยันอีเมลเพื่อเริ่มต้นชำระเงิน
          </h3>

          <div className="space-y-3">
            <label className="block text-xs text-parchment-muted">
              อีเมลของคุณ (สำหรับรับใบเสร็จ, สิทธิ์การเข้าถึง, Discord/Telegram invite)
            </label>
            <input
              type="email"
              required
              value={checkoutEmail}
              onChange={(e) => setCheckoutEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-sm text-parchment-cream outline-none"
            />

            <div className="flex items-center gap-4 text-xs text-parchment-muted pt-1">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>PromptPay QR</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-gold-warm" />
                <span>บัตรเครดิต / เดบิต</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-sky-400" />
                <span>Apple Pay / Google Pay</span>
              </span>
            </div>

            {checkoutError && (
              <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-500/30">
                {checkoutError}
              </p>
            )}

            <button
              onClick={() => handleCheckout(selectedTier)}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-sm hover:brightness-110 shadow-gold-sm transition flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-abyss border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    ดำเนินการชำระเงินสำหรับ{' '}
                    {selectedTier === 'founding_tier_3' ? 'Founding 100 (฿3,990)' : 'Supporter'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6 pt-8">
          <h3 className="text-2xl font-serif font-bold text-center text-parchment-cream flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-gold-warm" />
            <span>คำถามที่พบบ่อย (FAQ)</span>
          </h3>

          <div className="space-y-4 text-xs sm:text-sm text-parchment-muted">
            <div className="p-4 rounded-xl bg-emerald-card/50 border border-emerald-border/60">
              <h4 className="font-bold text-parchment-cream mb-1">
                การเชื่อมต่อ Discord และ Telegram ทำงานอย่างไรหลังชำระเงิน?
              </h4>
              <p>
                เมื่อคุณชำระเงินผ่าน Stripe สำเร็จ ระบบ Webhook หลังบ้านจะเชื่อมต่อกับ Discord Bot API โดยอัตโนมัติเพื่อมอบ Role ประจำ Tier ให้คุณทันที และสร้างลิงก์เชิญพิเศษเฉพาะคุณสำหรับเข้ากลุ่ม Telegram ส่วนตัว
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-card/50 border border-emerald-border/60">
              <h4 className="font-bold text-parchment-cream mb-1">
                ระบบ Watermark บน E-book ทำงานอย่างไร?
              </h4>
              <p>
                สำหรับผู้ซื้อ E-book หรือสมาชิก Founding 100 ระบบจะประทับตราอีเมลและรหัสคำสั่งซื้อของคุณลงบนหัวกระดาษของไฟล์ PDF ทุกหน้า เพื่อรับรองความเป็นเจ้าของลิขสิทธิ์เฉพาะคุณ
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-card/50 border border-emerald-border/60">
              <h4 className="font-bold text-parchment-cream mb-1">
                สามารถยกเลิกสมาชิกระดับ Supporter ได้ตลอดเวลาหรือไม่?
              </h4>
              <p>
                ยกเลิกได้ตลอดเวลาผ่านหน้าโปรไฟล์ของคุณ โดยสิทธิ์การเข้าถึงจะยังคงอยู่จนครบกำหนดรอบบิลนั้นๆ
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

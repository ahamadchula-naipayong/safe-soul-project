'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { mockProducts } from '@/lib/supabase/mockData';
import { TieredEmailTemplate } from '@/lib/emailTemplates';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Mail,
  CheckCircle2,
  Sparkles,
  Lock,
  Upload,
  QrCode,
  UserCheck,
} from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPriceThb,
    totalItemsCount,
  } = useCart();

  const { member, isLoggedIn, refreshSession } = useAuth();
  const router = useRouter();

  const [storeProducts, setStoreProducts] = useState<Product[]>(mockProducts);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [slipDataUrl, setSlipDataUrl] = useState('');
  const [slipFileName, setSlipFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successOrderMsg, setSuccessOrderMsg] = useState('');
  const [dispatchedEmailTemplate, setDispatchedEmailTemplate] =
    useState<TieredEmailTemplate | null>(null);

  // Sync member profile info into checkout fields
  useEffect(() => {
    if (member) {
      setCustomerEmail(member.email);
      setCustomerName((prev) => prev || member.name || member.username);
      setPhone((prev) => prev || member.phone || '');
    }
  }, [member]);

  // Load recommended store products when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/admin/store?publicOnly=true', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setStoreProducts(data.items);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const hasPhysical = items.some((item) => item.product.type === 'physical');
  const hasFreeEbook = items.some(
    (item) =>
      item.product.slug === 'fitrah-shield-shallow-ebook' ||
      item.product.price_thb === 0
  );

  // Recommended products not currently in the cart (and not Coming Soon stock=0 unless highlighted)
  const recommendedProducts = storeProducts.filter(
    (p) =>
      !items.some((c) => c.product.id === p.id) &&
      p.stock_quantity > 0 &&
      !(p.slug === 'fitrah-shield-shallow-ebook' && member?.ebookClaimed)
  );

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlipFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSlipDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGoToStore = () => {
    closeCart();
    router.push('/store');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessOrderMsg('');

    // 1. If cart contains the Free Shallow Waters E-Book, enforce member login & registered email
    if (hasFreeEbook) {
      if (!isLoggedIn || !member) {
        setErrorMessage(
          'กรุณาเข้าสู่ระบบสมาชิกก่อน เพื่อรับ E-Book ทางอีเมลที่ใช้สมัครสมาชิก (จำกัด 1 สิทธิ์/อีเมล)'
        );
        return;
      }
      if (member.ebookClaimed && items.length === 1) {
        setErrorMessage(
          `อีเมลที่สมัครสมาชิก (${member.email}) เคยใช้สิทธิ์รับ E-Book เล่มนี้ไปแล้ว (จำกัด 1 ครั้งต่ออีเมลที่สมัคร)`
        );
        return;
      }
    }

    const targetEmail = isLoggedIn && member ? member.email : customerEmail.trim();
    if (!targetEmail) {
      setErrorMessage('กรุณากรอกอีเมลสำหรับจัดส่งรายละเอียดคำสั่งซื้อ');
      return;
    }

    if (hasPhysical && (!customerName || !phone || !addressLine || !postalCode)) {
      setErrorMessage('กรุณากรอกข้อมูลชื่อ เบอร์โทร และที่อยู่จัดส่งสินค้าให้ครบถ้วน');
      return;
    }

    if (totalPriceThb > 0 && !slipDataUrl) {
      setErrorMessage('กรุณาแนบสลิปการโอนเงิน (QR PromptPay) เพื่อตรวจสอบผ่านระบบ EasySlip');
      return;
    }

    setIsLoading(true);

    try {
      // A. Verify slip via /api/verify-slip if totalPriceThb > 0
      if (totalPriceThb > 0 && slipDataUrl) {
        const slipRes = await fetch('/api/verify-slip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: slipDataUrl,
            expectedAmount: totalPriceThb,
          }),
        });
        const slipData = await slipRes.json();
        if (!slipRes.ok || !slipData.success) {
          setErrorMessage(slipData.error || 'การตรวจสอบสลิปไม่สำเร็จ กรุณาตรวจสอบไฟล์สลิป');
          setIsLoading(false);
          return;
        }
      }

      // B. If cart contains the Free E-Book and member hasn't claimed yet, dispatch via /api/ebook/claim
      if (hasFreeEbook && member && !member.ebookClaimed) {
        const claimRes = await fetch('/api/ebook/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: member.id }),
        });
        const claimData = await claimRes.json();
        if (!claimRes.ok || !claimData.success) {
          setErrorMessage(
            claimData.error || 'ไม่สามารถใช้สิทธิ์รับ E-Book ทางอีเมลได้ในขณะนี้'
          );
          setIsLoading(false);
          return;
        }
        if (claimData.emailTemplate) {
          setDispatchedEmailTemplate(claimData.emailTemplate);
        }
        await refreshSession();
      }

      clearCart();
      setSlipDataUrl('');
      setSlipFileName('');
      setSuccessOrderMsg(
        hasFreeEbook && totalPriceThb === 0
          ? `จัดส่งไฟล์ E-Book "เกราะพิทักษ์ฟิฏเราะฮฺ (ฉบับเกาะทะเลน้ำตื้น 73 หน้า)" ไปยังอีเมลที่สมัครสมาชิก (${targetEmail}) เรียบร้อยแล้ว!`
          : `บันทึกคำสั่งซื้อและหลักฐานการโอนเงิน (฿${totalPriceThb.toLocaleString()}) เรียบร้อยแล้ว! ระบบจะแจ้งสถานะทางอีเมล ${targetEmail}`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in font-thai">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-gradient-to-b from-[#102319] via-[#0C1913] to-[#08120D] border-l border-gold/30 shadow-2xl flex flex-col text-parchment-cream">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-emerald-border/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-gold-warm" />
              <div>
                <h3 className="font-thai-serif font-bold text-base sm:text-lg text-parchment-cream">
                  ตะกร้า Safe for Support ({totalItemsCount})
                </h3>
                <p className="text-[11px] text-parchment-muted">
                  ผลงานดิจิทัลส่งทางอีเมลสมาชิก & ของที่ระลึกโครงการ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGoToStore}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-surface/80 hover:bg-gold-warm hover:text-slate-abyss border border-gold-warm/40 text-gold-light text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>ไปหน้าร้านค้า</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={closeCart}
                className="p-1.5 text-parchment-muted hover:text-white rounded-full hover:bg-white/5 transition cursor-pointer"
                aria-label="ปิดตะกร้าสินค้า"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Success Banner + Email Preview if E-Book was just dispatched */}
            {successOrderMsg && (
              <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-400/50 space-y-3 animate-fade-in">
                <div className="flex items-start gap-2.5 text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                  <div className="space-y-1">
                    <div className="text-xs font-bold">ดำเนินการสำเร็จ!</div>
                    <p className="text-xs text-parchment-cream/95 leading-relaxed">
                      {successOrderMsg}
                    </p>
                  </div>
                </div>

                {dispatchedEmailTemplate && (
                  <div className="p-3.5 rounded-xl bg-black/65 border border-gold-warm/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-gold-warm font-bold">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>ตัวอย่างอีเมลที่จัดส่งถึงคุณ ({dispatchedEmailTemplate.tierBadge})</span>
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-parchment-cream">
                      หัวข้อ: {dispatchedEmailTemplate.subject}
                    </div>
                    <div className="text-[11px] text-emerald-300 font-mono">
                      ไฟล์แนบในอีเมล: 📎 {dispatchedEmailTemplate.attachmentFilename}
                    </div>
                    <pre className="text-[11px] text-parchment-muted whitespace-pre-wrap font-thai max-h-48 overflow-y-auto p-2.5 rounded-lg bg-black/60 border border-white/10 leading-relaxed">
                      {dispatchedEmailTemplate.bodyText}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Empty Cart State */}
            {items.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-emerald-dark/40 border border-emerald-border/50 space-y-3">
                <ShoppingBag className="w-11 h-11 mx-auto opacity-40 text-gold-warm" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-parchment-cream">
                    ยังไม่มีสินค้าในตะกร้าของคุณ
                  </p>
                  <p className="text-xs text-parchment-muted">
                    เลือกหยิบ E-Book ฉบับเกาะทะเลน้ำตื้น (พิเศษ ฿0 จาก ฿199 ส่งทางอีเมล) หรือชมสินค้าสนับสนุนด้านล่างได้เลย
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGoToStore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm transition cursor-pointer"
                >
                  <span>ไปยังหน้าร้านค้า Safe for Support</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const isOneTimeEbook =
                      item.product.slug === 'fitrah-shield-shallow-ebook' ||
                      item.product.price_thb === 0;

                    return (
                      <div
                        key={`${item.product.id}-${item.selectedSize}`}
                        className="p-3.5 rounded-2xl bg-emerald-dark/70 border border-emerald-border flex gap-3 items-start"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.product.image_url}
                          alt={item.product.title}
                          className="w-16 h-16 rounded-xl object-cover border border-gold/25 shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-parchment-cream leading-snug">
                            {item.product.title}
                          </h4>
                          {item.selectedSize && (
                            <p className="text-[11px] text-gold-warm">
                              ขนาดเสื้อ: {item.selectedSize}
                            </p>
                          )}

                          {/* Price Display with ฿199 -> ฿0 Free */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gold-light">
                              {item.product.price_thb === 0
                                ? 'ฟรี ฿0'
                                : `฿${item.product.price_thb.toLocaleString()}`}
                            </span>
                            {item.product.compare_at_price_thb && (
                              <span className="text-[11px] font-mono text-parchment-muted/60 line-through">
                                ฿{item.product.compare_at_price_thb.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {isOneTimeEbook ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gold-warm/15 border border-gold-warm/40 text-[10px] text-gold-light font-semibold">
                              <Mail className="w-3 h-3 text-gold-warm" />
                              <span>จำกัด 1 สิทธิ์ • ส่งเฉพาะอีเมลที่สมัครสมาชิก</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity - 1)
                                }
                                className="w-6 h-6 rounded bg-emerald-surface flex items-center justify-center text-parchment-muted hover:text-white cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-mono w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity + 1)
                                }
                                className="w-6 h-6 rounded bg-emerald-surface flex items-center justify-center text-parchment-muted hover:text-white cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-parchment-muted/60 hover:text-red-400 transition cursor-pointer"
                          title="ลบออกจากตะกร้า"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Email-Only Policy Notice for Digital E-Book */}
                {hasFreeEbook && (
                  <div className="p-3.5 rounded-2xl bg-gold-warm/10 border border-gold-warm/40 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-gold-light font-bold">
                      <Mail className="w-4 h-4 text-gold-warm shrink-0" />
                      <span>เงื่อนไขการรับ E-Book ฉบับเกาะทะเลน้ำตื้น (73 หน้า)</span>
                    </div>
                    <ul className="text-[11px] text-parchment-muted space-y-1 leading-relaxed">
                      <li>• จัดส่งเป็นไฟล์แนบทาง <strong>อีเมลที่ใช้สมัครสมาชิกเท่านั้น</strong></li>
                      <li>• <strong>ไม่มีปุ่มดาวน์โหลดโดยตรงบนหน้าเว็บไซต์</strong> และจำกัดการรับฟรีเพียง <strong>1 ครั้งต่อ 1 อีเมลสมาชิก</strong></li>
                    </ul>

                    {!isLoggedIn ? (
                      <div className="pt-1">
                        <Link
                          href="/login"
                          onClick={closeCart}
                          className="w-full py-2.5 px-3 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center justify-center gap-1.5 shadow-gold-sm"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>เข้าสู่ระบบ / สมัครสมาชิกฟรี เพื่อรับ E-Book ทางอีเมล</span>
                        </Link>
                      </div>
                    ) : member?.ebookClaimed ? (
                      <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-400/40 text-amber-200 text-[11px] font-medium">
                        ✓ บัญชีอีเมลของคุณ ({member.email}) ได้ใช้สิทธิ์รับ E-Book เล่มนี้ทางอีเมลไปแล้ว (จำกัด 1 ครั้ง)
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Checkout Form */}
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 pt-2 border-t border-emerald-border/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-warm">
                    ข้อมูลอีเมลผู้รับสิทธิ์ & การจัดส่ง
                  </h4>

                  <div>
                    <label className="block text-[11px] text-parchment-muted mb-1">
                      อีเมลที่สมัครสมาชิก (สำหรับจัดส่ง E-Book และใบเสร็จ) *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        readOnly={isLoggedIn && !!member}
                        value={isLoggedIn && member ? member.email : customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="กรุณาเข้าสู่ระบบเพื่อใช้อีเมลที่สมัครสมาชิก"
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isLoggedIn && member
                            ? 'bg-black/60 border-gold-warm/40 text-gold-light font-mono cursor-not-allowed'
                            : 'bg-emerald-dark border-emerald-border focus:border-gold-warm text-parchment-cream'
                        }`}
                      />
                      {isLoggedIn && member && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>อีเมลสมาชิก</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Physical shipping fields */}
                  {hasPhysical && (
                    <div className="space-y-2 pt-2 border-t border-emerald-border/40">
                      <div className="flex items-center gap-1.5 text-xs text-gold-warm font-semibold">
                        <Truck className="w-3.5 h-3.5" />
                        <span>ที่อยู่สำหรับจัดส่งสินค้า Official Merch</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="ชื่อ-นามสกุล ผู้รับ"
                          className="px-3 py-2 rounded-lg bg-emerald-dark border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream outline-none"
                        />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="เบอร์โทรศัพท์"
                          className="px-3 py-2 rounded-lg bg-emerald-dark border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream outline-none"
                        />
                      </div>

                      <textarea
                        required
                        rows={2}
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="บ้านเลขที่, หมู่บ้าน/อาคาร, ซอย, ถนน, ตำบล"
                        className="w-full px-3 py-2 rounded-lg bg-emerald-dark border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream outline-none resize-none"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          placeholder="จังหวัด"
                          className="px-3 py-2 rounded-lg bg-emerald-dark border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream outline-none"
                        />
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="รหัสไปรษณีย์"
                          className="px-3 py-2 rounded-lg bg-emerald-dark border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* PromptPay QR & EasySlip Upload when totalPriceThb > 0 */}
                  {totalPriceThb > 0 && (
                    <div className="p-3.5 rounded-2xl bg-black/55 border border-gold-warm/35 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-gold-light">
                        <span className="flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-gold-warm" />
                          <span>สแกน QR ร้านค้า (Premium Shopper 🤑)</span>
                        </span>
                        <span className="font-mono text-gold-warm">
                          ฿{totalPriceThb.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-2.5 p-3 rounded-xl bg-white text-slate-900 text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/qr/PremiumShopper.jpg"
                          alt="Premium Shopper PromptPay QR - นาย นรฤทธิ์ อหะหมัดจุฬา"
                          className="w-48 h-auto rounded-xl border border-slate-200 object-contain"
                        />
                        <div className="text-[11px] space-y-0.5 leading-snug">
                          <div className="font-bold text-emerald-900">
                            นาย นรฤทธิ์ อหะหมัดจุฬา (Premium Shopper 🤑)
                          </div>
                          <div className="font-semibold text-slate-800">
                            ยอดชำระสุทธิ: ฿{totalPriceThb.toLocaleString()} บาท (10% สมทบทุนการกุศล)
                          </div>
                          <div className="text-slate-600">
                            สแกนด้วยแอปธนาคารไทยได้ทุกธนาคาร แล้วแนบรูปสลิปด้านล่างเพื่อตรวจสอบ
                          </div>
                        </div>
                      </div>

                      <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-emerald-surface/80 hover:bg-emerald-surface border border-gold-warm/40 text-xs text-gold-light font-semibold cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5 text-gold-warm" />
                        <span>
                          {slipFileName
                            ? `แนบสลิปแล้ว: ${slipFileName}`
                            : 'อัปโหลดรูปสลิปโอนเงิน (ตรวจสอบผ่าน EasySlip)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSlipUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {errorMessage && (
                    <p className="text-xs text-red-300 bg-red-950/60 p-2.5 rounded-xl border border-red-500/40 leading-relaxed">
                      {errorMessage}
                    </p>
                  )}
                </form>
              </>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* RECOMMENDED PRODUCTS ("ช็อปต่อ • สินค้าแนะนำ")                    */}
            {/* ---------------------------------------------------------------- */}
            {recommendedProducts.length > 0 && (
              <div className="pt-4 border-t border-emerald-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold-light flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
                    <span>ช็อปต่อ • สินค้าแนะนำสำหรับคุณ</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGoToStore}
                    className="text-[11px] text-gold-warm hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>ดูร้านค้าทั้งหมด</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {recommendedProducts.slice(0, 3).map((prod) => (
                    <div
                      key={prod.id}
                      className="p-2.5 rounded-xl bg-black/45 border border-emerald-border/60 hover:border-gold-warm/40 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.image_url}
                          alt={prod.title}
                          className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-parchment-cream truncate">
                            {prod.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono">
                            <span className="font-bold text-gold-light">
                              {prod.price_thb === 0
                                ? 'ฟรี ฿0'
                                : `฿${prod.price_thb.toLocaleString()}`}
                            </span>
                            {prod.compare_at_price_thb && (
                              <span className="text-parchment-muted/50 line-through">
                                ฿{prod.compare_at_price_thb.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addToCart(
                            prod,
                            1,
                            prod.slug.includes('tee') ? 'L' : undefined
                          )
                        }
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-surface hover:bg-gold-warm hover:text-slate-abyss border border-gold-warm/40 text-gold-light text-[11px] font-bold transition cursor-pointer"
                      >
                        + ใส่ตะกร้า
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Subtotal & Submit CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-emerald-border/60 bg-emerald-dark/95 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-parchment-muted">ยอดชำระสุทธิ</span>
                <div className="text-right">
                  {hasFreeEbook && totalPriceThb === 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono text-parchment-muted/60 line-through">
                        ฿199
                      </span>
                      <span className="font-mono font-bold text-xl text-emerald-300">
                        ฟรี ฿0
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono font-bold text-xl text-gold-light">
                      ฿{totalPriceThb.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px] text-parchment-muted/85">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {totalPriceThb === 0
                      ? 'จัดส่งเข้าอีเมลที่สมัครสมาชิกเท่านั้น (จำกัด 1 ครั้ง)'
                      : 'ตรวจสอบสลิปโอนเงินด้วยระบบ EasySlip API'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleGoToStore}
                  className="text-gold-warm hover:underline font-semibold shrink-0 cursor-pointer"
                >
                  ช็อปต่อ →
                </button>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={
                  isLoading ||
                  (hasFreeEbook && !isLoggedIn) ||
                  (hasFreeEbook && items.length === 1 && !!member?.ebookClaimed)
                }
                className="w-full py-3 px-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs sm:text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-gold-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-abyss border-t-transparent rounded-full animate-spin" />
                ) : totalPriceThb === 0 ? (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>
                      ยืนยันรับ E-Book ทางอีเมลที่สมัคร ({member?.email || 'ต้องเข้าสู่ระบบ'})
                    </span>
                  </>
                ) : (
                  <>
                    <span>ยืนยันคำสั่งซื้อและส่งสลิปโอนเงิน</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  FileCheck,
} from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalPriceThb,
    totalItemsCount,
  } = useCart();

  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const hasPhysical = items.some((item) => item.product.type === 'physical');
  const hasDigital = items.some((item) => item.product.type === 'digital');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail) {
      setErrorMessage('กรุณากรอกอีเมลเพื่อรับใบเสร็จและลิขสิทธิ์ดิจิทัล');
      return;
    }
    if (hasPhysical && (!customerName || !phone || !addressLine || !postalCode)) {
      setErrorMessage('กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType: hasPhysical ? 'physical_merch' : 'digital_merch',
          customerEmail,
          customerName,
          items: items.map((i) => ({
            title: i.product.title + (i.selectedSize ? ` (${i.selectedSize})` : ''),
            amountThb: i.product.price_thb,
            quantity: i.quantity,
            imageUrl: i.product.image_url,
          })),
          shippingAddress: hasPhysical
            ? {
                recipientName: customerName,
                phone,
                addressLine,
                province,
                postalCode,
              }
            : undefined,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อระบบชำระเงินได้';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-gradient-to-b from-[#102319] via-[#0C1913] to-[#08120D] border-l border-gold/30 shadow-2xl flex flex-col text-parchment-cream">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-emerald-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold-warm" />
              <h3 className="font-serif font-bold text-lg text-parchment-cream">
                ตะกร้าสินค้า ({totalItemsCount})
              </h3>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-parchment-muted hover:text-white rounded-full hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-parchment-muted">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-gold-warm" />
                <p className="text-sm">ยังไม่มีสินค้าในตะกร้า</p>
                <button
                  onClick={closeCart}
                  className="mt-4 px-4 py-2 rounded-lg bg-emerald-surface hover:bg-emerald-light text-gold-light text-xs font-semibold transition"
                >
                  เลือกชมสินค้า
                </button>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="p-3 rounded-xl bg-emerald-dark/60 border border-emerald-border flex gap-3 items-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.image_url}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-lg object-cover border border-gold/20"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-parchment-cream line-clamp-1">
                        {item.product.title}
                      </h4>
                      {item.selectedSize && (
                        <p className="text-[11px] text-gold-warm">ไซส์: {item.selectedSize}</p>
                      )}
                      <p className="text-xs font-mono font-bold text-gold-light mt-0.5">
                        ฿{item.product.price_thb.toLocaleString()}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-emerald-surface flex items-center justify-center text-parchment-muted hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-emerald-surface flex items-center justify-center text-parchment-muted hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-parchment-muted/60 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Digital Delivery Watermark Notice */}
                {hasDigital && (
                  <div className="p-3 rounded-xl bg-gold-dim/20 border border-gold/30 text-xs text-parchment-muted space-y-1">
                    <div className="flex items-center gap-1.5 text-gold-warm font-semibold">
                      <FileCheck className="w-4 h-4" />
                      <span>Digital Delivery & Watermarking</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      ไฟล์ E-book / Audiobook จะได้รับการประทับตราลิขสิทธิ์ดิจิทัลด้วยอีเมลของคุณ เพื่อความปลอดภัยและรับรองความเป็นเจ้าของ
                    </p>
                  </div>
                )}

                {/* Checkout Input Form */}
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-warm">
                    ข้อมูลผู้สั่งซื้อ & ชำระเงิน
                  </h4>

                  <div>
                    <label className="block text-[11px] text-parchment-muted mb-1">
                      อีเมล (สำหรับรับลิงก์ดาวน์โหลดและใบเสร็จ) *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 rounded-lg bg-emerald-dark border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream outline-none"
                    />
                  </div>

                  {/* Physical shipping fields */}
                  {hasPhysical && (
                    <div className="space-y-2 pt-2 border-t border-emerald-border/40">
                      <div className="flex items-center gap-1.5 text-xs text-gold-warm font-semibold">
                        <Truck className="w-3.5 h-3.5" />
                        <span>ที่อยู่สำหรับจัดส่งสินค้า Physical Merch</span>
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

                  {errorMessage && (
                    <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-500/30">
                      {errorMessage}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>

          {/* Footer with Subtotal & Stripe CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-emerald-border/60 bg-emerald-dark/90 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-parchment-muted">ยอดรวมทั้งหมด</span>
                <span className="font-mono font-bold text-xl text-gold-light">
                  ฿{totalPriceThb.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-parchment-muted/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>รองรับ PromptPay (สแกน QR) และ บัตรเครดิต / Apple Pay ผ่าน Stripe</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-sm hover:brightness-110 shadow-gold-sm flex items-center justify-center gap-2 transition"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-abyss border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ไปสู่หน้าชำระเงิน Stripe Checkout</span>
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

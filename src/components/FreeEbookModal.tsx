'use client';

import React from 'react';
import Link from 'next/link';
import { X, BookOpen, Mail, ShoppingBag, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { mockProducts } from '@/lib/supabase/mockData';

interface FreeEbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FreeEbookModal({ isOpen, onClose }: FreeEbookModalProps) {
  const { addToCart } = useCart();
  const { member, isLoggedIn } = useAuth();

  if (!isOpen) return null;

  const shallowEbookProduct = mockProducts[0];

  const handleAddEbookToCart = () => {
    onClose();
    addToCart(shallowEbookProduct, 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in font-thai">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#11261B] via-[#0B1912] to-[#07100C] border border-gold/40 shadow-2xl overflow-hidden text-parchment-cream z-10">
        {/* Top Accent Banner */}
        <div className="h-1.5 w-full bg-gold-gradient" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-parchment-muted hover:text-white transition cursor-pointer"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dim/30 border border-gold/30 text-gold-light text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
            <span>DIGITAL SANCTUARY • จัดส่งทางอีเมลสมาชิกเท่านั้น</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-thai-serif font-bold text-parchment-cream leading-snug">
              รับ E-Book &ldquo;เกราะพิทักษ์ฟิฏเราะฮฺ&rdquo; (ฉบับเกาะทะเลน้ำตื้น 73 หน้า)
            </h3>
            <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed font-light">
              สรุปเนื้อหา 7 เกาะแห่งปัญญา (S.A.F.E. Series) ฉบับสมบูรณ์ 73 หน้า สำหรับอ่านทบทวนส่วนตัว จัดส่งเป็นไฟล์ดิจิทัลเข้าสู่อีเมลที่คุณใช้สมัครสมาชิกเท่านั้น (ไม่มีปุ่มดาวน์โหลดบนหน้าเว็บ)
            </p>
          </div>

          {/* Price & Policy Box */}
          <div className="p-4 rounded-2xl bg-black/50 border border-gold-warm/35 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs text-parchment-muted flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gold-warm" />
                <span>ราคาสินค้าดิจิทัลในตะกร้า</span>
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-parchment-muted/60 line-through">
                  ฿199
                </span>
                <span className="text-lg font-mono font-black text-emerald-300">
                  ฟรี ฿0 (สำหรับสมาชิก)
                </span>
              </div>
            </div>

            <ul className="text-xs text-parchment-muted space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-warm shrink-0 mt-0.5" />
                <span>
                  จัดส่งเฉพาะทาง <strong className="text-parchment-cream">อีเมลที่สมัครสมาชิกเท่านั้น</strong> (ไม่เปิดให้ดาวน์โหลดไฟล์โดยตรงจากหน้าเว็บ)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  ขอรับส่งเข้าอีเมลซ้ำได้ <strong className="text-emerald-300">ไม่จำกัดจำนวนครั้ง</strong> หากไม่ได้รับอีเมลหรือต้องการรับใหม่
                </span>
              </li>
            </ul>
          </div>

          {/* Action CTA (Always available - Unlimited re-send) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleAddEbookToCart}
              className="w-full py-3.5 px-6 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm hover:brightness-110 shadow-gold-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>หยิบใส่ตะกร้า (จาก ฿199 เหลือ ฟรี ฿0 • ส่งทางอีเมล)</span>
            </button>

            {!isLoggedIn && (
              <div className="text-center">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs text-gold-light hover:text-gold-warm underline"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>ยังไม่ได้เป็นสมาชิก? คลิกสมัครสมาชิกฟรีก่อนรับ E-Book</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

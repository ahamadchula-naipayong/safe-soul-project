'use client';

import React from 'react';
import Link from 'next/link';
import { Coffee, HeartHandshake, Globe, Sparkles, ShoppingBag, Crown } from 'lucide-react';

interface ArticleCoffeeSupportProps {
  articleTitle?: string;
  className?: string;
}

export function ArticleCoffeeSupport({
  articleTitle,
  className = '',
}: ArticleCoffeeSupportProps) {
  return (
    <section
      aria-label="ร่วมสนับสนุนเลี้ยงกาแฟและบริจาค 10% เพื่อการกุศล"
      className={`article-coffee-support rounded-3xl bg-gradient-to-b from-[#11261C] via-[#0B1912] to-[#07110C] border-2 border-gold-warm/45 p-6 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.65)] text-parchment-cream font-thai ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
        {/* Left Content: Message & 10% Charity Pledge */}
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-warm/20 border border-gold-warm/50 text-gold-light text-xs font-bold">
              <Coffee className="w-3.5 h-3.5 text-gold-warm" />
              <span>SUPPORT & BUY US A COFFEE</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-300" />
              <span>10% สมทบทุนเพื่อการกุศล</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-thai-serif font-black text-parchment-cream leading-snug">
            ร่วมสนับสนุนเลี้ยงกาแฟทีมงาน & ส่งต่อปัญญาเพื่อสังคม
          </h3>

          <p className="text-xs sm:text-sm text-parchment-cream/90 leading-relaxed font-light">
            หากบทความ{articleTitle ? ` “${articleTitle}” ` : 'นี้'}มอบแสงสว่าง มุมมองทางปัญญา หรือภูมิคุ้มกันทางจิตวิญญาณให้แก่คุณ คุณสามารถร่วมสนับสนุนการค้นคว้าและผลิตเนื้อหาของ{' '}
            <strong className="text-gold-light font-semibold">The Fitrah Shield (เกราะพิทักษ์ฟิฏเราะฮฺ)</strong>{' '}
            ได้ด้วยการสแกน QR Code <strong className="text-gold-warm">&ldquo;Coffee ☕&rdquo;</strong> ด้านข้าง
          </p>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/45 border border-emerald-border/70 space-y-1.5 text-xs">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-warm shrink-0" />
              <span>พันธสัญญาแห่งความจำเริญ (10% Charity Pledge):</span>
            </div>
            <p className="text-parchment-muted leading-relaxed">
              ทุกยอดการสนับสนุนเลี้ยงกาแฟ สมัครสมาชิก และสั่งซื้อสินค้า ทางโครงการจะหัก{' '}
              <strong className="text-gold-light underline decoration-gold-warm/50 underline-offset-4">
                10% เพื่อบริจาคสู่งานการกุศลและช่วยเหลือสังคม
              </strong>{' '}
              อย่างต่อเนื่อง
            </p>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs print:hidden">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold shadow-gold-sm transition hover:brightness-105"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>สมัครสมาชิกขึ้นเรือ (Ferry Ticket)</span>
            </Link>
            <Link
              href="/store"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-surface/80 hover:bg-emerald-surface border border-gold-warm/40 text-gold-light font-semibold transition"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-gold-warm" />
              <span>ร้านค้า Safe for Support</span>
            </Link>
            <a
              href="https://thefitrahshield.hardynaipayong.cloud"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-black/50 hover:bg-black/70 border border-white/10 text-parchment-muted hover:text-parchment-cream font-mono text-[11px] transition"
            >
              <Globe className="w-3.5 h-3.5 text-gold-warm" />
              <span>thefitrahshield.hardynaipayong.cloud</span>
            </a>
          </div>

          {/* Print-only URL info */}
          <div className="hidden print:block pt-2 text-xs text-black font-mono">
            เว็บไซต์ทางการ: https://thefitrahshield.hardynaipayong.cloud | บัญชี: นาย นรฤทธิ์ อหะหมัดจุฬา (PromptPay • Coffee ☕)
          </div>
        </div>

        {/* Right Content: Official "Cofffee" / "Coffee" QR Code */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-[268px] rounded-2xl bg-white p-3 text-slate-900 shadow-2xl border-2 border-gold-warm text-center space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/qr/Cofffee.jpg?v=2"
              alt="QR Code สำหรับเลี้ยงกาแฟ (Coffee - นาย นรฤทธิ์ อหะหมัดจุฬา)"
              className="w-full h-auto rounded-xl object-contain mx-auto [image-rendering:-webkit-optimize-contrast]"
            />
            <div className="pt-1 border-t border-slate-200 space-y-0.5">
              <div className="text-xs font-extrabold text-slate-900">
                สแกนเลี้ยงกาแฟทีมงาน (Coffee ☕)
              </div>
              <div className="text-[10px] text-slate-600">
                ร่วมบริจาค 10% เพื่อการกุศล • รับได้ทุกธนาคาร
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

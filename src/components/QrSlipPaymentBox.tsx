'use client';

import React, { useRef, useState } from 'react';
import { TierType } from '@/types';
import {
  QrCode,
  Upload,
  CheckCircle2,
  X,
  ShieldCheck,
  FileCheck,
  Copy,
  Check,
} from 'lucide-react';

// ============================================================================
// MOCKUP QR & BANK SETTINGS (แก้ไขเลขบัญชีหรือวางรูป QR จริงได้ที่นี่ก่อนต่อ Stripe)
// ============================================================================
export const PAYMENT_QR_CONFIG = {
  promptPayId: '08X-XXX-XXXX (PromptPay Mockup)',
  bankName: 'ธนาคารกสิกรไทย (KBANK - Mockup)',
  accountNumber: 'XXX-X-XXXXX-X',
  accountName: 'โครงการ เกราะพิทักษ์ฟิฏเราะฮฺ (The Fitrah Shield)',
  customQrImageUrl: '', // หากมีไฟล์ภาพ QR จริง สามารถใส่ path เช่น '/images/qr-promptpay.png' ได้ทันที
};

interface QrSlipPaymentBoxProps {
  tier: TierType;
  billingCycle?: 'monthly' | 'yearly';
  slipDataUrl: string;
  onSlipChange: (dataUrl: string, fileName?: string) => void;
}

export function QrSlipPaymentBox({
  tier,
  billingCycle = 'monthly',
  slipDataUrl,
  onSlipChange,
}: QrSlipPaymentBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slipFileName, setSlipFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (tier === 'free_tier_1') {
    return null;
  }

  const amount =
    tier === 'founding_tier_3'
      ? 3990
      : billingCycle === 'yearly'
      ? 1990
      : 199;

  const tierTitle =
    tier === 'founding_tier_3'
      ? 'เรือสำราญทุกมรสุม (Founding 100 • ตลอดชีพ)'
      : billingCycle === 'yearly'
      ? 'เรือประมงน้ำลึก (Supporter • รายปี)'
      : 'เรือประมงน้ำลึก (Supporter • รายเดือน)';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError('ขนาดไฟล์สลิปต้องไม่เกิน 5 MB กรุณาเลือกไฟล์ใหม่');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSlipFileName(file.name);
        onSlipChange(reader.result, file.name);
      }
    };
    reader.onerror = () => {
      setFileError('ไม่สามารถอ่านไฟล์ที่เลือกได้ กรุณาลองใหม่อีกครั้ง');
    };
    reader.readAsDataURL(file);
  };

  const handleCopyAccount = () => {
    navigator.clipboard?.writeText(PAYMENT_QR_CONFIG.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#11291E] via-[#0B1B13] to-[#07110C] border-2 border-gold-warm/50 p-5 sm:p-6 space-y-5 shadow-[0_0_35px_rgba(245,158,11,0.12)] animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gold-warm/30">
        <div className="flex items-center gap-2 text-gold-light text-xs sm:text-sm font-bold">
          <QrCode className="w-4 h-4 text-gold-warm" />
          <span>สแกน QR เพื่อชำระค่าขึ้นเรือ & แนบสลิปยืนยัน</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-gold-warm text-slate-abyss font-mono font-black text-xs">
          ยอดโอน ฿{amount.toLocaleString()}
        </span>
      </div>

      {/* Selected Category Summary */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-border/60 flex items-center justify-between gap-3 text-xs">
        <div>
          <div className="text-parchment-muted text-[11px]">หมวดหมู่ระดับสมาชิกที่เลือก:</div>
          <div className="font-bold text-gold-light mt-0.5">{tierTitle}</div>
        </div>
        <div className="text-right">
          <div className="text-parchment-muted text-[11px]">ยอดชำระสุทธิ</div>
          <div className="text-lg font-mono font-black text-emerald-300">
            ฿{amount.toLocaleString()}.00
          </div>
        </div>
      </div>

      {/* QR Code Card + Bank Details */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Crisp White PromptPay QR Box */}
        <div className="sm:col-span-5 flex justify-center">
          <div className="w-48 rounded-2xl bg-white p-3 text-slate-900 shadow-xl border-2 border-gold-warm/60 space-y-2 text-center">
            <div className="bg-[#113566] text-white text-[10px] font-bold py-1 px-2 rounded-lg tracking-wider uppercase">
              THAI QR PAYMENT
            </div>

            {PAYMENT_QR_CONFIG.customQrImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={PAYMENT_QR_CONFIG.customQrImageUrl}
                alt="PromptPay QR Code"
                className="w-36 h-36 mx-auto object-contain"
              />
            ) : (
              /* Crisp Deterministic SVG QR Mockup with Center Logo */
              <div className="relative w-36 h-36 mx-auto bg-white p-1 flex items-center justify-center">
                <svg viewBox="0 0 29 29" className="w-full h-full" shapeRendering="crispEdges">
                  <rect width="29" height="29" fill="#FFFFFF" />
                  {/* Top-left finder */}
                  <path d="M1,1 h7 v7 h-7 z M2,2 v5 h5 v-5 z M3,3 h3 v3 h-3 z" fill="#0B1B13" />
                  {/* Top-right finder */}
                  <path d="M21,1 h7 v7 h-7 z M22,2 v5 h5 v-5 z M23,3 h3 v3 h-3 z" fill="#0B1B13" />
                  {/* Bottom-left finder */}
                  <path d="M1,21 h7 v7 h-7 z M2,22 v5 h5 v-5 z M3,23 h3 v3 h-3 z" fill="#0B1B13" />
                  {/* Timing & Data modules */}
                  <path
                    d="M10,1 h2 v1 h-2 z M14,1 h1 v2 h-1 z M17,1 h2 v1 h-2 z
                       M9,3 h2 v2 h-2 z M13,3 h3 v1 h-3 z M18,3 h2 v2 h-2 z
                       M10,6 h1 v1 h-1 z M12,6 h1 v1 h-1 z M14,6 h1 v1 h-1 z M16,6 h1 v1 h-1 z M18,6 h1 v1 h-1 z
                       M1,10 h2 v2 h-2 z M5,10 h2 v1 h-2 z M8,9 h3 v2 h-3 z M19,9 h2 v3 h-2 z M23,10 h2 v2 h-2 z M26,9 h2 v2 h-2 z
                       M2,13 h3 v1 h-3 z M6,12 h1 v3 h-1 z M9,13 h2 v2 h-2 z M19,14 h3 v1 h-3 z M24,13 h4 v1 h-4 z
                       M1,16 h2 v2 h-2 z M4,16 h3 v1 h-3 z M8,17 h2 v2 h-2 z M18,17 h2 v2 h-2 z M22,16 h2 v2 h-2 z M26,16 h2 v3 h-2 z
                       M1,19 h1 v1 h-1 z M5,19 h2 v1 h-2 z M10,20 h3 v2 h-3 z M15,20 h2 v1 h-2 z M20,20 h3 v2 h-3 z M25,20 h2 v1 h-2 z
                       M9,23 h2 v2 h-2 z M13,22 h3 v2 h-3 z M17,23 h2 v3 h-2 z M21,23 h3 v2 h-3 z M26,22 h2 v2 h-2 z
                       M10,26 h2 v2 h-2 z M14,25 h2 v3 h-2 z M19,26 h3 v2 h-3 z M24,25 h4 v3 h-4 z"
                    fill="#0B1B13"
                  />
                </svg>
                <div className="absolute w-8 h-8 rounded-lg bg-[#0B1B13] border border-gold-warm p-1 flex items-center justify-center shadow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo/logo-transparent.png"
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="text-[10px] font-bold text-slate-700">
              PromptPay • ฿{amount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Account Transfer Details */}
        <div className="sm:col-span-7 space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-black/35 border border-white/10 space-y-1">
            <div className="text-[11px] text-parchment-muted">ชื่อบัญชีรับโอน</div>
            <div className="font-bold text-parchment-cream">{PAYMENT_QR_CONFIG.accountName}</div>
          </div>

          <div className="p-3 rounded-xl bg-black/35 border border-white/10 flex items-center justify-between gap-2">
            <div>
              <div className="text-[11px] text-parchment-muted">{PAYMENT_QR_CONFIG.bankName}</div>
              <div className="font-mono font-bold text-gold-light">{PAYMENT_QR_CONFIG.accountNumber}</div>
            </div>
            <button
              type="button"
              onClick={handleCopyAccount}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-surface hover:bg-emerald-light border border-gold-warm/30 text-gold-light text-[11px] font-semibold flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
            </button>
          </div>

          <p className="text-[11px] text-parchment-muted/75 font-light flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              โอนเงินตามยอดด้านบนและแนบไฟล์สลิปด้านล่างเพื่อให้แอดมินตรวจสอบ (ระบบจะเชื่อมต่อ Stripe อัตโนมัติในเฟสถัดไป)
            </span>
          </p>
        </div>
      </div>

      {/* File Upload Area for Payment Slip */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-bold text-gold-light flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-gold-warm" />
          <span>แนบไฟล์สลิปโอนเงินเพื่อตรวจสอบ (รูปภาพ JPG, PNG หรือ PDF) *</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!slipDataUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-5 rounded-2xl border-2 border-dashed border-gold-warm/45 hover:border-gold-light bg-black/30 hover:bg-emerald-surface/30 transition flex flex-col items-center justify-center gap-2 text-center cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gold-warm/15 border border-gold-warm/40 flex items-center justify-center text-gold-warm">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-parchment-cream">
              คลิกเพื่อเลือกไฟล์สลิปโอนเงินจากเครื่องของคุณ
            </div>
            <div className="text-[11px] text-parchment-muted/70">
              รองรับไฟล์ .JPG, .PNG, .WEBP หรือ .PDF (ไม่เกิน 5 MB)
            </div>
          </button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-400/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {slipDataUrl.startsWith('data:image') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slipDataUrl}
                  alt="ตัวอย่างสลิป"
                  className="w-14 h-14 rounded-xl object-cover border border-gold-warm/40 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-emerald-surface flex items-center justify-center text-emerald-300 font-mono text-xs font-bold shrink-0">
                  PDF
                </div>
              )}

              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>แนบหลักฐานสลิปเรียบร้อยแล้ว</span>
                </div>
                <div className="text-[11px] text-parchment-muted truncate mt-0.5">
                  {slipFileName || 'ไฟล์สลิปโอนเงิน'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/15 text-[11px] text-parchment-cream transition"
              >
                เปลี่ยนไฟล์
              </button>
              <button
                type="button"
                onClick={() => {
                  setSlipFileName('');
                  onSlipChange('', '');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/70 text-red-300 border border-red-500/30 transition"
                title="ลบไฟล์ที่แนบ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {fileError && <p className="text-xs text-red-400">{fileError}</p>}
      </div>
    </div>
  );
}

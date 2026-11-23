'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Share2,
  Printer,
  Check,
  Headphones,
  Pause,
  Lock,
  X,
  Minus,
  Plus,
  Type,
} from 'lucide-react';
import { useAudio, normalizeAudioUrl } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { checkOceanAudioAccess } from '@/lib/oceanAccess';
import { ArticleStatus } from '@/types';

export interface ArticleAudioTrack {
  id: string;
  title: string;
  seriesTitle: string;
  chapterNumber: number;
  audioUrl?: string;
  duration?: string;
  coverImage?: string;
  realm?: 'shallow' | 'deep';
  archipelagoNumber?: number;
  isUnlocked?: boolean;
  status?: ArticleStatus;
  publishedAt?: string;
}

interface ArticleActionToolbarProps {
  title: string;
  description?: string;
  audioTrack?: ArticleAudioTrack;
  className?: string;
}

const FONT_SCALE_STEPS = [0.88, 1, 1.12, 1.25, 1.4];
const FONT_SCALE_STORAGE_KEY = 'safesoul_reader_font_scale';

export function ArticleActionToolbar({
  title,
  description,
  audioTrack,
  className = '',
}: ArticleActionToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [fontScale, setFontScale] = useState<number>(1);

  const { member } = useAuth();
  const { playTrack, pauseTrack, currentTrack, isPlaying } = useAudio();

  // Initialize and sync font scale across toolbar instances
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = parseFloat(localStorage.getItem(FONT_SCALE_STORAGE_KEY) || '1');
      if (!isNaN(saved) && saved >= 0.8 && saved <= 1.6) {
        setFontScale(saved);
        document.documentElement.style.setProperty('--reader-font-scale', String(saved));
      }
    } catch {}

    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<number>;
      if (typeof custom.detail === 'number') {
        setFontScale(custom.detail);
      }
    };
    window.addEventListener('safesoul-font-scale', handleSync);
    return () => window.removeEventListener('safesoul-font-scale', handleSync);
  }, []);

  const updateFontScale = (nextScale: number) => {
    setFontScale(nextScale);
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--reader-font-scale', String(nextScale));
      try {
        localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(nextScale));
      } catch {}
      window.dispatchEvent(new CustomEvent('safesoul-font-scale', { detail: nextScale }));
    }
  };

  const handleDecreaseFont = () => {
    const idx = FONT_SCALE_STEPS.findIndex((s) => Math.abs(s - fontScale) < 0.03);
    const currentIdx = idx === -1 ? 1 : idx;
    const nextIdx = Math.max(0, currentIdx - 1);
    updateFontScale(FONT_SCALE_STEPS[nextIdx]);
  };

  const handleIncreaseFont = () => {
    const idx = FONT_SCALE_STEPS.findIndex((s) => Math.abs(s - fontScale) < 0.03);
    const currentIdx = idx === -1 ? 1 : idx;
    const nextIdx = Math.min(FONT_SCALE_STEPS.length - 1, currentIdx + 1);
    updateFontScale(FONT_SCALE_STEPS[nextIdx]);
  };

  const handleResetFont = () => {
    updateFontScale(1);
  };

  const inferredRealm: 'shallow' | 'deep' =
    audioTrack?.realm || (audioTrack?.id?.startsWith('oneshot') ? 'shallow' : 'deep');

  const resolvedAudioUrl = audioTrack
    ? normalizeAudioUrl(
        audioTrack.audioUrl ||
          (inferredRealm === 'shallow'
            ? `/audio/oneshot/island${audioTrack.chapterNumber}-full.mp3`
            : undefined),
        audioTrack.chapterNumber,
        audioTrack.id
      )
    : '';

  const isCurrentPlaying =
    !!audioTrack &&
    isPlaying &&
    (currentTrack?.id === audioTrack.id ||
      (!!resolvedAudioUrl && currentTrack?.audioUrl === resolvedAudioUrl));

  const audioAccess = audioTrack
    ? checkOceanAudioAccess({
        realm: inferredRealm,
        archipelagoNumber: audioTrack.archipelagoNumber,
        chapterNumber: audioTrack.chapterNumber,
        isUnlocked: audioTrack.isUnlocked ?? inferredRealm === 'shallow',
        status: audioTrack.status || 'published',
        publishedAt: audioTrack.publishedAt,
        member,
      })
    : null;

  const hasAudioAccess = !!audioAccess?.canAccess;

  const handleAudioClick = () => {
    if (!audioTrack) return;

    if (!hasAudioAccess) {
      setShowTierModal(true);
      return;
    }

    if (isCurrentPlaying) {
      pauseTrack();
    } else {
      playTrack({
        id: audioTrack.id,
        title: audioTrack.title,
        seriesTitle: audioTrack.seriesTitle,
        chapterNumber: audioTrack.chapterNumber,
        audioUrl: resolvedAudioUrl,
        duration: audioTrack.duration || '16:30',
        coverImage: audioTrack.coverImage,
      });
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handlePrint = () => {
    if (typeof window === 'undefined') return;

    // Extract clean article HTML from .markdown-sanctuary blocks on the current page
    const markdownNodes = Array.from(document.querySelectorAll('.markdown-sanctuary'));
    const sectionHeaders = Array.from(
      document.querySelectorAll('main section h3, #content-body h3')
    );

    let extractedHtml = '';
    if (markdownNodes.length > 0) {
      extractedHtml = markdownNodes
        .map((node, i) => {
          const parentSec = node.closest('section');
          const secH3 = parentSec?.querySelector('h3')?.textContent?.trim();
          const headingHtml = secH3 ? `<h2>${secH3}</h2>` : '';
          return `<div class="article-section">${headingHtml}${node.innerHTML}</div>`;
        })
        .join('<hr class="section-divider" />');
    } else {
      const mainEl =
        document.querySelector('#chapter-content') ||
        document.querySelector('#content-body') ||
        document.querySelector('article') ||
        document.querySelector('main');
      extractedHtml = mainEl ? mainEl.innerHTML : `<p>${description || ''}</p>`;
    }

    const origin = window.location.origin;
    const currentUrl = window.location.href;
    const qrUrl = `${origin}/images/qr/Cofffee.jpg?v=2`;

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlDoc = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>${title} | The Fitrah Shield (Plain Text PDF)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;600;700&family=Noto+Serif+Thai:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    * {
      box-sizing: border-box;
      color: black !important;
      background: transparent !important;
      text-shadow: none !important;
      box-shadow: none !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: white !important;
      color: black !important;
      font-family: 'Noto Sans Thai', 'Noto Serif Thai', serif;
      font-size: 12.5pt;
      line-height: 1.85;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-container {
      max-width: 740px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    .toolbar-no-print {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      margin-bottom: 24px;
      border: 1.5px solid black;
      border-radius: 8px;
      font-size: 11pt;
    }
    .toolbar-no-print button {
      padding: 8px 18px;
      border: 1.5px solid black;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      background: white !important;
    }
    @media print {
      .toolbar-no-print {
        display: none !important;
      }
      .page-container {
        padding: 0;
        max-width: 100%;
      }
    }
    .doc-header {
      border-bottom: 2px solid #000000;
      padding-bottom: 14px;
      margin-bottom: 24px;
    }
    .doc-brand {
      font-size: 9.5pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .doc-title {
      font-family: 'Noto Serif Thai', serif;
      font-size: 20pt;
      font-weight: 900;
      line-height: 1.3;
      margin: 0 0 8px 0;
    }
    .doc-desc {
      font-size: 11.5pt;
      margin: 0;
      font-style: italic;
    }
    h1, h2, h3, h4 {
      font-family: 'Noto Serif Thai', serif;
      font-weight: 700;
      line-height: 1.35;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h1 { font-size: 17pt; }
    h2 { font-size: 15pt; border-bottom: 1px solid #000; padding-bottom: 4px; }
    h3 { font-size: 13.5pt; }
    p {
      margin: 0 0 12px 0;
      text-align: justify;
    }
    ul, ol {
      margin: 0 0 14px 0;
      padding-left: 24px;
    }
    li {
      margin-bottom: 6px;
    }
    blockquote {
      margin: 14px 0;
      padding: 10px 16px;
      border-left: 3px solid #000000;
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 11pt;
    }
    th, td {
      border: 1px solid #000000;
      padding: 8px 10px;
      text-align: left;
    }
    .section-divider {
      border: 0;
      border-top: 1px dashed #000000;
      margin: 22px 0;
    }
    img:not(.qr-coffee-img) {
      max-width: 100%;
      height: auto;
      filter: grayscale(100%);
    }
    .support-footer {
      margin-top: 32px;
      padding: 18px 20px;
      border: 2px solid #000000;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      page-break-inside: avoid;
    }
    .support-text {
      flex: 1;
      font-size: 11pt;
      line-height: 1.65;
    }
    .support-text h4 {
      margin: 0 0 6px 0;
      font-size: 13pt;
      font-weight: 900;
    }
    .support-text p {
      margin: 0 0 6px 0;
      text-align: left;
    }
    .support-qr {
      width: 185px;
      text-align: center;
      flex-shrink: 0;
      border: 1px solid #000;
      padding: 8px;
      border-radius: 8px;
    }
    .support-qr img.qr-coffee-img {
      width: 165px;
      height: auto;
      display: block;
      margin: 0 auto 4px auto;
      image-rendering: -webkit-optimize-contrast;
    }
    .support-qr-caption {
      font-size: 8.5pt;
      font-weight: 700;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="toolbar-no-print">
      <span><strong>โหมดอ่านขาวดำสบายตา (Plain Text & PDF Export)</strong> • The Fitrah Shield</span>
      <button onclick="window.print()">🖨️ สั่งพิมพ์ / บันทึกเป็น PDF</button>
    </div>

    <header class="doc-header">
      <div class="doc-brand">THE FITRAH SHIELD • เกราะพิทักษ์ฟิฏเราะฮฺ (https://thefitrahshield.hardynaipayong.cloud)</div>
      <h1 class="doc-title">${title}</h1>
      ${description ? `<p class="doc-desc">${description}</p>` : ''}
    </header>

    <main class="doc-content">
      ${extractedHtml}
    </main>

    <footer class="support-footer">
      <div class="support-text">
        <h4>☕ ร่วมสนับสนุนเลี้ยงกาแฟทีมงาน & สมทบทุน 10% เพื่อการกุศล</h4>
        <p>
          ขอบคุณที่ร่วมเดินทางแสวงหาปัญญาและสร้างภูมิคุ้มกันทางจิตวิญญาณกับ <strong>The Fitrah Shield (เกราะพิทักษ์ฟิฏเราะฮฺ)</strong>
          หากบทความนี้เป็นประโยชน์ต่อคุณ สามารถสแกน QR Code <strong>"Coffee ☕"</strong> ด้านขวามือเพื่อร่วมสนับสนุนเลี้ยงกาแฟทีมงานได้ตามอัธยาศัย
        </p>
        <p>
          <strong>พันธสัญญาแห่งความจำเริญ:</strong> ทุกยอดการสนับสนุนเลี้ยงกาแฟ สมัครสมาชิก และสั่งซื้อสินค้า ทางโครงการหัก <strong>10% เพื่อบริจาคสู่งานการกุศล</strong> อย่างต่อเนื่อง
        </p>
        <p style="font-size: 9.5pt; margin-top: 6px;">
          🌐 ติดตามอ่านบทความ ฟังพอดแคสต์ และสำนักข่าวเพิ่มเติมได้ที่: <strong>https://thefitrahshield.hardynaipayong.cloud</strong><br/>
          🔗 ลิงก์บทความต้นฉบับ: ${currentUrl}
        </p>
      </div>
      <div class="support-qr">
        <img id="coffee-qr" class="qr-coffee-img" src="${qrUrl}" alt="Cofffee QR Code" />
        <div class="support-qr-caption">
          Coffee ☕ (เลี้ยงกาแฟ)<br/>
          นาย นรฤทธิ์ อหะหมัดจุฬา<br/>
          (บริจาค 10% เพื่อการกุศล)
        </div>
      </div>
    </footer>
  </div>
  <script>
    (function() {
      var img = document.getElementById('coffee-qr');
      function triggerPrint() {
        setTimeout(function() { window.print(); }, 250);
      }
      if (img && !img.complete) {
        img.onload = triggerPrint;
        img.onerror = triggerPrint;
      } else {
        triggerPrint();
      }
    })();
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlDoc);
    printWindow.document.close();
  };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 print:hidden ${className}`}>
        {/* 1. Font Size Adjuster (ปุ่มปรับไซส์ตัวหนังสือ ก- / ก+) */}
        <div
          className="inline-flex items-center rounded-xl bg-black/65 border border-white/15 p-0.5 shadow-sm"
          title="ปรับขนาดตัวอักษรเพื่ออรรถรสในการอ่าน"
        >
          <button
            type="button"
            onClick={handleDecreaseFont}
            disabled={fontScale <= FONT_SCALE_STEPS[0]}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold text-parchment-cream hover:text-gold-light hover:bg-emerald-surface/80 disabled:opacity-35 transition cursor-pointer flex items-center gap-0.5"
            aria-label="ลดขนาดตัวอักษร"
            title="ลดขนาดตัวหนังสือ (ก-)"
          >
            <Type className="w-3 h-3 text-gold-warm" />
            <Minus className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleResetFont}
            className="hidden sm:inline-block px-2 py-1 text-[11px] font-mono font-bold text-gold-light hover:text-gold-warm transition cursor-pointer"
            title="คลิกเพื่อรีเซ็ตขนาดตัวอักษรมาตรฐาน (100%)"
          >
            {Math.round(fontScale * 100)}%
          </button>

          <button
            type="button"
            onClick={handleIncreaseFont}
            disabled={fontScale >= FONT_SCALE_STEPS[FONT_SCALE_STEPS.length - 1]}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold text-parchment-cream hover:text-gold-light hover:bg-emerald-surface/80 disabled:opacity-35 transition cursor-pointer flex items-center gap-0.5"
            aria-label="เพิ่มขนาดตัวอักษร"
            title="เพิ่มขนาดตัวหนังสือ (ก+)"
          >
            <Type className="w-3.5 h-3.5 text-gold-warm" />
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* 2. Audio Podcast Button (Icon-only on narrow mobile portrait, icon+text on sm+) */}
        {audioTrack && (
          <button
            type="button"
            onClick={handleAudioClick}
            aria-label={isCurrentPlaying ? 'หยุดเสียงพอดแคสต์' : 'ฟังเสียงพอดแคสต์'}
            className={`inline-flex items-center justify-center gap-2 p-2.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-semibold transition shadow-sm group cursor-pointer ${
              isCurrentPlaying
                ? 'bg-gold-warm text-slate-abyss border-gold-light shadow-gold-sm'
                : 'bg-black/60 hover:bg-emerald-surface/90 border-white/15 hover:border-gold-warm/50 text-parchment-cream hover:text-gold-light'
            }`}
            title={audioAccess?.badgeText || 'ฟังเสียงบรรยายบทความ'}
          >
            {isCurrentPlaying ? (
              <>
                <Pause className="w-4 h-4 sm:w-3.5 sm:h-3.5 fill-current" />
                <span className="hidden sm:inline">หยุดเสียง</span>
              </>
            ) : (
              <>
                <Headphones className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gold-warm group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">ฟังเสียงพอดแคสต์</span>
                {!hasAudioAccess && <Lock className="w-3 h-3 text-parchment-muted/80 ml-0.5" />}
              </>
            )}
          </button>
        )}

        {/* 3. Share Button (Icon-only on narrow mobile portrait, icon+text on sm+) */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="แชร์บทความ"
          className="inline-flex items-center justify-center gap-1.5 p-2.5 sm:px-3 sm:py-2 rounded-xl bg-black/60 hover:bg-emerald-surface/90 border border-white/15 hover:border-gold-warm/50 text-xs text-parchment-cream hover:text-gold-light transition shadow-sm group cursor-pointer"
          title="แชร์บทเรียนนี้สู่เครือข่ายสังคม หรือคัดลอกลิงก์"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-emerald-300 font-medium">คัดลอกแล้ว!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gold-warm group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">แชร์</span>
            </>
          )}
        </button>

        {/* 4. Print / B&W Plain-Text PDF Export Button (Icon-only on narrow mobile portrait, icon+text on sm+) */}
        <button
          type="button"
          onClick={handlePrint}
          aria-label="พิมพ์ หรือ บันทึกเป็น PDF"
          className="inline-flex items-center justify-center gap-1.5 p-2.5 sm:px-3 sm:py-2 rounded-xl bg-black/60 hover:bg-emerald-surface/90 border border-white/15 hover:border-gold-warm/50 text-xs text-parchment-cream hover:text-gold-light transition shadow-sm group cursor-pointer"
          title="ส่งออกบทความแบบ Plain Text ขาวดำอ่านสบายตา พร้อม QR เลี้ยงกาแฟท้ายบทความ"
        >
          <Printer className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gold-warm group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">พิมพ์ / PDF</span>
        </button>
      </div>

      {/* Tier Gate Modal for Audio */}
      {showTierModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#132B20] to-[#0A1711] border-2 border-gold-warm/60 p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <button
              type="button"
              onClick={() => setShowTierModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/80 text-parchment-muted hover:text-white transition"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-warm/20 border border-gold-warm/50 flex items-center justify-center text-gold-warm shadow-gold-sm">
              <Headphones className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-thai-serif font-black text-parchment-cream">
                {inferredRealm === 'shallow'
                  ? 'เข้าสู่ระบบฟรีเพื่อฟังเสียงครบ 7 เกาะน้ำตื้น'
                  : 'สิทธิ์การฟังเสียงทะเลน้ำลึก'}
              </h3>
              <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                {inferredRealm === 'shallow' ? (
                  <>
                    ผู้ที่ไม่เข้าสู่ระบบสามารถเปิดฟังเสียงได้ใน{' '}
                    <strong className="text-gold-light">ทะเลน้ำตื้น 3 เกาะแรก (เกาะที่ 1–3)</strong>{' '}
                    ส่วนเกาะที่ 4–7 เพียงเข้าสู่ระบบหรือสมัครสมาชิกฟรี (
                    <strong className="text-emerald-300">เรือประมงน้ำตื้น</strong>)
                    ก็สามารถฟังเสียงได้ครบทั้ง 7 เกาะทันที
                  </>
                ) : (
                  <>
                    เสียงพอดแคสต์บรรยายใน <strong className="text-cyan-300">ทะเลน้ำลึก</strong>{' '}
                    เปิดให้ตามสิทธิ์แพ็กเกจของสมาชิก{' '}
                    <strong className="text-cyan-300">เรือประมงน้ำลึก (Supporter ฿199/ด)</strong> และ{' '}
                    <strong className="text-gold-light">
                      เรือสำราญทุกมรสุม (Founding 100 Lifetime)
                    </strong>
                  </>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-gold-warm/30 text-xs text-parchment-muted text-left space-y-1">
              <div>• <strong className="text-gold-light">ไม่เข้าสู่ระบบ:</strong> ฟังฟรี ทะเลน้ำตื้น 3 เกาะแรก (เกาะที่ 1–3)</div>
              <div>• <strong className="text-emerald-300">สมาชิกฟรี (เรือประมงน้ำตื้น):</strong> ฟังครบทั้ง 7 เกาะทะเลน้ำตื้น</div>
              <div>• <strong className="text-cyan-300">Supporter / Founding 100:</strong> ฟังครบ 7 เกาะน้ำตื้น + ทะเลน้ำลึกตามสิทธิ์แพ็กเกจ</div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={audioAccess?.actionHref || (inferredRealm === 'shallow' ? '/login' : '/pricing')}
                onClick={() => setShowTierModal(false)}
                className="w-full py-3 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold shadow-gold-sm transition text-center"
              >
                {audioAccess?.actionLabel ||
                  (inferredRealm === 'shallow'
                    ? 'เข้าสู่ระบบ / สมัครสมาชิกฟรี'
                    : 'ดูแผนสมาชิกและอัปเกรด')}
              </Link>
              <button
                type="button"
                onClick={() => setShowTierModal(false)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-parchment-cream text-xs font-semibold transition"
              >
                ไว้คราวหลัง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { X, BookOpen, Download, CheckCircle2, Sparkles } from 'lucide-react';

interface FreeEbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FreeEbookModal({ isOpen, onClose }: FreeEbookModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#13281E] via-[#0D1D16] to-[#0B1310] border border-gold/40 shadow-2xl text-parchment-cream">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-parchment-muted hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2 text-gold-warm text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Tier 1: Free Member Privilege</span>
            </div>

            <h3 className="text-2xl font-serif font-bold text-parchment-cream mb-2">
              รับฟรีทันที! E-book 7 บทหลัก
            </h3>
            <p className="text-sm text-parchment-muted mb-6 leading-relaxed">
              ก้าวแรกสู่การสร้างภูมิคุ้มกันทางจิตวิญญาณ ดาวน์โหลดสรุปแก่นความคิด 7 บทแรกจากโปรเจกต์
              <span className="text-gold-light font-semibold"> The Safe Soul (4 มิติแห่งปัญญา)</span> ส่งตรงถึงอีเมลของคุณ
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-parchment-muted mb-1">
                  ชื่อของคุณ (สำหรับประทับตราดิจิทัล)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจสงบ"
                  className="w-full px-4 py-2.5 rounded-lg bg-emerald-dark/80 border border-emerald-border focus:border-gold-warm focus:ring-1 focus:ring-gold-warm text-parchment-cream text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-parchment-muted mb-1">
                  อีเมล (รับลิงก์ดาวน์โหลดฉบับเต็ม)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-emerald-dark/80 border border-emerald-border focus:border-gold-warm focus:ring-1 focus:ring-gold-warm text-parchment-cream text-sm outline-none transition"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-deep/40 border border-gold/20 text-xs text-parchment-muted flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-gold-warm shrink-0" />
                <span>ฟรีสมาชิก Tier 1: ปลดล็อกการอ่านบทที่ 1-3 บนเว็บไซต์ได้ทันทีตลอดชีพ</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-sm hover:brightness-110 shadow-gold-sm transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-abyss border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลด E-book ฟรี (PDF)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 border border-gold-warm flex items-center justify-center text-gold-light animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-gold-warm" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-parchment-cream mb-2">
              ยินดีต้อนรับสู่ The Safe Soul
            </h3>
            <p className="text-sm text-parchment-muted mb-6 max-w-sm mx-auto">
              ระบบได้ส่งลิงก์ดาวน์โหลด E-book 7 บทหลักไปยังอีเมล <strong className="text-gold-light">{email}</strong> แล้ว พร้อมเปิดสิทธิ์สมาชิก Free Member เรียบร้อย
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/articles/art-of-self-awareness"
                className="py-2.5 px-5 rounded-lg bg-emerald-surface hover:bg-emerald-light border border-gold/30 text-gold-light font-semibold text-xs transition"
              >
                เริ่มอ่านบทที่ 1 ทันที
              </a>
              <button
                onClick={onClose}
                className="py-2.5 px-5 rounded-lg bg-white/10 hover:bg-white/20 text-parchment-cream text-xs font-semibold transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

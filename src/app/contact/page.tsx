'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ContactCategory } from '@/types';
import {
  Mail,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Crown,
  Send,
  CheckCircle2,
  Phone,
  Clock,
  Globe,
  Compass,
  ExternalLink,
  User,
} from 'lucide-react';

// ============================================================================
// MOCKUP CONTACT SETTINGS (สามารถแก้ไขข้อมูลช่องทางติดต่อจริงได้ที่นี่ในภายหลัง)
// ============================================================================
const MOCKUP_CONTACT_INFO = {
  officialEmail: 'contact@thefitrahshield.com',
  supportPhone: '02-XXX-XXXX / 08X-XXX-XXXX (Mockup)',
  lineOfficial: '@thefitrahshield (Mockup)',
  workingHours: 'วันจันทร์ – วันศุกร์ เวลา 09:00 – 18:00 น. (ตอบกลับอีเมลภายใน 24–48 ชม.)',
  locationNote: 'The Fitrah Shield Digital Sanctuary • Bangkok, Thailand (Mockup)',
};

const CATEGORY_OPTIONS: {
  value: ContactCategory;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: 'discussion',
    label: 'พูดคุย / แลกเปลี่ยน',
    desc: 'พูดคุยทั่วไป แลกเปลี่ยนมุมมองความรู้ หรือส่งกำลังใจให้ทีมงาน',
    icon: MessageSquare,
  },
  {
    value: 'request',
    label: 'ร้องขอเนื้อหา / เสนอแนะ',
    desc: 'เสนอหัวข้อบทความ ข่าวสาร พอดแคสต์ หรือฟีเจอร์ที่อยากให้จัดทำ',
    icon: Sparkles,
  },
  {
    value: 'complaint',
    label: 'ร้องเรียน / แจ้งปัญหา',
    desc: 'แจ้งข้อผิดพลาดของเนื้อหา ปัญหาการใช้งานเว็บไซต์ หรือข้อร้องเรียน',
    icon: AlertTriangle,
  },
  {
    value: 'membership',
    label: 'เรื่องสมาชิก / การชำระเงิน',
    desc: 'สอบถามสิทธิ์ระดับเรือ แจ้งปัญหาการโอนเงิน หรืออัปเกรดสมาชิก',
    icon: Crown,
  },
];

export default function ContactPage() {
  const { member } = useAuth();

  const [category, setCategory] = useState<ContactCategory>('discussion');
  const [name, setName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    replyEmail: string;
    subject: string;
  } | null>(null);

  // Pre-fill member info if logged in
  useEffect(() => {
    if (member) {
      if (!name) setName(member.name || '');
      if (!replyEmail) setReplyEmail(member.email || '');
      if (!phone && member.phone) setPhone(member.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !replyEmail.trim() || !message.trim()) {
      setError('กรุณากรอกชื่อ อีเมลของคุณสำหรับติดต่อกลับ และข้อความให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          name: name.trim(),
          replyEmail: replyEmail.trim(),
          phone: phone.trim(),
          subject:
            subject.trim() ||
            `[${CATEGORY_OPTIONS.find((c) => c.value === category)?.label}] จากคุณ ${name.trim()}`,
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง');
      } else {
        setSubmittedData({
          id: data.item.id,
          replyEmail: data.item.replyEmail,
          subject: data.item.subject,
        });
        setSubject('');
        setMessage('');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSubmitting(false);
    }
  };

  const mailtoHref = `mailto:${MOCKUP_CONTACT_INFO.officialEmail}?subject=${encodeURIComponent(
    `[${CATEGORY_OPTIONS.find((c) => c.value === category)?.label}] ${subject || 'ติดต่อทีมงาน The Fitrah Shield'}`
  )}&body=${encodeURIComponent(
    `ชื่อผู้ติดต่อ: ${name}\nอีเมลสำหรับตอบกลับ: ${replyEmail}\nเบอร์โทรศัพท์: ${phone || '-'}\n\nรายละเอียด:\n${message}`
  )}`;

  return (
    <div className="min-h-screen bg-[#08110D] text-parchment-cream font-thai selection:bg-gold-warm selection:text-slate-abyss py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-parchment-muted border-b border-emerald-border/40 pb-4">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-gold-light transition">
            <Compass className="w-3.5 h-3.5 text-gold-warm" />
            <span>หน้าแรก</span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-gold-light font-semibold">ติดต่อเรา (Contact Sanctuary)</span>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-card/80 border border-gold-warm/40 text-gold-light text-xs font-semibold shadow-gold-sm">
            <Mail className="w-3.5 h-3.5 text-gold-warm" />
            <span>CONTACT US • ช่องทางสื่อสารและรับฟังเสียงจากสหายร่วมทาง</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-thai-serif font-black text-parchment-cream">
            ติดต่อทีมงาน เกราะพิทักษ์ฟิฏเราะฮฺ
          </h1>

          <p className="text-sm sm:text-base text-parchment-muted font-light leading-relaxed">
            ร่วมพูดคุยแลกเปลี่ยน ร้องขอหัวข้อบทความที่สนใจ แจ้งปัญหาการใช้งาน หรือส่งเรื่องร้องเรียนถึงทีมงานโดยตรง
            เพียงระบุอีเมลของคุณ เราจะส่งอีเมลตอบกลับไปยังที่อยู่อีเมลของคุณโดยเร็วที่สุด
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Mockup Contact Channels */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#11261C] via-[#0B1912] to-[#07100C] border border-gold-warm/35 shadow-xl space-y-6">
              <div className="space-y-1.5 border-b border-emerald-border/50 pb-4">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono uppercase">
                  Mockup Channels • ปรับแต่งภายหลังได้
                </span>
                <h2 className="text-xl font-thai-serif font-bold text-gold-light">
                  ข้อมูลช่องทางติดต่อหลัก
                </h2>
                <p className="text-xs text-parchment-muted font-light">
                  ช่องทางอย่างเป็นทางการของโครงการ The Fitrah Shield
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/35 border border-emerald-border/40">
                  <Mail className="w-5 h-5 text-gold-warm shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-parchment-muted">อีเมลทางการ (Official Email)</div>
                    <div className="font-mono font-semibold text-gold-light break-all">
                      {MOCKUP_CONTACT_INFO.officialEmail}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/35 border border-emerald-border/40">
                  <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-parchment-muted">Line Official / ชุมชนสนทนา</div>
                    <div className="font-semibold text-parchment-cream">
                      {MOCKUP_CONTACT_INFO.lineOfficial}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/35 border border-emerald-border/40">
                  <Phone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-parchment-muted">โทรศัพท์ประสานงาน</div>
                    <div className="font-mono font-semibold text-parchment-cream">
                      {MOCKUP_CONTACT_INFO.supportPhone}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/35 border border-emerald-border/40">
                  <Clock className="w-5 h-5 text-gold-warm shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-parchment-muted">เวลาทำการ & การตอบกลับ</div>
                    <div className="text-parchment-cream/90 font-light leading-relaxed">
                      {MOCKUP_CONTACT_INFO.workingHours}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/35 border border-emerald-border/40">
                  <Globe className="w-5 h-5 text-gold-light shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-parchment-muted">สำนักพิมพ์ดิจิทัล</div>
                    <div className="text-parchment-cream/90 font-light">
                      {MOCKUP_CONTACT_INFO.locationNote}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Email / Request / Complaint Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0E2218] via-[#091510] to-[#060D0A] border border-gold-warm/40 shadow-2xl space-y-6">
              {submittedData ? (
                <div className="py-10 text-center space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-2xl font-thai-serif font-black text-parchment-cream">
                      ส่งข้อความถึงทีมงานเรียบร้อยแล้ว!
                    </h3>
                    <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                      ระบบได้บันทึกเรื่อง <strong>&ldquo;{submittedData.subject}&rdquo;</strong> ของคุณเข้าสู่กล่องข้อความหลังบ้านแล้ว
                      ทีมงานจะพิจารณาและส่งอีเมลตอบกลับไปยัง{' '}
                      <strong className="text-gold-light font-mono">{submittedData.replyEmail}</strong> โดยเร็วที่สุดครับ
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmittedData(null)}
                      className="px-6 py-3 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs shadow-gold-sm"
                    >
                      ส่งข้อความเรื่องอื่นเพิ่มเติม
                    </button>
                    <Link
                      href="/journey"
                      className="px-5 py-3 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-emerald-border text-parchment-cream text-xs font-semibold transition"
                    >
                      ไปหน้าคลังบทความ Safe for Journey
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                      ส่งอีเมล / แจ้งเรื่องถึงทีมงาน
                    </h2>
                    <p className="text-xs text-parchment-muted font-light">
                      เลือกหมวดหมู่เรื่องที่ต้องการติดต่อ พร้อมระบุอีเมลของคุณเพื่อให้เราติดต่อกลับ
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Category Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gold-light block">
                      1. เลือกประเภทเรื่องที่ติดต่อ *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CATEGORY_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = category === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setCategory(opt.value)}
                            className={`p-3.5 rounded-2xl text-left border transition flex items-start gap-3 ${
                              active
                                ? 'bg-gold-warm/15 border-gold-warm text-parchment-cream shadow-gold-sm'
                                : 'bg-black/35 border-emerald-border/50 text-parchment-muted hover:border-gold-warm/40 hover:text-parchment-cream'
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                active ? 'text-gold-warm' : 'text-parchment-muted'
                              }`}
                            />
                            <div>
                              <div className={`text-xs font-bold ${active ? 'text-gold-light' : ''}`}>
                                {opt.label}
                              </div>
                              <div className="text-[11px] text-parchment-muted/80 font-light mt-0.5 leading-snug">
                                {opt.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gold-warm" />
                        <span>ชื่อ-นามสกุล หรือนามแฝง *</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="เช่น คุณอะหมัด หรือ สหายผู้เดินทาง"
                        className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-sm text-parchment-cream placeholder:text-parchment-muted/40"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gold-warm" />
                        <span>เบอร์โทรศัพท์ (ไม่บังคับ)</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08X-XXX-XXXX"
                        className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-sm text-parchment-cream placeholder:text-parchment-muted/40"
                      />
                    </div>
                  </div>

                  {/* Reply-To Email (Highlighted clearly per user requirement) */}
                  <div className="p-4 rounded-2xl bg-emerald-950/50 border border-gold-warm/40 space-y-2">
                    <label className="text-xs font-bold text-gold-light flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-gold-warm" />
                      <span>อีเมลของคุณ (สำหรับให้ทีมงานส่งอีเมลตอบกลับ) *</span>
                    </label>
                    <input
                      type="email"
                      value={replyEmail}
                      onChange={(e) => setReplyEmail(e.target.value)}
                      placeholder="your-email@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#07110C] border border-gold-warm/40 focus:border-gold-light focus:outline-none text-sm text-parchment-cream placeholder:text-parchment-muted/40"
                      required
                    />
                    <p className="text-[11px] text-gold-light/80 font-light">
                      * โปรดตรวจสอบความถูกต้องของอีเมล — เมื่อทีมงานพิจารณาเรื่องของคุณแล้ว เราจะส่งอีเมลตอบกลับไปยังอีเมลนี้โดยตรง
                    </p>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gold-light">
                      หัวข้อเรื่อง (Subject) *
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="สรุปเรื่องที่ต้องการติดต่อสั้นๆ..."
                      className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-sm text-parchment-cream placeholder:text-parchment-muted/40"
                      required
                    />
                  </div>

                  {/* Message Body */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gold-light">
                      รายละเอียดข้อความ (การพูดคุย / ร้องขอ / ร้องเรียน) *
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="พิมพ์รายละเอียดที่คุณต้องการแจ้งหรือพูดคุยกับทีมงานได้เลยครับ..."
                      className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-sm text-parchment-cream placeholder:text-parchment-muted/40 leading-relaxed"
                      required
                    />
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3.5 px-6 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm flex items-center justify-center gap-2 transition hover:brightness-105 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'กำลังส่งข้อความ...' : 'ส่งเรื่องถึงทีมงาน (และรับอีเมลตอบกลับ)'}</span>
                    </button>

                    <a
                      href={mailtoHref}
                      className="py-3.5 px-5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-gold-warm/40 text-gold-light text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      title="เปิดแอปอีเมลบนเครื่องของคุณเพื่อส่งอีเมลโดยตรง"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gold-warm" />
                      <span>ส่งผ่านแอปอีเมลโดยตรง</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

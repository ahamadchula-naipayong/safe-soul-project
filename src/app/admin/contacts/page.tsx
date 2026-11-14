'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContactMessage, ContactCategory } from '@/types';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Crown,
  CheckCircle2,
  Trash2,
  Send,
  Phone,
  Clock,
} from 'lucide-react';

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<'all' | ContactCategory>('all');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setMessages(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateStatus = async (id: string, status: 'new' | 'read' | 'replied') => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('อัปเดตสถานะข้อความแล้ว');
        loadMessages();
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ยืนยันการลบข้อความติดต่อนี้?')) return;
    try {
      const res = await fetch(`/api/contact?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('ลบข้อความเรียบร้อยแล้ว');
        loadMessages();
      }
    } catch {}
  };

  const renderCategoryBadge = (cat: ContactCategory) => {
    switch (cat) {
      case 'complaint':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-400/50 text-red-200 text-[11px] font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>ร้องเรียน / แจ้งปัญหา</span>
          </span>
        );
      case 'request':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-gold-warm/20 border border-gold-warm/50 text-gold-light text-[11px] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>ร้องขอเนื้อหา / เสนอแนะ</span>
          </span>
        );
      case 'membership':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/50 text-cyan-200 text-[11px] font-bold flex items-center gap-1">
            <Crown className="w-3 h-3" />
            <span>เรื่องสมาชิก / การโอนเงิน</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>พูดคุยทั่วไป</span>
          </span>
        );
    }
  };

  const filtered = messages.filter((m) => filterCat === 'all' || m.category === filterCat);

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-10 px-4 sm:px-6 lg:px-8 font-thai">
      <div className="max-w-6xl mx-auto space-y-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-900 border border-gold-warm text-gold-light text-xs font-bold shadow-2xl">
            {toast}
          </div>
        )}

        <div className="border-b border-gold/30 pb-6 space-y-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-gold-warm hover:text-gold-light transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าแผงควบคุมระบบ (Admin Control)</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl font-thai-serif font-black text-parchment-cream flex items-center gap-3">
            <Mail className="w-8 h-8 text-gold-warm" />
            <span>กล่องข้อความติดต่อเรา (Contact Inbox)</span>
          </h1>
          <p className="text-xs sm:text-sm text-parchment-muted font-light">
            ตรวจสอบเรื่องร้องเรียน การพูดคุย และคำร้องขอจากผู้ใช้งาน พร้อมกดส่งอีเมลตอบกลับไปยังอีเมลที่ผู้ติดต่อระบุได้ทันที
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `ทั้งหมด (${messages.length})` },
            { id: 'discussion', label: 'พูดคุยทั่วไป' },
            { id: 'request', label: 'ร้องขอ / เสนอแนะ' },
            { id: 'complaint', label: 'ร้องเรียน / แจ้งปัญหา' },
            { id: 'membership', label: 'สมาชิก / การโอนเงิน' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterCat(t.id as 'all' | ContactCategory)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                filterCat === t.id
                  ? 'bg-gold-warm text-slate-abyss border-gold-warm font-bold'
                  : 'bg-emerald-card/60 text-parchment-muted border-emerald-border hover:text-parchment-cream'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="py-16 text-center text-parchment-muted text-sm">กำลังโหลดข้อความ...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-emerald-card/30 border border-emerald-border/50 text-parchment-muted text-sm">
            ยังไม่มีข้อความในหมวดหมู่นี้
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const replyMailto = `mailto:${item.replyEmail}?subject=${encodeURIComponent(
                `Re: ${item.subject} | The Fitrah Shield`
              )}&body=${encodeURIComponent(
                `เรียนคุณ ${item.name},\n\nขอบคุณที่ติดต่อทีมงาน เกราะพิทักษ์ฟิฏเราะฮฺ (The Fitrah Shield)\n\n[พิมพ์ข้อความตอบกลับที่นี่]\n\n---\nข้อความเดิมของคุณ:\n"${item.message}"`
              )}`;

              return (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl bg-[#0D1E16] border border-emerald-border/80 space-y-4 shadow-lg"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-border/40 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderCategoryBadge(item.category)}
                      {item.status === 'new' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-abyss text-[10px] font-black uppercase">
                          ข้อความใหม่
                        </span>
                      ) : item.status === 'replied' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-900 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                          ส่งอีเมลตอบกลับแล้ว
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-black/40 text-parchment-muted text-[10px]">
                          อ่านแล้ว
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-parchment-muted font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gold-warm" />
                      <span>{new Date(item.createdAt).toLocaleString('th-TH')}</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-thai-serif font-bold text-parchment-cream">
                      {item.subject}
                    </h3>
                    <p className="text-sm text-parchment-cream/90 font-light whitespace-pre-wrap leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                    <div className="flex flex-wrap items-center gap-4 text-parchment-muted">
                      <span>
                        ผู้ติดต่อ: <strong className="text-parchment-cream">{item.name}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-gold-light font-mono">
                        <Mail className="w-3.5 h-3.5 text-gold-warm" />
                        <span>อีเมลตอบกลับ: {item.replyEmail}</span>
                      </span>
                      {item.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-cyan-300" />
                          <span>{item.phone}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={replyMailto}
                        onClick={() => updateStatus(item.id, 'replied')}
                        className="px-4 py-2 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5 shadow-gold-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>ส่งอีเมลตอบกลับ ({item.replyEmail})</span>
                      </a>

                      {item.status !== 'replied' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(item.id, 'replied')}
                          className="px-3 py-2 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-emerald-400/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ทำเครื่องหมายว่าตอบแล้ว</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 text-red-300 transition"
                        title="ลบข้อความ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { mockChapters, mockSeries } from '@/lib/supabase/mockData';
import { Chapter } from '@/types';
import {
  BookOpen,
  ArrowLeft,
  Image as ImageIcon,
  Edit3,
  Plus,
  Save,
  CheckCircle,
  Eye,
  Radio,
  Film,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';

const PRESET_IMAGES = [
  { name: 'สัจธรรมแห่งตน (Emerald Star)', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80' },
  { name: 'ความสงบแห่งจิต (Quiet Lake)', url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80' },
  { name: 'ปัญญาและดวงดาว (Deep Cosmos)', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' },
  { name: 'สมดุลแห่งทรัพย์ (Gold Compass)', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80' },
  { name: 'บททดสอบและศรัทธา (High Peak)', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'มรดกนิรันดร์ (Golden Horizon)', url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80' },
];

export default function AdminArticlesPage() {
  const [chapters, setChapters] = useState<Chapter[]>(mockChapters);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('all');
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [activeTab, setActiveTab] = useState<'easy' | 'deep' | 'media'>('easy');
  const [saveToast, setSaveToast] = useState(false);

  const filteredChapters = chapters.filter((c) => {
    if (selectedSeriesId === 'all') return true;
    return c.series_id === selectedSeriesId;
  });

  const handleEditClick = (chapter: Chapter) => {
    setEditingChapter({ ...chapter });
    setActiveTab('easy');
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;

    setChapters((prev) =>
      prev.map((c) => (c.id === editingChapter.id ? editingChapter : c))
    );
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      setEditingChapter(null);
    }, 1200);
  };

  const handleAddNewChapter = () => {
    const nextNumber = chapters.length + 1;
    const newChap: Chapter = {
      id: `chapter-${Date.now()}`,
      series_id: 'series-1',
      chapter_number: nextNumber,
      slug: `chapter-${nextNumber}-new`,
      title_th: `ตอนที่ ${nextNumber}: (ระบุหัวข้อภาษาไทย)`,
      title_en: `Chapter ${nextNumber}: (Specify English Title)`,
      excerpt: 'เขียนบทคัดย่อสั้นๆ สำหรับบทนี้...',
      easy_content: 'เขียนเนื้อหาโหมด Easy สำหรับเยาวชนและครอบครัวที่นี่...',
      deep_content: 'เขียนเนื้อหาโหมด Deep วิเคราะห์ตรรกศาสตร์และปรัชญาที่นี่...',
      easy_takeaways: ['ข้อคิดสำคัญข้อที่ 1', 'ข้อคิดสำคัญข้อที่ 2'],
      deep_references: ['เอกสารอ้างอิงลำดับที่ 1'],
      audio_url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
      audio_duration: '15:00',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      cover_image: PRESET_IMAGES[0].url,
      is_free: false,
    };

    setChapters((prev) => [...prev, newChap]);
    setEditingChapter(newChap);
  };

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold/30 pb-6">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-parchment-muted hover:text-gold-light transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่แผงควบคุมหลัก (Admin Hub)</span>
            </Link>
            <h1 className="text-3xl font-serif font-black text-parchment-cream">
              ระบบจัดการบทความ & รูปภาพ (Article & Media CMS)
            </h1>
            <p className="text-xs text-parchment-muted">
              เปลี่ยนภาพหน้าปก, แก้ไขเนื้อหา Easy/Deep Mode และคุมสิทธิ์การอ่านของ 35 บทย่อย
            </p>
          </div>

          <button
            onClick={handleAddNewChapter}
            className="px-4 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5 shadow-gold-sm"
          >
            <Plus className="w-4 h-4 fill-current" />
            <span>เพิ่มบทความใหม่</span>
          </button>
        </div>

        {/* Series Filter Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-semibold text-parchment-muted shrink-0 mr-1">
            กรองตามซีรีส์:
          </span>
          <button
            onClick={() => setSelectedSeriesId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
              selectedSeriesId === 'all'
                ? 'bg-gold-gradient text-slate-abyss font-bold shadow-gold-sm'
                : 'bg-emerald-surface hover:bg-emerald-light text-parchment-muted'
            }`}
          >
            ทั้งหมด ({chapters.length})
          </button>
          {mockSeries.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSeriesId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                selectedSeriesId === s.id
                  ? 'bg-gold-gradient text-slate-abyss font-bold shadow-gold-sm'
                  : 'bg-emerald-surface hover:bg-emerald-light text-parchment-muted'
              }`}
            >
              Series {s.order_index}: {s.title_th}
            </button>
          ))}
        </div>

        {/* Chapters Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChapters.map((chap) => {
            const series = mockSeries.find((s) => s.id === chap.series_id) || mockSeries[0];

            return (
              <div
                key={chap.id}
                className="luxury-glass rounded-2xl overflow-hidden flex flex-col justify-between group transition duration-300"
              >
                {/* Visual Image Banner with Instant Change Button */}
                <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={chap.cover_image}
                    alt={chap.title_th}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-dark via-transparent to-black/40" />

                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-gold-warm font-bold">
                    ตอนที่ {chap.chapter_number}
                  </span>

                  {/* Free / Supporter Badge */}
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                      chap.is_free
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-gold-dim/40 text-gold-light border border-gold/40'
                    }`}
                  >
                    {chap.is_free ? (
                      <>
                        <Unlock className="w-3 h-3 text-emerald-400" />
                        <span>อ่านฟรี (Tier 1)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-gold-warm" />
                        <span>Supporter Only</span>
                      </>
                    )}
                  </span>

                  {/* Quick Change Image Overlay Button */}
                  <button
                    onClick={() => handleEditClick(chap)}
                    className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-gold/40 text-[11px] text-gold-light flex items-center gap-1 shadow-sm transition"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>เปลี่ยนรูปภาพ</span>
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] text-parchment-muted uppercase tracking-wider block mb-1">
                      {series.title_th}
                    </span>
                    <h3 className="font-serif font-bold text-base text-parchment-cream line-clamp-2">
                      {chap.title_th}
                    </h3>
                    <p className="text-xs text-parchment-muted/80 mt-1.5 line-clamp-2">
                      {chap.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-emerald-border/40 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-parchment-muted">
                      เสียง: {chap.audio_duration} นาที
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/articles/${chap.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-emerald-surface hover:bg-emerald-light text-parchment-muted hover:text-white transition"
                        title="ดูหน้าจริงบนเว็บ"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleEditClick(chap)}
                        className="px-3 py-1.5 rounded-lg bg-gold-gradient text-slate-abyss font-bold text-xs flex items-center gap-1 shadow-sm hover:brightness-110 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไขเนื้อหา</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VISUAL CHAPTER & IMAGE EDITOR MODAL */}
        {/* ------------------------------------------------------------------ */}
        {editingChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-4xl my-8 rounded-3xl bg-gradient-to-b from-[#12271D] via-[#0E1E16] to-[#0A130F] border-2 border-gold/40 shadow-2xl text-parchment-cream p-6 sm:p-8 space-y-6">
              {/* Close Button */}
              <button
                onClick={() => setEditingChapter(null)}
                className="absolute top-5 right-5 p-2 text-parchment-muted hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-gradient text-slate-abyss flex items-center justify-center font-bold">
                  {editingChapter.chapter_number}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-warm">
                    Visual Content & Media Editor
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-parchment-cream">
                    แก้ไข: {editingChapter.title_th}
                  </h3>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-emerald-border/60 gap-4 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('easy')}
                  className={`pb-3 transition flex items-center gap-1.5 ${
                    activeTab === 'easy'
                      ? 'border-b-2 border-gold-warm text-gold-light'
                      : 'text-parchment-muted hover:text-parchment-cream'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>โหมด Easy (ครอบครัว & เรื่องเล่า)</span>
                </button>
                <button
                  onClick={() => setActiveTab('deep')}
                  className={`pb-3 transition flex items-center gap-1.5 ${
                    activeTab === 'deep'
                      ? 'border-b-2 border-gold-warm text-gold-light'
                      : 'text-parchment-muted hover:text-parchment-cream'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>โหมด Deep (ตรรกศาสตร์ & เทววิทยา)</span>
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`pb-3 transition flex items-center gap-1.5 ${
                    activeTab === 'media'
                      ? 'border-b-2 border-gold-warm text-gold-light'
                      : 'text-parchment-muted hover:text-parchment-cream'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>เปลี่ยนรูปภาพหน้าปก & มีเดีย</span>
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveChapter} className="space-y-6">
                {/* 1. EASY MODE TAB */}
                {activeTab === 'easy' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-medium text-parchment-muted mb-1">
                        ชื่อตอนภาษาไทย
                      </label>
                      <input
                        type="text"
                        required
                        value={editingChapter.title_th}
                        onChange={(e) =>
                          setEditingChapter({ ...editingChapter, title_th: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-sm text-parchment-cream outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-parchment-muted mb-1">
                        คำโปรย / บทคัดย่อ (Excerpt)
                      </label>
                      <textarea
                        rows={2}
                        value={editingChapter.excerpt}
                        onChange={(e) =>
                          setEditingChapter({ ...editingChapter, excerpt: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-sm text-parchment-cream outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-parchment-muted mb-1">
                        เนื้อหาบทความ Easy Mode (ภาษาเล่าเรื่อง เข้าใจง่าย)
                      </label>
                      <textarea
                        rows={8}
                        required
                        value={editingChapter.easy_content}
                        onChange={(e) =>
                          setEditingChapter({ ...editingChapter, easy_content: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-sm text-parchment-cream outline-none font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="text-xs font-medium text-parchment-muted">
                        การจำกัดสิทธิ์การเข้าถึงบทนี้:
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingChapter({ ...editingChapter, is_free: !editingChapter.is_free })
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          editingChapter.is_free
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-gold-dim/30 text-gold-light border border-gold/40'
                        }`}
                      >
                        {editingChapter.is_free ? (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>เปิดให้อ่านฟรี (บทที่ 1-3)</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-gold-warm" />
                            <span>สงวนสิทธิ์เฉพาะ Supporter (บทที่ 4-35)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. DEEP MODE TAB */}
                {activeTab === 'deep' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-medium text-parchment-muted mb-1">
                        ชื่อตอนภาษาอังกฤษ (Title English)
                      </label>
                      <input
                        type="text"
                        value={editingChapter.title_en}
                        onChange={(e) =>
                          setEditingChapter({ ...editingChapter, title_en: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-sm text-parchment-cream outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-parchment-muted mb-1">
                        เนื้อหาบทความ Deep Mode (ตรรกศาสตร์, จิตวิทยา, ญาณวิทยา และเทววิทยา)
                      </label>
                      <textarea
                        rows={10}
                        required
                        value={editingChapter.deep_content}
                        onChange={(e) =>
                          setEditingChapter({ ...editingChapter, deep_content: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-sm text-parchment-cream outline-none font-serif"
                      />
                    </div>
                  </div>
                )}

                {/* 3. MEDIA & COVER IMAGE TAB */}
                {activeTab === 'media' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-xs font-medium text-parchment-muted mb-1">
                        URL รูปภาพหน้าปกบทความ (Cover Image URL)
                      </label>
                      <input
                        type="url"
                        required
                        value={editingChapter.cover_image}
                        onChange={(e) =>
                          setEditingChapter({ ...editingChapter, cover_image: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-sm text-parchment-cream outline-none"
                      />
                    </div>

                    {/* Live Preview Container */}
                    <div>
                      <span className="block text-xs font-medium text-gold-warm mb-2">
                        ตัวอย่างการแสดงผลรูปภาพจริง (Live Preview):
                      </span>
                      <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-gold/40 shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editingChapter.cover_image}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gold-warm">
                              Safe Soul Master Cover
                            </span>
                            <h4 className="text-base font-bold text-parchment-cream">
                              {editingChapter.title_th}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Presets library */}
                    <div>
                      <span className="block text-xs font-medium text-parchment-muted mb-2">
                        หรือเลือกภาพแนะนำจากคลังภาพแบรนด์ Safe Soul (คลิกเลือกทันที):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {PRESET_IMAGES.map((preset, idx) => (
                          <div
                            key={idx}
                            onClick={() =>
                              setEditingChapter({ ...editingChapter, cover_image: preset.url })
                            }
                            className={`p-2 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                              editingChapter.cover_image === preset.url
                                ? 'bg-gold-dim/40 border-gold-warm shadow-gold-sm'
                                : 'bg-slate-dark/80 border-emerald-border hover:border-gold/30'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="text-[11px] text-parchment-muted font-medium line-clamp-1">
                              {preset.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Audio & Video Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-emerald-border/40">
                      <div>
                        <label className="block text-xs font-medium text-parchment-muted mb-1 flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5 text-gold-warm" />
                          <span>ลิงก์ไฟล์เสียง Podcast (MP3 / Lossless URL)</span>
                        </label>
                        <input
                          type="url"
                          value={editingChapter.audio_url}
                          onChange={(e) =>
                            setEditingChapter({ ...editingChapter, audio_url: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-dark border border-emerald-border text-xs text-parchment-cream outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-parchment-muted mb-1 flex items-center gap-1">
                          <Film className="w-3.5 h-3.5 text-gold-warm" />
                          <span>ลิงก์วิดีโอแอนิเมชัน (YouTube Embed URL)</span>
                        </label>
                        <input
                          type="url"
                          value={editingChapter.video_url}
                          onChange={(e) =>
                            setEditingChapter({ ...editingChapter, video_url: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-dark border border-emerald-border text-xs text-parchment-cream outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Save Actions */}
                <div className="pt-4 border-t border-emerald-border/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setEditingChapter(null)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-parchment-muted transition"
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-2 shadow-gold-sm"
                  >
                    <Save className="w-4 h-4 fill-current" />
                    <span>บันทึกการเปลี่ยนแปลงทั้งหมด</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Save Toast Notification */}
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-400 text-xs text-emerald-200 flex items-center gap-2.5 shadow-2xl animate-bounce">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">บันทึกข้อมูลบทความและรูปภาพสำเร็จเรียบร้อย!</span>
          </div>
        )}
      </div>
    </div>
  );
}

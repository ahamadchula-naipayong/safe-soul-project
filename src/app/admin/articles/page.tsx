'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockChapters, mockSeries } from '@/lib/supabase/mockData';
import { Chapter, ArticleStatus } from '@/types';
import { RichTextEditor } from '@/components/RichTextEditor';
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
  Clock,
  Calendar,
  Compass,
  Anchor,
  Tag,
  FolderPlus,
} from 'lucide-react';

const PRESET_IMAGES = [
  { name: 'สัจธรรมแห่งตน (Emerald Star)', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80' },
  { name: 'ความสงบแห่งจิต (Quiet Lake)', url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80' },
  { name: 'ปัญญาและดวงดาว (Deep Cosmos)', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' },
  { name: 'สมดุลแห่งทรัพย์ (Gold Compass)', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80' },
  { name: 'บททดสอบและศรัทธา (High Peak)', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'มรดกนิรันดร์ (Golden Horizon)', url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80' },
];

interface CustomCategory {
  id: string;
  name: string;
  slug: string;
}

export default function AdminArticlesPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('all');
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [activeTab, setActiveTab] = useState<'easy' | 'deep' | 'media'>('easy');
  const [saveToast, setSaveToast] = useState(false);
  const [deleteToast, setDeleteToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Categories State
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Load custom categories on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_custom_categories');
      if (stored) {
        setCustomCategories(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read custom categories from localStorage', e);
    }
  }, []);

  // Load Shallow Waters (7 Islands) & Deep Ocean (10 Archipelagos) on mount
  useEffect(() => {
    async function loadOceanArticles() {
      try {
        const storedDeleted: string[] = (() => {
          try {
            return JSON.parse(localStorage.getItem('admin_deleted_articles') || '[]');
          } catch {
            return [];
          }
        })();

        const res = await fetch('/api/ocean');
        const data = await res.json();
        if (data.success) {
          const oceanChapters: Chapter[] = [];

          // 1. Shallow Waters (ทะเลน้ำตื้น 7 เกาะแห่งปัญญา)
          if (data.shallowWaters?.items) {
            data.shallowWaters.items.forEach((item: any) => {
              const id = item.id || `shallow-${item.chapterNumber}`;
              if (!storedDeleted.includes(id) && !storedDeleted.includes(item.slug)) {
                oceanChapters.push({
                  id,
                  series_id: 'shallow',
                  chapter_number: item.chapterNumber,
                  slug: item.slug,
                  title_th: `เกาะที่ ${item.chapterNumber}: ${item.titleTh}`,
                  title_en: item.titleEn,
                  excerpt: item.coreFocus || item.excerpt,
                  easy_content: item.sections?.intro?.content || '',
                  deep_content: item.sections?.self?.content || '',
                  easy_takeaways: [],
                  deep_references: [],
                  audio_url: '',
                  audio_duration: `${item.readingTimeMinutes || 15} นาที`,
                  video_url: '',
                  cover_image: item.image,
                  is_free: true,
                  status: item.status || 'published',
                  published_at: item.publishedAt,
                });
              }
            });
          }

          // 2. Deep Ocean (ทะเลน้ำลึก 10 หมู่เกาะ)
          if (data.deepOcean?.items) {
            data.deepOcean.items.forEach((arch: any) => {
              if (arch.subIslands) {
                arch.subIslands.forEach((sub: any) => {
                  const id = `deep-${arch.slug}-${sub.chapterNumber}`;
                  if (!storedDeleted.includes(id) && !storedDeleted.includes(sub.slug)) {
                    oceanChapters.push({
                      id,
                      series_id: 'deep',
                      chapter_number: sub.chapterNumber,
                      slug: sub.slug,
                      title_th: `หมู่เกาะ ${arch.archipelagoNumber} (${arch.titleTh}) • ${sub.title}`,
                      title_en: `${arch.titleEn} - Chapter ${sub.chapterNumber}`,
                      excerpt: sub.excerpt,
                      easy_content: sub.content,
                      deep_content: sub.content,
                      easy_takeaways: [],
                      deep_references: [],
                      audio_url: sub.audioUrl || '',
                      audio_duration: sub.audioDuration || `${sub.readingTimeMinutes || 15} นาที`,
                      video_url: '',
                      cover_image: sub.coverImage || arch.coverImage,
                      is_free: sub.isUnlocked,
                      status: sub.status || (arch.status === 'upcoming' ? 'draft' : 'published'),
                      published_at: sub.publishedAt,
                    });
                  }
                });
              }
            });
          }

          // Merge with any custom non-deleted chapters
          setChapters((prev) => {
            const existingIds = new Set(oceanChapters.map((o) => o.id));
            const filteredPrev = prev.filter(
              (c) =>
                !existingIds.has(c.id) &&
                !storedDeleted.includes(c.id) &&
                !storedDeleted.includes(c.slug)
            );
            return [...oceanChapters, ...filteredPrev];
          });
        }
      } catch (err) {
        console.error('Failed to load ocean chapters in admin:', err);
      }
    }

    loadOceanArticles();
  }, []);

  const filteredChapters = chapters.filter((c) => {
    if (selectedSeriesId === 'all') return true;
    return c.series_id === selectedSeriesId;
  });

  const handleEditClick = (chapter: Chapter) => {
    setEditingChapter({ ...chapter });
    setActiveTab('easy');
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;

    setIsSaving(true);
    setChapters((prev) =>
      prev.map((c) => (c.id === editingChapter.id ? editingChapter : c))
    );

    try {
      await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleKey: editingChapter.slug || editingChapter.id,
          updates: {
            title: editingChapter.title_th,
            excerpt: editingChapter.excerpt,
            content: editingChapter.deep_content || editingChapter.easy_content,
            status: editingChapter.status || 'published',
            publishedAt: editingChapter.published_at,
            audioUrl: editingChapter.audio_url,
            audioDuration: editingChapter.audio_duration,
            coverImage: editingChapter.cover_image,
          },
        }),
      });
    } catch (err) {
      console.warn('Failed to persist article override:', err);
    } finally {
      setIsSaving(false);
      setSaveToast(true);
      setTimeout(() => {
        setSaveToast(false);
        setEditingChapter(null);
      }, 1200);
    }
  };

  const handleDeleteChapter = async (chap: Chapter) => {
    const confirmDelete = window.confirm(
      `คุณแน่ใจหรือไม่ว่าต้องการลบบทความ:\n"${chap.title_th}"?`
    );
    if (!confirmDelete) return;

    // Remove from UI state
    setChapters((prev) => prev.filter((c) => c.id !== chap.id && c.slug !== chap.slug));

    // Persist deletion into localStorage
    try {
      const storedDeleted: string[] = JSON.parse(
        localStorage.getItem('admin_deleted_articles') || '[]'
      );
      if (!storedDeleted.includes(chap.id)) storedDeleted.push(chap.id);
      if (!storedDeleted.includes(chap.slug)) storedDeleted.push(chap.slug);
      localStorage.setItem('admin_deleted_articles', JSON.stringify(storedDeleted));

      // Also persist to server override
      await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleKey: chap.slug || chap.id,
          updates: {
            status: 'draft',
            isUnlocked: false,
          },
        }),
      });
    } catch (err) {
      console.error('Failed to store deleted chapter:', err);
    }

    setDeleteToast(true);
    setTimeout(() => {
      setDeleteToast(false);
    }, 2000);
  };

  const handleAddNewChapter = () => {
    const nextNumber = chapters.length + 1;
    const newChap: Chapter = {
      id: `chapter-${Date.now()}`,
      series_id: selectedSeriesId !== 'all' ? selectedSeriesId : 'custom',
      chapter_number: nextNumber,
      slug: `custom-chapter-${Date.now()}`,
      title_th: `บทความใหม่ลำดับที่ ${nextNumber}`,
      title_en: `New Article ${nextNumber}`,
      excerpt: 'เขียนบทคัดย่อสั้นๆ สำหรับบทความนี้...',
      easy_content: 'เนื้อหาฉบับย่อยง่าย...',
      deep_content: 'เนื้อหาฉบับวิเคราะห์เชิงลึก...',
      easy_takeaways: [],
      deep_references: [],
      audio_url: '',
      audio_duration: '15 นาที',
      video_url: '',
      cover_image: PRESET_IMAGES[0].url,
      is_free: false,
      status: 'published',
    };

    setChapters((prev) => [newChap, ...prev]);
    setEditingChapter(newChap);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const rawSlug = newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, '-');
    const slug = `cat-${rawSlug}`;

    const newCat: CustomCategory = {
      id: slug,
      name: newCatName.trim(),
      slug,
    };

    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    try {
      localStorage.setItem('admin_custom_categories', JSON.stringify(updated));
    } catch (err) {
      console.error('Could not save custom category:', err);
    }

    setNewCatName('');
    setNewCatSlug('');
    setIsAddCatModalOpen(false);
    setSelectedSeriesId(slug);
  };

  const handleDeleteCategory = (catId: string) => {
    if (!window.confirm('คุณต้องการลบหมวดหมู่นี้หรือไม่?')) return;
    const updated = customCategories.filter((c) => c.id !== catId);
    setCustomCategories(updated);
    try {
      localStorage.setItem('admin_custom_categories', JSON.stringify(updated));
    } catch (err) {
      console.error('Could not delete category:', err);
    }
    if (selectedSeriesId === catId) setSelectedSeriesId('all');
  };

  const getSeriesDisplayName = (seriesId: string) => {
    if (seriesId === 'shallow') return 'ทะเลน้ำตื้น (7 เกาะ)';
    if (seriesId === 'deep') return 'ทะเลน้ำลึก (10 หมู่เกาะ)';
    const custom = customCategories.find((c) => c.id === seriesId);
    if (custom) return custom.name;
    const s = mockSeries.find((x) => x.id === seriesId);
    return s ? s.title_th : 'หมวดหมู่ทั่วไป';
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
              จัดการเนื้อหาทะเลน้ำตื้น (7 เกาะ), ทะเลน้ำลึก (10 หมู่เกาะ), และหมวดหมู่ที่คุณสร้างขึ้นเอง
            </p>
          </div>

          <button
            onClick={handleAddNewChapter}
            className="px-4 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5 shadow-gold-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 fill-current" />
            <span>เพิ่มบทความใหม่</span>
          </button>
        </div>

        {/* Series & Category Filter Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-xs font-semibold text-parchment-muted shrink-0 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-gold-warm" />
            <span>หมวดหมู่ & ซีรีส์:</span>
          </span>

          <button
            onClick={() => setSelectedSeriesId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
              selectedSeriesId === 'all'
                ? 'bg-gold-gradient text-slate-abyss font-bold shadow-gold-sm'
                : 'bg-emerald-surface hover:bg-emerald-light text-parchment-muted'
            }`}
          >
            ทั้งหมด ({filteredChapters.length})
          </button>

          <button
            onClick={() => setSelectedSeriesId('shallow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
              selectedSeriesId === 'shallow'
                ? 'bg-gold-warm text-slate-abyss font-bold shadow-gold-sm'
                : 'bg-emerald-surface hover:bg-emerald-light text-gold-light'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ทะเลน้ำตื้น (7 เกาะ)</span>
          </button>

          <button
            onClick={() => setSelectedSeriesId('deep')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
              selectedSeriesId === 'deep'
                ? 'bg-cyan-500 text-slate-abyss font-bold shadow-md'
                : 'bg-emerald-surface hover:bg-emerald-light text-cyan-300'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>ทะเลน้ำลึก (10 หมู่เกาะ)</span>
          </button>

          {/* User-created Custom Categories */}
          {customCategories.map((cat) => (
            <div key={cat.id} className="relative group/cat shrink-0 flex items-center">
              <button
                onClick={() => setSelectedSeriesId(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedSeriesId === cat.id
                    ? 'bg-gold-warm text-slate-abyss font-bold shadow-gold-sm'
                    : 'bg-emerald-surface hover:bg-emerald-light text-parchment-cream'
                }`}
              >
                <span>{cat.name}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id);
                }}
                className="opacity-0 group-hover/cat:opacity-100 p-1 -ml-1 text-red-400 hover:text-red-300 transition cursor-pointer"
                title="ลบหมวดหมู่นี้"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* + Button to Add New Custom Category */}
          <button
            type="button"
            onClick={() => setIsAddCatModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-dashed border-gold-warm/60 hover:border-gold-light text-gold-light hover:bg-gold-warm/10 text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer"
            title="เพิ่มหมวดหมู่หรือซีรีส์ใหม่ด้วยตัวเอง"
          >
            <FolderPlus className="w-3.5 h-3.5 text-gold-warm" />
            <span>+ เพิ่มหมวดหมู่ / ซีรีส์</span>
          </button>
        </div>

        {/* Chapters Cards Grid */}
        {filteredChapters.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-black/40 border border-emerald-border/40 text-parchment-muted space-y-3">
            <BookOpen className="w-8 h-8 text-gold-warm mx-auto opacity-60" />
            <p className="text-sm">ไม่พบบทความในหมวดหมู่นี้</p>
            <button
              onClick={handleAddNewChapter}
              className="px-4 py-2 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs"
            >
              เพิ่มบทความใหม่ในหมวดนี้
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChapters.map((chap) => {
              const seriesTitle = getSeriesDisplayName(chap.series_id);

              const articleUrl =
                chap.series_id === 'shallow'
                  ? `/oneshot/${chap.slug}`
                  : chap.series_id === 'deep'
                  ? `/ocean/${chap.slug.replace(/-ch-\d+$/, '')}/${chap.chapter_number}`
                  : `/articles/${chap.slug}`;

              return (
                <div
                  key={chap.id}
                  className="luxury-glass rounded-2xl overflow-hidden flex flex-col justify-between group transition duration-300 relative border border-emerald-border/60 hover:border-gold-warm/50"
                >
                  {/* Visual Image Banner with Instant Change Button */}
                  <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={chap.cover_image}
                      alt={chap.title_th}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-dark via-transparent to-black/40" />

                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-gold-warm font-bold">
                      ตอนที่ {chap.chapter_number}
                    </span>

                    {/* Free / Supporter Badge */}
                    <span
                      className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        chap.is_free
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                          : 'bg-gold-dim/60 text-gold-light border border-gold/40'
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
                      className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-gold/40 text-[11px] text-gold-light flex items-center gap-1 shadow-sm transition cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>เปลี่ยนรูปภาพ</span>
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] text-parchment-muted uppercase tracking-wider font-semibold">
                          {seriesTitle}
                        </span>
                        {chap.status === 'draft' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                            ฉบับร่าง (Draft)
                          </span>
                        ) : chap.status === 'scheduled' ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-bold flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>ตั้งเวลา: {chap.published_at || 'กำหนดเวลา'}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                            เผยแพร่แล้ว (Published)
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-base text-parchment-cream line-clamp-2">
                        {chap.title_th}
                      </h3>
                      <p className="text-xs text-parchment-muted/80 mt-1.5 line-clamp-2">
                        {chap.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-emerald-border/40 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-parchment-muted">
                        เสียง: {chap.audio_duration}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href={articleUrl}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-emerald-surface hover:bg-emerald-light text-parchment-muted hover:text-white transition"
                          title="ดูหน้าจริงบนเว็บ"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleEditClick(chap)}
                          className="px-3 py-1.5 rounded-lg bg-gold-gradient text-slate-abyss font-bold text-xs flex items-center gap-1 shadow-sm hover:brightness-110 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>แก้ไข</span>
                        </button>

                        {/* Delete Chapter Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteChapter(chap)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-500/30 transition shadow-sm cursor-pointer"
                          title="ลบบทความนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* ADD NEW CATEGORY / SERIES MODAL                                     */}
        {/* ------------------------------------------------------------------ */}
        {isAddCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-md rounded-3xl bg-[#0D2016] border border-gold-warm/50 p-6 space-y-5 text-parchment-cream shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-border/60">
                <div className="flex items-center gap-2 text-gold-light font-bold text-sm">
                  <FolderPlus className="w-4 h-4 text-gold-warm" />
                  <span>เพิ่มหมวดหมู่หรือซีรีส์ใหม่</span>
                </div>
                <button
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="p-1 text-parchment-muted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gold-light mb-1">
                    ชื่อหมวดหมู่ / ซีรีส์ (ภาษาไทย):
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="เช่น บทวิเคราะห์ภูมิรัฐศาสตร์, พอดแคสต์จิตวิญญาณ"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-parchment-muted mb-1">
                    รหัสหมวดหมู่ (Slug / ภาษาอังกฤษ - ไม่บังคับ):
                  </label>
                  <input
                    type="text"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    placeholder="เช่น geopolitics-analysis"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-emerald-border/60 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddCatModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-parchment-muted"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl gold-bevel-button text-slate-abyss text-xs font-bold"
                  >
                    บันทึกหมวดหมู่ใหม่
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VISUAL CHAPTER & IMAGE EDITOR MODAL                                */}
        {/* ------------------------------------------------------------------ */}
        {editingChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-6xl my-6 rounded-3xl bg-gradient-to-b from-[#12271D] via-[#0E1E16] to-[#0A130F] border-2 border-gold/40 shadow-2xl text-parchment-cream p-5 sm:p-8 space-y-6">
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
                  <span>โหมด Easy (Upcoming - ครอบครัว & เรื่องเล่า)</span>
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
                {/* Publishing Status & Scheduling Controls */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-emerald-border/70 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="text-xs font-bold text-gold-light flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gold-warm" />
                      <span>สถานะการเผยแพร่บทความ (Publishing Status):</span>
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="articleStatus"
                          value="published"
                          checked={editingChapter.status === 'published' || !editingChapter.status}
                          onChange={() => setEditingChapter({ ...editingChapter, status: 'published' })}
                          className="accent-emerald-500"
                        />
                        <span className="text-emerald-300 font-semibold">เผยแพร่แล้ว (Published)</span>
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="articleStatus"
                          value="scheduled"
                          checked={editingChapter.status === 'scheduled'}
                          onChange={() => setEditingChapter({ ...editingChapter, status: 'scheduled' })}
                          className="accent-cyan-500"
                        />
                        <span className="text-cyan-300 font-semibold">ตั้งเวลาเผยแพร่ (Scheduled)</span>
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="articleStatus"
                          value="draft"
                          checked={editingChapter.status === 'draft'}
                          onChange={() => setEditingChapter({ ...editingChapter, status: 'draft' })}
                          className="accent-amber-500"
                        />
                        <span className="text-amber-300 font-semibold">ฉบับร่าง (Draft)</span>
                      </label>
                    </div>
                  </div>

                  {editingChapter.status === 'scheduled' && (
                    <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in">
                      <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
                        <Calendar className="w-4 h-4" />
                        <span>กำหนดวันและเวลาที่ระบบจะเปิดให้อ่านอัตโนมัติ:</span>
                      </div>
                      <input
                        type="datetime-local"
                        value={editingChapter.published_at || ''}
                        onChange={(e) =>
                          setEditingChapter({ ...editingChapter, published_at: e.target.value })
                        }
                        className="px-3 py-1.5 rounded-xl bg-slate-dark border border-cyan-400/50 text-xs text-parchment-cream outline-none focus:border-cyan-300"
                      />
                    </div>
                  )}
                </div>

                {/* Series Assignment Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-parchment-muted mb-1">
                      หมวดหมู่ / ซีรีส์ของบทความ
                    </label>
                    <select
                      value={editingChapter.series_id}
                      onChange={(e) =>
                        setEditingChapter({ ...editingChapter, series_id: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-slate-dark border border-emerald-border text-xs text-parchment-cream outline-none"
                    >
                      <option value="shallow">ทะเลน้ำตื้น (7 เกาะแห่งปัญญา)</option>
                      <option value="deep">ทะเลน้ำลึก (10 หมู่เกาะ)</option>
                      {customCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingChapter.is_free}
                        onChange={(e) =>
                          setEditingChapter({ ...editingChapter, is_free: e.target.checked })
                        }
                        className="w-4 h-4 rounded accent-emerald-500"
                      />
                      <span className="text-emerald-300 font-bold">เปิดให้อ่านฟรี (Tier 1)</span>
                    </label>
                  </div>
                </div>

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
                        className="w-full px-4 py-2 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-parchment-muted mb-2">
                        เนื้อหาบทความโหมด Easy (Markdown พร้อมแสดงผล):
                      </label>
                      <RichTextEditor
                        value={editingChapter.easy_content}
                        onChange={(val) =>
                          setEditingChapter({ ...editingChapter, easy_content: val })
                        }
                        placeholder="เขียนเนื้อหาโหมดภาษาง่าย อุปมาอุปไมย และเรื่องเล่า..."
                      />
                    </div>
                  </div>
                )}

                {/* 2. DEEP MODE TAB */}
                {activeTab === 'deep' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-medium text-parchment-muted mb-1">
                        ชื่อตอนภาษาอังกฤษ (Title EN)
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
                      <label className="block text-xs font-medium text-parchment-muted mb-2">
                        เนื้อหาบทความโหมด Deep (การวิเคราะห์เชิงลึก 4 มิติแห่งปัญญา):
                      </label>
                      <RichTextEditor
                        value={editingChapter.deep_content}
                        onChange={(val) =>
                          setEditingChapter({ ...editingChapter, deep_content: val })
                        }
                        placeholder="เขียนเนื้อหาการวิเคราะห์เชิงวิชาการ ตรรกศาสตร์ ญาณวิทยา และเทววิทยา..."
                      />
                    </div>
                  </div>
                )}

                {/* 3. MEDIA & COVER IMAGE TAB */}
                {activeTab === 'media' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Visual Cover Preview & Custom URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-parchment-muted">
                          ภาพหน้าปกปัจจุบัน (Current Cover)
                        </label>
                        <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-gold/40 relative shadow-inner bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editingChapter.cover_image}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-parchment-muted mb-1">
                            ลิงก์รูปภาพหน้าปกแบบกำหนดเอง (Custom Image URL)
                          </label>
                          <input
                            type="url"
                            value={editingChapter.cover_image}
                            onChange={(e) =>
                              setEditingChapter({ ...editingChapter, cover_image: e.target.value })
                            }
                            placeholder="https://..."
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-dark border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream outline-none"
                          />
                        </div>

                        {/* Presets Grid */}
                        <div>
                          <label className="block text-xs font-medium text-parchment-muted mb-2">
                            เลือกภาพสำเร็จรูปจากแกลเลอรี (Preset Themes):
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {PRESET_IMAGES.map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setEditingChapter({ ...editingChapter, cover_image: img.url })
                                }
                                className={`group relative aspect-[16/9] rounded-lg overflow-hidden border transition ${
                                  editingChapter.cover_image === img.url
                                    ? 'border-gold-warm ring-2 ring-gold-warm/50'
                                    : 'border-white/10 hover:border-gold/50'
                                }`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                />
                                <span className="absolute inset-0 bg-black/40 flex items-end p-1 text-[9px] text-parchment-cream font-medium line-clamp-1">
                                  {img.name.split(' (')[0]}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audio & Video Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-emerald-border/40">
                      <div>
                        <label className="block text-xs font-medium text-parchment-muted mb-1 flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5 text-gold-warm" />
                          <span>ลิงก์ไฟล์เสียงพอดแคสต์ (MP3 Audio URL)</span>
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
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-parchment-muted transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-2 shadow-gold-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4 fill-current" />
                    <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลงทั้งหมด'}</span>
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

        {/* Delete Toast Notification */}
        {deleteToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-red-950 border border-red-400 text-xs text-red-200 flex items-center gap-2.5 shadow-2xl animate-fade-in">
            <Trash2 className="w-5 h-5 text-red-400" />
            <span className="font-bold">ลบบทความเรียบร้อยแล้ว</span>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Product, ArticleStatus } from '@/types';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  FileEdit,
  Image as ImageIcon,
  Calendar,
  ExternalLink,
  X,
  Upload,
  Sparkles,
  FileCheck,
  Truck,
} from 'lucide-react';

export default function AdminStoreManagerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [counts, setCounts] = useState({ all: 0, published: 0, scheduled: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | ArticleStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'digital' | 'physical'>('all');
  const [toastMsg, setToastMsg] = useState('');

  // Editor modal state
  const [editingItem, setEditingItem] = useState<(Partial<Product> & { imageDataUrl?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/store', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.items || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to load store items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter((p) => {
    const pStatus = p.status || 'published';
    if (statusFilter !== 'all' && pStatus !== statusFilter) return false;
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    return true;
  });

  const handleSaveWithStatus = async (targetStatus: ArticleStatus) => {
    if (!editingItem || !editingItem.title?.trim()) {
      showToast('กรุณากรอกชื่อรายการก่อนบันทึก');
      return;
    }

    if (targetStatus === 'scheduled' && !editingItem.published_at) {
      showToast('กรุณาเลือกวันและเวลาที่ต้องการตั้งเวลาเผยแพร่');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingItem,
          status: targetStatus,
          published_at:
            targetStatus === 'scheduled'
              ? editingItem.published_at
              : new Date().toISOString().slice(0, 16),
        }),
      });
      const data = await res.json();
      if (data.success) {
        const statusText =
          targetStatus === 'draft'
            ? 'บันทึกเป็นฉบับร่าง (Draft) แล้ว'
            : targetStatus === 'scheduled'
            ? 'ตั้งเวลาเผยแพร่เรียบร้อยแล้ว'
            : 'เผยแพร่ขึ้นหน้า Safe for Support ทันทีเรียบร้อยแล้ว!';
        showToast(statusText);
        setEditingItem(null);
        loadProducts();
      } else {
        showToast(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`ยืนยันการลบรายการ "${product.title}" ออกจากระบบ?`)) return;
    try {
      const res = await fetch(`/api/admin/store?id=${encodeURIComponent(product.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('ลบรายการเรียบร้อยแล้ว');
        loadProducts();
      }
    } catch {
      showToast('ลบไม่สำเร็จ');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingItem({
          ...editingItem,
          imageDataUrl: reader.result,
          image_url: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const renderStatusBadge = (p: Product) => {
    const s = p.status || 'published';
    if (s === 'draft') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-slate-800/95 border border-white/20 text-parchment-muted text-[11px] font-bold flex items-center gap-1">
          <FileEdit className="w-3 h-3" />
          <span>ฉบับร่าง (Draft)</span>
        </span>
      );
    }
    if (s === 'scheduled') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-950/95 border border-amber-400/50 text-amber-300 text-[11px] font-bold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>ตั้งเวลา: {p.published_at?.replace('T', ' ')}</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-emerald-950/95 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        <span>เผยแพร่แล้ว (Published)</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-10 px-4 sm:px-6 lg:px-8 font-thai">
      <div className="max-w-7xl mx-auto space-y-8">
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-emerald-900 border border-gold-warm text-gold-light text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/30 pb-6">
          <div className="space-y-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-gold-warm hover:text-gold-light transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับหน้าแผงควบคุมระบบ (Admin Control)</span>
            </Link>
            <h1 className="text-2xl sm:text-4xl font-thai-serif font-black text-parchment-cream flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-gold-warm" />
              <span>จัดการส่วน Safe for Support</span>
            </h1>
            <p className="text-xs sm:text-sm text-parchment-muted font-light">
              จัดการรายการสินค้าและผลงานสนับสนุนแบบเดียวกับระบบบทความ รองรับ บันทึกดราฟท์ (Draft) • ตั้งเวลาเผยแพร่ (Schedule) • เผยแพร่ทันที (Publish)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/store"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-gold-warm/40 text-gold-light font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>ดูหน้าเว็บ Safe for Support</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
                setEditingItem({
                  title: '',
                  slug: '',
                  description: '',
                  type: 'physical',
                  price_thb: 590,
                  compare_at_price_thb: 790,
                  badge: 'Official Support',
                  stock_quantity: 50,
                  image_url:
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
                  status: 'draft',
                  published_at: tomorrow,
                });
              }}
              className="px-5 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5 shadow-gold-sm"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายการใหม่</span>
            </button>
          </div>
        </div>

        {/* Status & Type Filter Bar (Article Engine Style) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0B1913] border border-emerald-border/60">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-parchment-muted font-semibold mr-1">สถานะ:</span>
            {[
              { id: 'all', label: `ทั้งหมด (${counts.all})` },
              { id: 'published', label: `เผยแพร่แล้ว (${counts.published})` },
              { id: 'scheduled', label: `ตั้งเวลา (${counts.scheduled})` },
              { id: 'draft', label: `ฉบับร่าง Draft (${counts.draft})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as 'all' | ArticleStatus)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition border ${
                  statusFilter === tab.id
                    ? 'bg-gold-warm text-slate-abyss border-gold-warm font-bold'
                    : 'bg-black/40 text-parchment-muted border-white/10 hover:text-parchment-cream'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-parchment-muted font-semibold">ประเภท:</span>
            {[
              { id: 'all', label: 'ทุกประเภท' },
              { id: 'digital', label: 'Digital' },
              { id: 'physical', label: 'Physical Merch' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTypeFilter(t.id as 'all' | 'digital' | 'physical')}
                className={`px-3 py-1.5 rounded-lg transition border ${
                  typeFilter === t.id
                    ? 'bg-emerald-surface text-gold-light border-gold-warm/40 font-bold'
                    : 'bg-black/30 text-parchment-muted border-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid (Identical Luxury Feel to Admin Articles) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 rounded-2xl bg-emerald-card/40 border border-emerald-border/40 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-emerald-card/30 border border-emerald-border/50 text-parchment-muted text-sm">
            ไม่พบรายการในสถานะที่เลือก กดปุ่ม &ldquo;เพิ่มรายการใหม่&rdquo; ด้านบนเพื่อสร้างได้เลยครับ
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl overflow-hidden bg-gradient-to-b from-[#10241B] to-[#08120E] border border-emerald-border/80 hover:border-gold-warm/50 transition flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-abyss">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

                    <div className="absolute top-3 left-3">{renderStatusBadge(item)}</div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 border border-white/15 text-[10px] font-mono text-gold-light uppercase">
                      {item.type === 'digital' ? 'Digital' : 'Physical'}
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...item })}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-emerald-surface border border-gold-warm/40 text-gold-light text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-gold-warm" />
                      <span>เปลี่ยนรูป / แก้ไข</span>
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    {item.badge && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gold-warm">
                        {item.badge}
                      </span>
                    )}
                    <h3 className="text-base font-thai-serif font-bold text-parchment-cream line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-parchment-muted/85 line-clamp-2 font-light">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-emerald-border/40 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-mono font-black text-gold-light">
                      ฿{item.price_thb.toLocaleString()}
                    </span>
                    {item.compare_at_price_thb && (
                      <span className="text-xs font-mono text-parchment-muted/50 line-through ml-2">
                        ฿{item.compare_at_price_thb.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 text-red-300 transition"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...item })}
                      className="px-4 py-2 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>แก้ไขรายการ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT PRODUCT WITH DRAFT / SCHEDULE / PUBLISH         */}
      {/* -------------------------------------------------------------------- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0D1E16] border border-gold-warm/50 p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-emerald-border pb-4">
              <div>
                <div className="text-[11px] text-gold-warm font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SAFE FOR SUPPORT EDITOR</span>
                </div>
                <h3 className="text-xl font-thai-serif font-bold text-parchment-cream mt-0.5">
                  {editingItem.id ? 'แก้ไขรายการ Safe for Support' : 'สร้างรายการ Safe for Support ใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-xl bg-black/40 text-parchment-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview & Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-black/35 border border-emerald-border/60">
              <div className="sm:col-span-4 h-32 rounded-xl overflow-hidden bg-slate-abyss border border-gold-warm/30">
                {editingItem.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editingItem.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="sm:col-span-8 space-y-2.5 text-xs">
                <label className="font-bold text-gold-light block">รูปภาพปกสินค้า / ผลงาน</label>
                <input
                  type="text"
                  value={editingItem.image_url?.startsWith('data:') ? '' : editingItem.image_url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                  placeholder="วางลิงก์รูปภาพ https://... หรืออัปโหลดจากเครื่องด้านล่าง"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-emerald-border text-parchment-cream"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/40 text-gold-light font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>อัปโหลดรูปภาพจากเครื่องคอมพิวเตอร์</span>
                </button>
              </div>
            </div>

            {/* Main Fields */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gold-light">ชื่อรายการสินค้า / ผลงานสนับสนุน *</label>
                <input
                  type="text"
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="เช่น เสื้อยืดเกราะพิทักษ์ฟิฏเราะฮฺ หรือ E-Book ชุดพิเศษ..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-sm text-parchment-cream"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gold-light">คำอธิบายรายละเอียด</label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="อธิบายคุณลักษณะ จุดเด่น หรือสิ่งที่ผู้สนับสนุนจะได้รับ..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-sm text-parchment-cream leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gold-light">ประเภท (Type)</label>
                  <select
                    value={editingItem.type || 'physical'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        type: e.target.value as 'digital' | 'physical',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07110C] border border-emerald-border text-parchment-cream"
                  >
                    <option value="physical">ของที่ระลึกจัดส่ง (Physical)</option>
                    <option value="digital">ไฟล์ดิจิทัล (Digital)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gold-light">ราคาสนับสนุน (บาท) *</label>
                  <input
                    type="number"
                    value={editingItem.price_thb ?? 0}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price_thb: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gold-light">ราคาเต็มก่อนลด (ไม่บังคับ)</label>
                  <input
                    type="number"
                    value={editingItem.compare_at_price_thb ?? ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        compare_at_price_thb: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="เช่น 990"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gold-light">ป้ายกำกับมุมภาพ (Badge)</label>
                  <input
                    type="text"
                    value={editingItem.badge || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                    placeholder="เช่น Official Merch, Limited"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gold-light">จำนวนคงเหลือ (Stock)</label>
                  <input
                    type="number"
                    value={editingItem.stock_quantity ?? 100}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, stock_quantity: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gold-light">รหัส Slug (ใส่ tee หากมีไซส์เสื้อ)</label>
                  <input
                    type="text"
                    value={editingItem.slug || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    placeholder="เช่น fitrah-shield-tee"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream font-mono"
                  />
                </div>
              </div>

              {editingItem.type === 'digital' && (
                <div className="space-y-1">
                  <label className="font-bold text-gold-light flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-gold-warm" />
                    <span>ลิงก์ดาวน์โหลดไฟล์ดิจิทัล (Digital Asset URL)</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.digital_asset_url || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, digital_asset_url: e.target.value })
                    }
                    placeholder="https://... หรือ /ebooks/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream font-mono"
                  />
                </div>
              )}

              {/* Schedule Date-Time Picker */}
              <div className="p-4 rounded-2xl bg-amber-950/25 border border-gold-warm/35 space-y-2">
                <label className="font-bold text-gold-light flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gold-warm" />
                  <span>วันและเวลาสำหรับโหมด &ldquo;ตั้งเวลาเผยแพร่ (Schedule)&rdquo;</span>
                </label>
                <input
                  type="datetime-local"
                  value={(editingItem.published_at || '').slice(0, 16)}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, published_at: e.target.value })
                  }
                  className="px-3.5 py-2 rounded-xl bg-[#07110C] border border-gold-warm/40 text-parchment-cream font-mono text-xs"
                />
                <p className="text-[11px] text-parchment-muted/80 font-light">
                  * หากกดปุ่ม &ldquo;ตั้งเวลาเผยแพร่&rdquo; รายการจะถูกซ่อนไว้ก่อนและแสดงบนหน้า Safe for Support อัตโนมัติเมื่อถึงวันเวลาที่ระบุ
                </p>
              </div>
            </div>

            {/* 3 Publishing Mode Buttons (Draft / Schedule / Publish Immediately) */}
            <div className="pt-4 border-t border-emerald-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveWithStatus('draft')}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/20 text-parchment-cream font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <FileEdit className="w-4 h-4 text-parchment-muted" />
                <span>บันทึกเป็นดราฟท์ (Draft)</span>
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveWithStatus('scheduled')}
                  className="px-5 py-3 rounded-xl bg-amber-600/25 hover:bg-amber-600/40 border border-amber-400/60 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>ตั้งเวลาเผยแพร่ (Schedule)</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveWithStatus('published')}
                  className="px-6 py-3 rounded-xl gold-bevel-button text-slate-abyss font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-gold-sm transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish เผยแพร่ทันที!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

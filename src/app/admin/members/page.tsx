'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { Member, TierType, PaymentStatus, MemberRole } from '@/types';
import {
  ArrowLeft,
  Users,
  Crown,
  Anchor,
  Compass,
  Search,
  Download,
  Upload,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Phone,
  Mail,
  Save,
  ExternalLink,
} from 'lucide-react';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    free_tier_1: 0,
    supporter_tier_2: 0,
    founding_tier_3: 0,
    pending_slip: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string>('');

  // Slip Preview Modal
  const [previewSlipMember, setPreviewSlipMember] = useState<Member | null>(null);

  // Edit / Create Member Modal
  const [editingMember, setEditingMember] = useState<Partial<Member> | null>(null);
  const [isNewMember, setIsNewMember] = useState(false);
  const [saving, setSaving] = useState(false);

  const importInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/members', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setMembers(data.items || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = members.filter((m) => {
    if (selectedCategory === 'pending_slip' && m.paymentStatus !== 'pending_verification') {
      return false;
    }
    if (
      selectedCategory !== 'all' &&
      selectedCategory !== 'pending_slip' &&
      m.tier !== selectedCategory
    ) {
      return false;
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = `#${m.memberNumber} ${m.username} ${m.name} ${m.email} ${m.phone || ''} ${m.notes || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });

  const handleVerifySlip = async (member: Member) => {
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: member.id,
          paymentStatus: 'verified',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`อนุมัติสลิปและเปิดสิทธิ์ให้ Member #${member.memberNumber} เรียบร้อยแล้ว`);
        setPreviewSlipMember(null);
        loadMembers();
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการอนุมัติสลิป');
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSaving(true);

    try {
      const method = isNewMember ? 'POST' : 'PATCH';
      const res = await fetch('/api/admin/members', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isNewMember ? 'เพิ่มสมาชิกใหม่สำเร็จ' : 'บันทึกการแก้ไขข้อมูลสมาชิกแล้ว');
        setEditingMember(null);
        loadMembers();
      } else {
        showToast(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (member: Member) => {
    if (!window.confirm(`ยืนยันการลบข้อมูล Member #${member.memberNumber} (${member.name}) ?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/members?id=${encodeURIComponent(member.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`ลบข้อมูล Member #${member.memberNumber} เรียบร้อยแล้ว`);
        loadMembers();
      }
    } catch {
      showToast('ลบข้อมูลไม่สำเร็จ');
    }
  };

  const handleImportExcelOrCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuf = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuf, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet);

      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_rows',
          rows,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'นำเข้าไฟล์ Excel/CSV สำเร็จ');
        loadMembers();
      } else {
        showToast(data.error || 'ไม่สามารถนำเข้าไฟล์ได้');
      }
    } catch {
      showToast('รูปแบบไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์ .xlsx หรือ .csv ที่ส่งออกจากระบบ');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const renderTierBadge = (tier: TierType) => {
    if (tier === 'founding_tier_3') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-warm/20 border border-gold-warm/50 text-gold-light text-xs font-bold">
          <Crown className="w-3 h-3 text-gold-warm fill-current" />
          <span>เรือสำราญทุกมรสุม (Founding 100)</span>
        </span>
      );
    }
    if (tier === 'supporter_tier_2') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-200 text-xs font-bold">
          <Anchor className="w-3 h-3 text-cyan-300" />
          <span>เรือประมงน้ำลึก (Supporter)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
        <Compass className="w-3 h-3" />
        <span>เรือประมงน้ำตื้น (Free)</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-10 px-4 sm:px-6 lg:px-8 font-thai">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-emerald-900 border border-gold-warm text-gold-light text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header & Export / Import Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gold/30 pb-6">
          <div className="space-y-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-gold-warm hover:text-gold-light transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับหน้าแผงควบคุมระบบ (Admin Control)</span>
            </Link>
            <h1 className="text-2xl sm:text-4xl font-thai-serif font-black text-parchment-cream flex items-center gap-3">
              <Users className="w-8 h-8 text-gold-warm" />
              <span>ตารางจัดการสมาชิก & ตรวจสอบสลิป</span>
            </h1>
            <p className="text-xs sm:text-sm text-parchment-muted font-light">
              แยกหมวดหมู่ตามระดับเรือ ตรวจสอบสลิปโอนเงิน แก้ไขรายละเอียดรายบุคคล หรือส่งออก/นำเข้าปรับแต่งเป็นไฟล์ Excel (.xlsx) และ CSV (.csv)
            </p>
          </div>

          {/* Excel / CSV Export & Import Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={`/api/admin/members?export=xlsx&category=${selectedCategory}`}
              className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-400/50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </a>

            <a
              href={`/api/admin/members?export=csv&category=${selectedCategory}`}
              className="px-4 py-2.5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-gold-warm/40 text-gold-light font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-4 h-4 text-gold-warm" />
              <span>Export CSV (.csv)</span>
            </a>

            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportExcelOrCsv}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-black/50 hover:bg-emerald-surface border border-white/20 text-parchment-cream font-semibold text-xs flex items-center gap-1.5 transition"
              title="แก้ไขข้อมูลใน Excel หรือ CSV แล้วอัปโหลดกลับมาอัปเดตตารางได้ทันที"
            >
              <Upload className="w-4 h-4 text-cyan-300" />
              <span>นำเข้าไฟล์ Excel/CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsNewMember(true);
                setEditingMember({
                  username: '',
                  name: '',
                  email: '',
                  phone: '',
                  password: 'password123',
                  tier: 'free_tier_1',
                  paymentStatus: 'free',
                  paymentAmount: 0,
                  notes: '',
                });
              }}
              className="px-4 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5 shadow-gold-sm"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มสมาชิกใหม่</span>
            </button>
          </div>
        </div>

        {/* Category Filter Cards & Search */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { id: 'all', label: 'สมาชิกทั้งหมด', sub: 'All Categories', count: counts.all },
              {
                id: 'free_tier_1',
                label: 'เรือประมงน้ำตื้น',
                sub: 'Free Member (฿0)',
                count: counts.free_tier_1,
              },
              {
                id: 'supporter_tier_2',
                label: 'เรือประมงน้ำลึก',
                sub: 'Supporter (฿199)',
                count: counts.supporter_tier_2,
              },
              {
                id: 'founding_tier_3',
                label: 'เรือสำราญทุกมรสุม',
                sub: 'Founding 100 (฿3,990)',
                count: counts.founding_tier_3,
              },
              {
                id: 'pending_slip',
                label: 'รอตรวจสอบสลิป',
                sub: 'Pending Verification',
                count: counts.pending_slip,
              },
            ].map((tab) => {
              const active = selectedCategory === tab.id;
              const isAlert = tab.id === 'pending_slip' && tab.count > 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    active
                      ? 'bg-gradient-to-b from-gold-warm/20 to-emerald-card border-gold-warm shadow-gold-sm'
                      : isAlert
                      ? 'bg-amber-950/40 border-amber-400/50 hover:border-amber-300'
                      : 'bg-emerald-card/50 border-emerald-border/60 hover:border-gold-warm/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-parchment-cream">{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-mono font-black ${
                        isAlert
                          ? 'bg-amber-400 text-slate-abyss'
                          : active
                          ? 'bg-gold-warm text-slate-abyss'
                          : 'bg-black/40 text-gold-light'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </div>
                  <div className="text-[11px] text-parchment-muted/75 mt-1">{tab.sub}</div>
                </button>
              );
            })}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาลำดับ Member #, ชื่อ, เบอร์โทรศัพท์, อีเมล..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-emerald-card/70 border border-emerald-border focus:border-gold-warm focus:outline-none text-xs sm:text-sm text-parchment-cream"
            />
          </div>
        </div>

        {/* Members Data Table */}
        <div className="rounded-3xl overflow-hidden border border-emerald-border/70 bg-[#0B1812] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#0F241A] border-b border-emerald-border text-gold-light font-semibold text-xs">
                  <th className="py-3.5 px-4">ลำดับ</th>
                  <th className="py-3.5 px-4">ชื่อสมาชิก / Username</th>
                  <th className="py-3.5 px-4">เบอร์โทรศัพท์ & อีเมล</th>
                  <th className="py-3.5 px-4">หมวดหมู่ระดับเรือ (Category)</th>
                  <th className="py-3.5 px-4">การชำระเงิน & สลิป</th>
                  <th className="py-3.5 px-4">วันที่ลงทะเบียน</th>
                  <th className="py-3.5 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-parchment-muted">
                      กำลังโหลดตารางข้อมูลสมาชิก...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-parchment-muted">
                      ไม่พบข้อมูลสมาชิกในหมวดหมู่นี้
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-emerald-surface/30 transition">
                      <td className="py-4 px-4 font-mono font-bold text-gold-light">
                        #{m.memberNumber}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-parchment-cream">{m.name}</span>
                          {(m.role === 'admin' || m.memberNumber === 1) && (
                            <span className="px-2 py-0.5 rounded-md bg-gold-warm text-slate-abyss text-[10px] font-black uppercase">
                              Admin หลัก
                            </span>
                          )}
                          {m.role === 'co_admin' && (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-400 text-slate-abyss text-[10px] font-black uppercase">
                              Co-Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-parchment-muted">@{m.username}</div>
                        {m.notes && (
                          <div className="text-[11px] text-gold-warm/80 mt-0.5 line-clamp-1">
                            หมายเหตุ: {m.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 font-mono text-parchment-cream text-xs">
                          <Phone className="w-3 h-3 text-gold-warm" />
                          <span>{m.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-parchment-muted text-xs">
                          <Mail className="w-3 h-3 text-emerald-400" />
                          <span>{m.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">{renderTierBadge(m.tier)}</td>

                      <td className="py-4 px-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          {m.paymentStatus === 'pending_verification' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950 border border-amber-400/50 text-amber-300 text-[11px] font-bold">
                              <Clock className="w-3 h-3" />
                              <span>รอตรวจสลิป</span>
                            </span>
                          ) : m.tier === 'free_tier_1' ? (
                            <span className="text-[11px] text-parchment-muted">ฟรี (฿0)</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ยืนยันแล้ว (฿{(m.paymentAmount || 0).toLocaleString()})</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {m.paymentSlipUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewSlipMember(m)}
                              className="px-2.5 py-1 rounded-lg bg-gold-warm/15 hover:bg-gold-warm/25 border border-gold-warm/40 text-gold-light text-[11px] font-semibold flex items-center gap-1 transition"
                            >
                              <Eye className="w-3 h-3" />
                              <span>ดูสลิปโอนเงิน</span>
                            </button>
                          )}

                          {m.paymentStatus === 'pending_verification' && (
                            <button
                              type="button"
                              onClick={() => handleVerifySlip(m)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition"
                            >
                              อนุมัติทันที
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs text-parchment-muted font-mono">
                        {new Date(m.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsNewMember(false);
                              setEditingMember({ ...m, password: '' });
                            }}
                            className="p-2 rounded-lg bg-emerald-surface hover:bg-emerald-light border border-gold-warm/30 text-gold-light transition"
                            title="แก้ไขรายละเอียดสมาชิก"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMember(m)}
                            className="p-2 rounded-lg bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 text-red-300 transition"
                            title="ลบสมาชิก"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL 1: SLIP PREVIEW & VERIFICATION                                 */}
      {/* -------------------------------------------------------------------- */}
      {previewSlipMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D1E16] border border-gold-warm/50 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-border pb-3">
              <div>
                <h3 className="text-lg font-thai-serif font-bold text-gold-light">
                  หลักฐานสลิปโอนเงิน • Member #{previewSlipMember.memberNumber}
                </h3>
                <p className="text-xs text-parchment-muted">
                  {previewSlipMember.name} ({previewSlipMember.phone || '-'}) • ยอดแจ้งโอน ฿
                  {(previewSlipMember.paymentAmount || 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setPreviewSlipMember(null)}
                className="p-1.5 rounded-xl bg-black/40 text-parchment-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-black/60 border border-emerald-border p-3 flex items-center justify-center max-h-[60vh] overflow-auto">
              {previewSlipMember.paymentSlipUrl?.endsWith('.pdf') ? (
                <a
                  href={previewSlipMember.paymentSlipUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-10 px-6 text-gold-light underline flex items-center gap-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>คลิกเพื่อเปิดไฟล์สลิป PDF ในแท็บใหม่</span>
                </a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSlipMember.paymentSlipUrl}
                  alt="Payment Slip"
                  className="max-h-[55vh] w-auto object-contain rounded-xl"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewSlipMember(null)}
                className="px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-parchment-cream"
              >
                ปิดหน้าต่าง
              </button>
              {previewSlipMember.paymentStatus === 'pending_verification' && (
                <button
                  type="button"
                  onClick={() => handleVerifySlip(previewSlipMember)}
                  className="px-5 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>อนุมัติสลิป & เปิดสิทธิ์ระดับเรือทันที</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODAL 2: EDIT / CREATE MEMBER                                        */}
      {/* -------------------------------------------------------------------- */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveMember}
            className="w-full max-w-xl rounded-3xl bg-[#0D1E16] border border-gold-warm/50 p-6 sm:p-8 space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-emerald-border pb-3">
              <h3 className="text-xl font-thai-serif font-bold text-gold-light">
                {isNewMember
                  ? 'เพิ่มสมาชิกใหม่เข้าสู่ตาราง'
                  : `แก้ไขรายละเอียด Member #${editingMember.memberNumber}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1.5 rounded-xl bg-black/40 text-parchment-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gold-light">ชื่อ-นามสกุล / นามแฝง *</label>
                <input
                  type="text"
                  required
                  value={editingMember.name || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gold-light">Username *</label>
                <input
                  type="text"
                  required
                  value={editingMember.username || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gold-light">เบอร์โทรศัพท์ *</label>
                <input
                  type="tel"
                  value={editingMember.phone || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gold-light">อีเมล *</label>
                <input
                  type="email"
                  required
                  value={editingMember.email || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gold-light">หมวดหมู่ระดับเรือ (Category)</label>
                <select
                  value={editingMember.tier || 'free_tier_1'}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, tier: e.target.value as TierType })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07110C] border border-emerald-border text-parchment-cream"
                >
                  <option value="free_tier_1">เรือประมงน้ำตื้น (Free Tier)</option>
                  <option value="supporter_tier_2">เรือประมงน้ำลึก (Supporter ฿199)</option>
                  <option value="founding_tier_3">เรือสำราญทุกมรสุม (Founding 100 ฿3,990)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gold-light">สถานะการชำระเงิน</label>
                <select
                  value={editingMember.paymentStatus || 'free'}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      paymentStatus: e.target.value as PaymentStatus,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07110C] border border-emerald-border text-parchment-cream"
                >
                  <option value="free">ฟรี (Free Tier)</option>
                  <option value="pending_verification">รอตรวจสอบสลิป (Pending)</option>
                  <option value="verified">ยืนยันการโอนเงินแล้ว (Verified)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gold-light">ยอดชำระ (บาท)</label>
                <input
                  type="number"
                  value={editingMember.paymentAmount ?? 0}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, paymentAmount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gold-light">
                  {isNewMember ? 'ตั้งรหัสผ่าน *' : 'เปลี่ยนรหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)'}
                </label>
                <input
                  type="text"
                  required={isNewMember}
                  value={editingMember.password || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                  placeholder={isNewMember ? 'password123' : 'เว้นว่างเพื่อใช้รหัสเดิม'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-gold-light">
                  สิทธิ์การจัดการระบบหลังบ้าน (Role: สมาชิกทั่วไป / Co-Admin / Admin หลัก)
                </label>
                <select
                  value={editingMember.role || (editingMember.memberNumber === 1 ? 'admin' : 'member')}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      role: e.target.value as MemberRole,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07110C] border border-gold-warm/40 text-parchment-cream"
                >
                  <option value="member">สมาชิกทั่วไป (Member — อ่านและฟังตามระดับเรือ)</option>
                  <option value="co_admin">
                    ผู้ดูแลร่วม (Co-Admin — ช่วยจัดการบทความ, สินค้า, และตรวจสลิป)
                  </option>
                  <option value="admin">ผู้ดูแลระบบหลัก (Main Admin — สิทธิ์สูงสุดทุกส่วน)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-gold-light">หมายเหตุสำหรับแอดมิน (Notes)</label>
              <textarea
                rows={2}
                value={editingMember.notes || ''}
                onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                placeholder="บันทึกช่วยจำ เช่น โอนผ่านกสิกร เวลา 14:20..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-border text-parchment-cream"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-border/50">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-parchment-cream"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสมาชิก'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

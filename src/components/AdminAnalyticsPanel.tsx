'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsSummaryResponse, MemberActivitySummary } from '@/lib/analytics';
import {
  Activity,
  BarChart3,
  BookOpen,
  FileText,
  Headphones,
  LogIn,
  RefreshCw,
  Smartphone,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
} from 'lucide-react';

const EVENT_LABELS: Record<string, string> = {
  pageview: 'เปิดดูหน้า',
  login: 'เข้าสู่ระบบ',
  article_read: 'อ่านบทความ',
  news_read: 'อ่านข่าว KOR',
  audio_play: 'กดฟังเสียง',
  audio_complete: 'ฟังเสียงจบ',
};

function formatShortThaiTime(iso: string): string {
  if (!iso) return 'ยังไม่มีประวัติ';
  try {
    return new Date(iso).toLocaleString('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function AdminAnalyticsPanel() {
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'traffic' | 'feed'>('members');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/summary', { cache: 'no-store' });
      const json = await res.json();
      if (json?.success) {
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load analytics summary:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const overview = data?.overview;
  const maxDailyViews = Math.max(1, ...(data?.dailyTraffic.map((d) => d.pageviews) || [1]));

  return (
    <section className="rounded-3xl bg-gradient-to-b from-[#0E2219] via-[#091510] to-[#060D0A] border border-gold-warm/35 p-6 sm:p-7 space-y-6 shadow-xl">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-border/50 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold-warm text-xs font-bold">
            <BarChart3 className="w-4 h-4" />
            <span>TRAFFIC & MEMBER ACTIVITY RECORDS (CLOUDFLARE D1 LIVE)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
            สถิติทราฟฟิกเว็บไซต์ & บันทึกการใช้งานสมาชิกรายบุคคล
          </h2>
          <p className="text-xs text-parchment-muted font-light">
            ติดตามจำนวนครั้งที่เข้าชม จำนวนอุปกรณ์/แอปที่ล็อกอิน บทความและข่าว KOR ที่เปิดอ่าน รวมถึงเสียงบรรยายที่ฟังจบจริง
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSummary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/40 text-gold-light text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูลล่าสุด</span>
        </button>
      </div>

      {/* Overview KPI Strip (Tabular Numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 tabular-nums">
        <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-border/50 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-parchment-muted">
            <Globe className="w-3.5 h-3.5 text-gold-warm" />
            <span>ยอดเข้าชมทั้งหมด</span>
          </div>
          <div className="text-2xl font-black text-parchment-cream">
            {(overview?.totalPageviews ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-300">
            วันนี้ +{(overview?.todayPageviews ?? 0).toLocaleString()} ครั้ง
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-border/50 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-parchment-muted">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>ผู้เข้าชม (เครื่อง)</span>
          </div>
          <div className="text-2xl font-black text-cyan-300">
            {(overview?.uniqueVisitors ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-parchment-muted">
            วันนี้ {(overview?.todayUniqueVisitors ?? 0).toLocaleString()} เครื่อง
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-border/50 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-parchment-muted">
            <LogIn className="w-3.5 h-3.5 text-gold-light" />
            <span>ล็อกอินสะสม</span>
          </div>
          <div className="text-2xl font-black text-gold-light">
            {(overview?.totalLogins ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-parchment-muted">
            สมาชิกที่ใช้งาน {(overview?.activeMembersCount ?? 0).toLocaleString()} คน
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-border/50 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-parchment-muted">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>อ่านบทความ</span>
          </div>
          <div className="text-2xl font-black text-emerald-300">
            {(overview?.totalArticleReads ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-parchment-muted">น้ำตื้น + น้ำลึก</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-border/50 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-parchment-muted">
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>อ่านข่าว KOR</span>
          </div>
          <div className="text-2xl font-black text-amber-300">
            {(overview?.totalNewsReads ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-parchment-muted">The Key of Return</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-border/50 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-parchment-muted">
            <Headphones className="w-3.5 h-3.5 text-gold-warm" />
            <span>ฟังเสียงจบ</span>
          </div>
          <div className="text-2xl font-black text-gold-light">
            {(overview?.totalAudioCompletions ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-parchment-muted">
            กดเล่น {(overview?.totalAudioPlays ?? 0).toLocaleString()} ครั้ง
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-emerald-border/40 pb-3 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('members')}
          className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeSubTab === 'members'
              ? 'bg-gold-warm text-slate-abyss shadow-gold-sm'
              : 'bg-black/40 text-parchment-muted hover:text-parchment-cream border border-emerald-border/50'
          }`}
        >
          บันทึกสมาชิกรายบุคคล ({data?.memberStats.length ?? 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('traffic')}
          className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeSubTab === 'traffic'
              ? 'bg-gold-warm text-slate-abyss shadow-gold-sm'
              : 'bg-black/40 text-parchment-muted hover:text-parchment-cream border border-emerald-border/50'
          }`}
        >
          กราฟทราฟฟิก 7 วัน & หน้ายอดนิยม
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('feed')}
          className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeSubTab === 'feed'
              ? 'bg-gold-warm text-slate-abyss shadow-gold-sm'
              : 'bg-black/40 text-parchment-muted hover:text-parchment-cream border border-emerald-border/50'
          }`}
        >
          ความเคลื่อนไหวล่าสุด ({data?.recentEvents.length ?? 0})
        </button>
      </div>

      {/* TAB 1: Per-Member Activity Records */}
      {activeSubTab === 'members' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse tabular-nums">
            <thead>
              <tr className="border-b border-emerald-border/50 text-parchment-muted text-[11px]">
                <th className="py-2.5 px-3">สมาชิก</th>
                <th className="py-2.5 px-2 text-center">เข้าชม (ครั้ง)</th>
                <th className="py-2.5 px-2 text-center">ล็อกอิน</th>
                <th className="py-2.5 px-2 text-center">อุปกรณ์/แอป</th>
                <th className="py-2.5 px-2 text-center">บทความ</th>
                <th className="py-2.5 px-2 text-center">ข่าว KOR</th>
                <th className="py-2.5 px-2 text-center">ฟังจบ</th>
                <th className="py-2.5 px-3 text-right">ใช้งานล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-border/30">
              {(data?.memberStats || []).map((m: MemberActivitySummary) => {
                const isExpanded = expandedMemberId === m.memberId;
                return (
                  <React.Fragment key={m.memberId}>
                    <tr
                      onClick={() => setExpandedMemberId(isExpanded ? null : m.memberId)}
                      className="hover:bg-emerald-surface/40 transition cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-gold-warm">
                            #{m.memberNumber ?? '-'}
                          </span>
                          <div>
                            <div className="font-bold text-parchment-cream flex items-center gap-1.5">
                              <span>{m.name}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-gold-warm" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-parchment-muted" />
                              )}
                            </div>
                            <div className="text-[10px] text-parchment-muted">@{m.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-parchment-cream">
                        {m.visitCount}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-gold-light">
                        {m.loginCount}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 font-semibold">
                          <Smartphone className="w-3 h-3" />
                          <span>{m.deviceCount}</span>
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-emerald-300">
                        {m.articlesReadCount}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-amber-300">
                        {m.newsReadCount}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-gold-light">
                        {m.audioCompletedCount}
                      </td>
                      <td className="py-3 px-3 text-right text-[11px] text-parchment-muted">
                        {formatShortThaiTime(m.lastActiveAt)}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-black/45">
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px]">
                            <div className="space-y-1.5">
                              <div className="font-bold text-cyan-300 flex items-center gap-1">
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>อุปกรณ์ / แอปที่ใช้งาน ({m.devices.length})</span>
                              </div>
                              {m.devices.length > 0 ? (
                                <ul className="space-y-1 text-parchment-cream/85">
                                  {m.devices.map((d) => (
                                    <li key={d} className="px-2 py-1 rounded bg-white/5 border border-white/10">
                                      {d}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-parchment-muted/60">ยังไม่มีข้อมูลอุปกรณ์</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <div className="font-bold text-emerald-300 flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>บทความที่เปิดอ่าน ({m.articlesRead.length})</span>
                              </div>
                              {m.articlesRead.length > 0 ? (
                                <ul className="space-y-1 text-parchment-cream/85 max-h-36 overflow-y-auto pr-1">
                                  {m.articlesRead.map((a) => (
                                    <li key={a.id} className="truncate" title={a.title}>
                                      • {a.title}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-parchment-muted/60">ยังไม่มีประวัติอ่านบทความ</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <div className="font-bold text-amber-300 flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                <span>ข่าว KOR ที่อ่าน ({m.newsRead.length})</span>
                              </div>
                              {m.newsRead.length > 0 ? (
                                <ul className="space-y-1 text-parchment-cream/85 max-h-36 overflow-y-auto pr-1">
                                  {m.newsRead.map((n) => (
                                    <li key={n.id} className="truncate" title={n.title}>
                                      • {n.title}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-parchment-muted/60">ยังไม่มีประวัติอ่านข่าว</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <div className="font-bold text-gold-light flex items-center gap-1">
                                <Headphones className="w-3.5 h-3.5 text-gold-warm" />
                                <span>เสียงบรรยายที่ฟังจบ ({m.audioCompleted.length})</span>
                              </div>
                              {m.audioCompleted.length > 0 ? (
                                <ul className="space-y-1 text-parchment-cream/85 max-h-36 overflow-y-auto pr-1">
                                  {m.audioCompleted.map((au) => (
                                    <li key={au.id} className="truncate" title={au.title}>
                                      ✓ {au.title}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-parchment-muted/60">
                                  ยังไม่มีบทที่ฟังจบ (กดเล่น {m.audioStartedCount} ครั้ง)
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: 7-Day Traffic Chart, Top Pages & Device Breakdown */}
      {activeSubTab === 'traffic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 7-Day Bar Chart */}
          <div className="lg:col-span-7 p-4 rounded-2xl bg-black/40 border border-emerald-border/40 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gold-light">ยอดเข้าชมย้อนหลัง 7 วัน (Pageviews)</span>
              <span className="text-parchment-muted tabular-nums">
                รวม 7 วัน: {(overview?.last7DaysPageviews ?? 0).toLocaleString()} ครั้ง
              </span>
            </div>

            <div className="h-44 flex items-end justify-between gap-2 pt-4">
              {(data?.dailyTraffic || []).map((day) => {
                const heightPct = Math.max(6, Math.round((day.pageviews / maxDailyViews) * 100));
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-gold-light tabular-nums">
                      {day.pageviews}
                    </span>
                    <div
                      className="w-full max-w-[44px] rounded-t-lg bg-gradient-to-t from-emerald-700 to-gold-warm transition-all"
                      style={{ height: `${heightPct}%` }}
                      title={`${day.label}: ${day.pageviews} ครั้ง (${day.uniqueVisitors} เครื่อง)`}
                    />
                    <span className="text-[10px] text-parchment-muted whitespace-nowrap">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Device / App Breakdown */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-black/40 border border-emerald-border/40 space-y-3">
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>อุปกรณ์ & แอปที่เข้าใช้งาน</span>
            </div>
            <div className="space-y-2 text-xs">
              {(data?.deviceBreakdown || []).length > 0 ? (
                data!.deviceBreakdown.map((dev) => (
                  <div key={dev.label} className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-parchment-cream">{dev.label}</span>
                    <span className="font-mono font-bold text-gold-light tabular-nums">
                      {dev.count} เครื่อง
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-parchment-muted text-xs">กำลังเริ่มเก็บสถิติการใช้งาน...</p>
              )}
            </div>
          </div>

          {/* Top Visited Pages */}
          <div className="lg:col-span-12 p-4 rounded-2xl bg-black/40 border border-emerald-border/40 space-y-3">
            <div className="text-xs font-bold text-emerald-300">หน้า & บทความที่มีผู้เข้าชมมากที่สุด</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {(data?.topPages || []).map((p, idx) => (
                <div
                  key={p.path}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-parchment-cream truncate">
                      {idx + 1}. {p.title}
                    </div>
                    <div className="text-[10px] font-mono text-parchment-muted truncate">{p.path}</div>
                  </div>
                  <span className="shrink-0 font-mono font-bold text-gold-light tabular-nums">
                    {p.count} ครั้ง
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Live Recent Activity Feed */}
      {activeSubTab === 'feed' && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
          {(data?.recentEvents || []).length > 0 ? (
            data!.recentEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-black/40 border border-white/10"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-surface border border-gold-warm/30 text-gold-light text-[10px] font-bold shrink-0">
                    {EVENT_LABELS[ev.eventType] || ev.eventType}
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-parchment-cream">
                      {ev.memberNumber ? `#${ev.memberNumber} ` : ''}
                      {ev.memberName}
                    </span>
                    <span className="text-parchment-muted mx-1.5">•</span>
                    <span className="text-parchment-cream/85 truncate">{ev.targetTitle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-parchment-muted shrink-0">
                  <span>{ev.deviceLabel}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {formatShortThaiTime(ev.createdAt)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-parchment-muted">
              <Activity className="w-6 h-6 mx-auto mb-2 text-gold-warm/60" />
              ยังไม่มีข้อมูลกิจกรรม ระบบจะเริ่มบันทึกอัตโนมัติทันทีที่มีผู้เข้าชมเว็บไซต์
            </div>
          )}
        </div>
      )}
    </section>
  );
}

import React from 'react';
import Link from 'next/link';
import { mockSeries, mockChapters } from '@/lib/supabase/mockData';
import { Layers, ChevronRight, BookOpen, Headphones, Sparkles } from 'lucide-react';

export default function SeriesPage() {
  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-deep/80 border border-gold/30 text-gold-light text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
            <span>4 มิติแห่งปัญญา • แผนผังหลักสูตร</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-black text-parchment-cream">
            7 ธีมหลัก (Safe Series)
          </h1>

          <p className="text-sm sm:text-base text-parchment-muted max-w-xl mx-auto leading-relaxed">
            ครอบคลุม 35 บทย่อย เพื่อการพัฒนาตนเองอย่างรอบด้าน ทั้งมิติทางกาย จิตใจ ปัญญา และความสัมพันธ์
          </p>
        </div>

        {/* Series List */}
        <div className="space-y-8">
          {mockSeries.map((series) => {
            const seriesChapters = mockChapters.filter((c) => c.series_id === series.id);

            return (
              <div
                key={series.id}
                className="rounded-3xl bg-emerald-card/70 border border-emerald-border/80 overflow-hidden shadow-xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
                  {/* Left Column: Series Info */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-gold-gradient text-slate-abyss text-[10px] font-black uppercase tracking-wider">
                        Series {series.order_index}
                      </span>
                      <span className="text-xs text-gold-warm font-medium">
                        {series.dimension}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-parchment-cream">
                      {series.title_th}
                    </h2>
                    <p className="text-xs sm:text-sm text-gold-light/90 font-sans tracking-wide">
                      {series.title_en}
                    </p>

                    <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed">
                      {series.description_th}
                    </p>

                    <div className="pt-2 flex items-center gap-4 text-xs text-parchment-muted">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <span>5 บทย่อย (Deep Mode • Easy: Upcoming)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Headphones className="w-4 h-4 text-gold-warm" />
                        <span>Audio Podcast ทุกตอน</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Chapters in this series */}
                  <div className="lg:col-span-7 flex flex-col justify-center space-y-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-emerald-border/60 lg:pl-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-parchment-muted">
                      บทเรียนในซีรีส์นี้:
                    </h3>

                    <div className="space-y-2">
                      {seriesChapters.length > 0 ? (
                        seriesChapters.map((ch) => (
                          <Link
                            key={ch.id}
                            href={`/articles/${ch.slug}`}
                            className="p-3 rounded-xl bg-slate-dark/70 hover:bg-emerald-surface border border-emerald-border/50 hover:border-gold/40 flex items-center justify-between text-xs transition group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-md bg-emerald-dark flex items-center justify-center font-mono font-bold text-gold-warm text-[11px]">
                                {ch.chapter_number}
                              </span>
                              <div>
                                <span className="font-semibold text-parchment-cream group-hover:text-gold-light transition">
                                  {ch.title_th}
                                </span>
                                <span className="text-[10px] text-parchment-muted/70 block">
                                  {ch.title_en} • {ch.audio_duration} นาที
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {ch.is_free ? (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                                  อ่านฟรี
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-gold-warm bg-gold-dim/20 border border-gold/30 px-2 py-0.5 rounded">
                                  Supporter
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-parchment-muted group-hover:text-gold-light group-hover:translate-x-0.5 transition" />
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-dark/40 border border-emerald-border/30 text-xs text-parchment-muted">
                          บทที่ 6 - 35 รวมอยู่ในแพ็กเกจ Supporter ปลดล็อกเข้าถึงได้ทั้งหมด
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

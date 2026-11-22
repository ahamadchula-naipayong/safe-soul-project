'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Lock, ArrowLeft, UserCheck } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading, rawMember } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060E0A] text-parchment-cream flex flex-col items-center justify-center p-6 font-thai space-y-4">
        <div className="w-10 h-10 border-2 border-gold-warm border-t-transparent rounded-full animate-spin" />
        <p className="text-xs sm:text-sm text-gold-light">
          กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ (Admin / Co-Admin)...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] bg-[#060E0A] text-parchment-cream flex items-center justify-center p-4 sm:p-6 font-thai">
        <div className="max-w-md w-full rounded-3xl bg-gradient-to-b from-[#13291E] via-[#0B1812] to-[#060E0A] border-2 border-gold-warm/50 p-7 sm:p-9 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/80 border border-red-400/50 flex items-center justify-center text-red-300 shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/90 border border-red-400/40 text-red-200 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>ADMIN & CO-ADMIN ONLY</span>
            </div>
            <h1 className="text-2xl font-thai-serif font-black text-parchment-cream">
              พื้นที่เฉพาะผู้ดูแลระบบ (Admin Control)
            </h1>
            <p className="text-xs sm:text-sm text-parchment-muted leading-relaxed font-light">
              {rawMember ? (
                <>
                  บัญชีปัจจุบันของคุณ (<strong>Member #{rawMember.memberNumber} • {rawMember.name}</strong>) เป็นสมาชิกระดับปกติ หากคุณเป็นผู้ดูแลระบบ (Admin หรือ Co-Admin) กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ
                </>
              ) : (
                <>
                  ระบบจัดการเนื้อหาและสมาชิกหลังบ้านสงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin และ Co-Admin) เท่านั้น กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบเพื่อดำเนินการต่อ
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs shadow-gold-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>เข้าสู่ระบบผู้ดูแล (Admin)</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-emerald-border text-parchment-cream font-semibold text-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าแรก</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Crown,
  KeyRound,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  LogOut,
  ChevronRight,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { member, isLoggedIn, isLoading, login, register, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTier, setRegTier] = useState<'free_tier_1' | 'supporter_tier_2' | 'founding_tier_3'>('founding_tier_3');
  const [regError, setRegError] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    setLoginSubmitting(true);
    const result = await login(loginUsername.trim(), loginPassword.trim());
    setLoginSubmitting(false);
    if (!result.success) {
      setLoginError(result.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regUsername.trim() || !regPassword.trim() || !regName.trim() || !regEmail.trim()) {
      setRegError('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }
    setRegSubmitting(true);
    const result = await register({
      username: regUsername.trim(),
      password: regPassword.trim(),
      name: regName.trim(),
      email: regEmail.trim(),
      tier: regTier,
    });
    setRegSubmitting(false);
    if (!result.success) {
      setRegError(result.error || 'ไม่สามารถลงทะเบียนได้');
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setActiveTab('login');
    setLoginUsername(user);
    setLoginPassword(pass);
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-[#08110D] text-parchment-cream font-thai selection:bg-gold-warm selection:text-slate-abyss pb-28 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between text-xs text-parchment-muted border-b border-emerald-border/40 pb-4">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-gold-light transition">
            <Compass className="w-3.5 h-3.5 text-gold-warm" />
            <span>หน้าแรก</span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-gold-light font-medium">ระบบสมาชิก & ลำดับ Member</span>
          <span className="text-white/20">/</span>
          <Link href="/portal" className="hover:text-emerald-300 transition">
            พอร์ทัลส่วนตัว
          </Link>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* LOGGED IN VIEW: Prestigious Member Identity Card */}
        {/* ------------------------------------------------------------------ */}
        {isLoggedIn && member ? (
          <div className="relative rounded-3xl bg-gradient-to-b from-[#132A1F] via-[#0D1D15] to-[#08120E] border-2 border-gold-warm/50 p-6 sm:p-10 shadow-[0_0_50px_rgba(217,169,79,0.15)] overflow-hidden">
            {/* Ambient Background Filament */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-radial-gradient from-gold-warm/15 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

            <div className="relative z-10 space-y-8">
              {/* Header Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gold-warm/30">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-warm/20 border border-gold-warm/50 text-gold-light text-xs font-semibold">
                    <Crown className="w-3.5 h-3.5 text-gold-warm fill-current" />
                    <span>บัตรประจำตัวสมาชิกอย่างเป็นทางการ</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-thai-serif font-black text-parchment-cream">
                    ยินดีต้อนรับ, {member.name}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => logout()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-medium transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              </div>

              {/* Prestigious Member Sequence Banner */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#183929] via-[#1C3E2D] to-[#122A1E] border border-gold-warm/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-widest text-gold-warm font-cinzel font-semibold">
                    OFFICIAL MEMBER SEQUENCE
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg sm:text-xl text-parchment-muted font-light">คุณคือสมาชิก</span>
                    <span className="text-3xl sm:text-5xl font-cinzel font-extrabold text-gold-light tracking-wider drop-shadow-md">
                      MEMBER #{member.memberNumber}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-parchment-muted font-light">
                    ลำดับสิทธิ์ที่ได้รับบันทึกลงในระบบอย่างถาวร สำหรับการเข้าถึงบทความ คลังเสียง และสิทธิประโยชน์พิเศษ
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-center justify-center p-4 rounded-xl bg-black/40 border border-gold-warm/30 min-w-[140px] text-center">
                  <span className="text-[10px] text-parchment-muted uppercase">ระดับสมาชิก</span>
                  <span className="text-sm font-bold text-gold-light font-cinzel mt-1">
                    {member.tier === 'founding_tier_3'
                      ? 'FOUNDING 100'
                      : member.tier === 'supporter_tier_2'
                      ? 'SUPPORTER TIER'
                      : 'FREE TIER'}
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-0.5">สถานะ: ยืนยันแล้ว</span>
                </div>
              </div>

              {/* Credentials & Profile Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-black/30 border border-emerald-border/40 space-y-1">
                  <div className="text-[11px] text-parchment-muted flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold-warm" />
                    <span>ชื่อบัญชี (Username)</span>
                  </div>
                  <div className="text-sm font-semibold font-mono text-parchment-cream">{member.username}</div>
                </div>

                <div className="p-4 rounded-xl bg-black/30 border border-emerald-border/40 space-y-1">
                  <div className="text-[11px] text-parchment-muted flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold-warm" />
                    <span>อีเมล (Email)</span>
                  </div>
                  <div className="text-sm font-semibold text-parchment-cream truncate">{member.email}</div>
                </div>

                <div className="p-4 rounded-xl bg-black/30 border border-emerald-border/40 space-y-1">
                  <div className="text-[11px] text-parchment-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-warm" />
                    <span>วันที่ลงทะเบียน</span>
                  </div>
                  <div className="text-sm font-semibold text-parchment-cream">
                    {new Date(member.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/portal"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm transition hover:scale-105 active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>เข้าสู่วิหารพอร์ทัลสมาชิก (Portal)</span>
                </Link>

                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-gold-warm/40 text-gold-light text-sm font-semibold transition"
                >
                  <FileText className="w-4 h-4 text-gold-warm" />
                  <span>อ่านข่าวสำนัก The Key of Return</span>
                </Link>

                <Link
                  href="/articles/art-of-self-awareness"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-emerald-border text-parchment-cream text-sm transition"
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>อ่านบทความ 35 บท</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------------ */
          /* NOT LOGGED IN: Dual Tab Form (Login vs Register)                   */
          /* ------------------------------------------------------------------ */
          <div className="rounded-3xl bg-gradient-to-b from-[#0E2218] via-[#091510] to-[#060D0A] border border-gold-warm/30 p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-surface to-slate-abyss border border-gold-warm/50 flex items-center justify-center text-gold-warm shadow-gold-sm">
                <KeyRound className="w-7 h-7" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-thai-serif font-black text-parchment-cream">
                ระบบสมาชิก The Safe Soul
              </h1>

              <p className="max-w-md mx-auto text-xs sm:text-sm text-parchment-muted font-light">
                ลงชื่อเข้าใช้หรือลงทะเบียนเพื่อรับลำดับสิทธิ์สมาชิก (Member Sequence) ถาวร พร้อมเข้าถึงคลังปัญญา
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex max-w-sm mx-auto p-1.5 rounded-2xl bg-black/50 border border-emerald-border/60">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                  setRegError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-gold-dim via-gold-muted to-gold text-slate-abyss font-bold shadow-md'
                    : 'text-parchment-muted hover:text-parchment-cream'
                }`}
              >
                เข้าสู่ระบบ (Log in)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setLoginError('');
                  setRegError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-emerald-light to-emerald-surface text-parchment-light font-bold border border-emerald-400/30 shadow-md'
                    : 'text-parchment-muted hover:text-parchment-cream'
                }`}
              >
                ลงทะเบียนรับลำดับสมาชิก
              </button>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto space-y-4">
                {loginError && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold-warm" />
                    <span>ชื่อผู้ใช้งาน (Username)</span>
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="กรอก username เช่น admin หรือ founding02"
                    className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-parchment-cream text-sm placeholder:text-parchment-muted/40 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gold-warm" />
                    <span>รหัสผ่าน (Password)</span>
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-parchment-cream text-sm placeholder:text-parchment-muted/40 transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loginSubmitting ? (
                    <span>กำลังตรวจสอบข้อมูล...</span>
                  ) : (
                    <>
                      <span>เข้าสู่ระบบเพื่อตรวจสอบลำดับสมาชิก</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Account Preset Buttons for Immediate Testing */}
                <div className="pt-6 border-t border-white/10 space-y-2">
                  <div className="text-[11px] text-parchment-muted text-center">
                    คลิกเพื่อทดสอบเข้าสู่ระบบด้วยบัญชีตัวอย่าง:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('admin', 'password123')}
                      className="p-2 rounded-lg bg-emerald-surface/60 hover:bg-emerald-surface border border-gold-warm/30 text-gold-light text-center transition"
                    >
                      <div className="font-bold">Member #1 (Lifetime)</div>
                      <div className="text-[10px] text-parchment-muted">admin</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('seeker_soul', 'password123')}
                      className="p-2 rounded-lg bg-emerald-surface/60 hover:bg-emerald-surface border border-emerald-400/40 text-emerald-300 text-center transition"
                    >
                      <div className="font-bold">Member #3 (Supporter)</div>
                      <div className="text-[10px] text-parchment-muted">seeker_soul</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('free_member', 'password123')}
                      className="p-2 rounded-lg bg-emerald-surface/60 hover:bg-emerald-surface border border-white/20 text-parchment-cream text-center transition"
                    >
                      <div className="font-bold">Member #5 (Free Tier)</div>
                      <div className="text-[10px] text-parchment-muted">free_member</div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="max-w-md mx-auto space-y-4">
                {regError && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-gold-warm/10 border border-gold-warm/30 text-gold-light text-xs flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>
                    ระบบจะบันทึก Log in และจัดสรรลำดับสมาชิก (Member Sequence) ถัดไปให้โดยอัตโนมัติ
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold-warm" />
                    <span>ชื่อผู้ใช้งานสำหรับ Log in (Username) *</span>
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="เช่น user2026 หรือ warrior_heart"
                    className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-parchment-cream text-sm placeholder:text-parchment-muted/40 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gold-warm" />
                    <span>รหัสผ่าน (Password) *</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="ตั้งรหัสผ่านสำหรับเข้าสู่ระบบ"
                    className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-parchment-cream text-sm placeholder:text-parchment-muted/40 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-warm" />
                    <span>ชื่อ-นามสกุล หรือนามแฝง (Display Name) *</span>
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="เช่น คุณธนกร หรือ สหายร่วมทาง"
                    className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-parchment-cream text-sm placeholder:text-parchment-muted/40 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold-warm" />
                    <span>อีเมล (Email) *</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-parchment-cream text-sm placeholder:text-parchment-muted/40 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-gold-warm" />
                    <span>เลือกระดับสมาชิก (Membership Tier)</span>
                  </label>
                  <select
                    value={regTier}
                    onChange={(e) =>
                      setRegTier(e.target.value as 'free_tier_1' | 'supporter_tier_2' | 'founding_tier_3')
                    }
                    className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-parchment-cream text-sm transition"
                  >
                    <option value="founding_tier_3" className="bg-[#0A1812] text-parchment-cream">
                      Founding 100 Lifetime (ผู้ร่วมก่อตั้งตลอดชีพ)
                    </option>
                    <option value="supporter_tier_2" className="bg-[#0A1812] text-parchment-cream">
                      Supporter Member (สมาชิกสนับสนุนรายเดือน)
                    </option>
                    <option value="free_tier_1" className="bg-[#0A1812] text-parchment-cream">
                      Free Member (สมาชิกทั่วไป)
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-light via-emerald-surface to-emerald-dark border border-emerald-400/40 text-parchment-cream font-bold text-sm shadow-md transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {regSubmitting ? (
                    <span>กำลังบันทึกและสร้างลำดับสมาชิก...</span>
                  ) : (
                    <>
                      <span>ยืนยันการลงทะเบียน & รับลำดับ Member</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { QrSlipPaymentBox } from '@/components/QrSlipPaymentBox';
import { TierType } from '@/types';
import {
  Compass,
  Crown,
  KeyRound,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  LogOut,
  Calendar,
  FileText,
  Anchor,
  Clock,
  MessageSquare,
  RefreshCw,
  Unlink,
  ExternalLink,
} from 'lucide-react';

const TIER_CATEGORIES: {
  id: TierType;
  vesselName: string;
  categoryLabel: string;
  priceLabel: string;
  amount: number;
  desc: string;
}[] = [
  {
    id: 'free_tier_1',
    vesselName: 'เรือประมงน้ำตื้น',
    categoryLabel: 'Free Member (สมาชิกทั่วไป)',
    priceLabel: 'ฟรี (฿0)',
    amount: 0,
    desc: 'ทะเลน้ำตื้นครบ 7 เกาะ + ทะเลน้ำลึกบทที่ 1 + ข่าวทั่วไป',
  },
  {
    id: 'supporter_tier_2',
    vesselName: 'เรือประมงน้ำลึก',
    categoryLabel: 'Supporter (สมาชิกรายเดือน)',
    priceLabel: '฿199 / เดือน',
    amount: 199,
    desc: 'ปลดล็อกทะเลน้ำลึกรายสัปดาห์ + ข่าว Deepdive ครบทุกฉบับ',
  },
  {
    id: 'founding_tier_3',
    vesselName: 'เรือสำราญทุกมรสุม',
    categoryLabel: 'Founding 100 (ตลอดชีพ)',
    priceLabel: '฿3,990 ครั้งเดียว',
    amount: 3990,
    desc: 'ปลดล็อกครบ 100% ทันทีทุกเกาะ (57 บท) + Master E-Book 200+ หน้า',
  },
];

function LoginContent() {
  const searchParams = useSearchParams();
  const { member, isLoggedIn, login, register, logout, refreshSession } = useAuth();

  const [discordStatusBanner, setDiscordStatusBanner] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);
  const [discordBusy, setDiscordBusy] = useState(false);

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
  const [regPhone, setRegPhone] = useState('');
  const [regTier, setRegTier] = useState<TierType>('free_tier_1');
  const [regBillingCycle, setRegBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [regSlipDataUrl, setRegSlipDataUrl] = useState('');
  const [regError, setRegError] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Support deep-link query params (?tab=register&tier=founding_tier_3)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const tierParam = searchParams.get('tier') as TierType | null;
    if (tabParam === 'register') setActiveTab('register');
    if (
      tierParam === 'free_tier_1' ||
      tierParam === 'supporter_tier_2' ||
      tierParam === 'founding_tier_3'
    ) {
      setRegTier(tierParam);
      if (!tabParam) setActiveTab('register');
    }

    const discordParam = searchParams.get('discord');
    const reasonParam = searchParams.get('reason');
    const syncWarning = searchParams.get('sync_warning');
    if (discordParam === 'connected') {
      setDiscordStatusBanner({
        type: syncWarning ? 'warning' : 'success',
        text: syncWarning
          ? `เชื่อมต่อบัญชี Discord สำเร็จแล้ว! (${syncWarning})`
          : 'เชื่อมต่อบัญชี Discord และรับยศสมาชิกตามระดับเรือเรียบร้อยแล้ว!',
      });
      refreshSession();
    } else if (discordParam === 'login_required') {
      setDiscordStatusBanner({
        type: 'warning',
        text: 'กรุณาเข้าสู่ระบบบัญชีสมาชิกเว็บไซต์ก่อนกดเชื่อมต่อ Discord เพื่อรับยศอัตโนมัติ',
      });
    } else if (discordParam === 'error') {
      setDiscordStatusBanner({
        type: 'error',
        text: reasonParam || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Discord กรุณาลองใหม่อีกครั้ง',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleDiscordSyncMe = async () => {
    setDiscordBusy(true);
    try {
      const res = await fetch('/api/discord/sync-me', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscordStatusBanner({
          type: 'success',
          text: 'อัปเดตยศ Discord ตามระดับสมาชิกล่าสุดเรียบร้อยแล้ว!',
        });
        await refreshSession();
      } else {
        setDiscordStatusBanner({
          type: 'error',
          text: data.error || 'ไม่สามารถซิงค์ยศได้ กรุณาตรวจสอบว่าคุณเข้า Discord Server แล้ว',
        });
      }
    } catch {
      setDiscordStatusBanner({
        type: 'error',
        text: 'ไม่สามารถเชื่อมต่อระบบซิงค์ยศได้ กรุณาลองใหม่',
      });
    } finally {
      setDiscordBusy(false);
    }
  };

  const handleDiscordDisconnect = async () => {
    setDiscordBusy(true);
    try {
      const res = await fetch('/api/discord/disconnect', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscordStatusBanner({
          type: 'warning',
          text: 'ยกเลิกการเชื่อมต่อบัญชี Discord เรียบร้อยแล้ว',
        });
        await refreshSession();
      } else {
        setDiscordStatusBanner({
          type: 'error',
          text: data.error || 'ไม่สามารถยกเลิกการเชื่อมต่อได้',
        });
      }
    } catch {
      setDiscordStatusBanner({
        type: 'error',
        text: 'เกิดข้อผิดพลาดในการยกเลิกการเชื่อมต่อ',
      });
    } finally {
      setDiscordBusy(false);
    }
  };

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
    if (
      !regUsername.trim() ||
      !regPassword.trim() ||
      !regName.trim() ||
      !regEmail.trim() ||
      !regPhone.trim()
    ) {
      setRegError('กรุณากรอกข้อมูล ชื่อผู้ใช้, รหัสผ่าน, ชื่อ-นามสกุล, อีเมล และเบอร์โทรศัพท์ให้ครบถ้วน');
      return;
    }

    const isPaid = regTier === 'supporter_tier_2' || regTier === 'founding_tier_3';
    if (isPaid && !regSlipDataUrl) {
      setRegError('กรุณาสแกน QR โอนเงินและแนบไฟล์สลิปการโอนเงินเพื่อตรวจสอบสำหรับระดับเรือที่เลือก');
      return;
    }

    const paymentAmount =
      regTier === 'founding_tier_3'
        ? 3990
        : regTier === 'supporter_tier_2'
        ? regBillingCycle === 'yearly'
          ? 1990
          : 199
        : 0;

    setRegSubmitting(true);
    const result = await register({
      username: regUsername.trim(),
      password: regPassword.trim(),
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      tier: regTier,
      paymentSlipDataUrl: isPaid ? regSlipDataUrl : undefined,
      paymentAmount,
      billingCycle:
        regTier === 'founding_tier_3'
          ? 'lifetime'
          : regTier === 'supporter_tier_2'
          ? regBillingCycle
          : 'free',
    });
    setRegSubmitting(false);
    if (!result.success) {
      setRegError(result.error || 'ไม่สามารถลงทะเบียนได้');
    }
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
            คลังสัมภาระบนเรือ
          </Link>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* LOGGED IN VIEW: Prestigious Member Identity Card                   */}
        {/* ------------------------------------------------------------------ */}
        {isLoggedIn && member ? (
          <div className="relative rounded-3xl bg-gradient-to-b from-[#132A1F] via-[#0D1D15] to-[#08120E] border-2 border-gold-warm/50 p-6 sm:p-10 shadow-[0_0_50px_rgba(217,169,79,0.15)] overflow-hidden">
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

              {/* Pending Slip Verification Notice */}
              {member.paymentStatus === 'pending_verification' && (
                <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-400/50 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-amber-300">
                      หลักฐานสลิปการโอนเงินอยู่ระหว่างรอแอดมินตรวจสอบ
                    </div>
                    <p className="text-xs text-amber-100/85 font-light">
                      ทีมงานได้รับไฟล์สลิปของคุณแล้ว ทันทีที่แอดมินตรวจสอบและยืนยันในระบบ สิทธิ์ระดับเรือที่คุณเลือกจะเปิดใช้งานเต็มรูปแบบโดยอัตโนมัติ
                    </p>
                  </div>
                </div>
              )}

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

                <div className="shrink-0 flex flex-col items-center justify-center p-4 rounded-xl bg-black/40 border border-gold-warm/30 min-w-[175px] text-center">
                  <span className="text-[10px] text-parchment-muted uppercase">หมวดหมู่ระดับเรือ</span>
                  <span className="text-sm font-bold text-gold-light mt-1">
                    {member.tier === 'founding_tier_3'
                      ? 'เรือสำราญทุกมรสุม (Founding 100)'
                      : member.tier === 'supporter_tier_2'
                      ? 'เรือประมงน้ำลึก (Supporter)'
                      : 'เรือประมงน้ำตื้น (Free Tier)'}
                  </span>
                  {member.paymentStatus === 'pending_verification' ? (
                    <span className="text-[10px] text-amber-300 mt-1">สถานะ: รอตรวจสอบสลิป</span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 mt-1">สถานะ: ยืนยันแล้ว</span>
                  )}
                </div>
              </div>

              {/* Credentials & Profile Breakdown (4 Cards including Phone) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-black/30 border border-emerald-border/40 space-y-1">
                  <div className="text-[11px] text-parchment-muted flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold-warm" />
                    <span>ชื่อบัญชี (Username)</span>
                  </div>
                  <div className="text-sm font-semibold font-mono text-parchment-cream">{member.username}</div>
                </div>

                <div className="p-4 rounded-xl bg-black/30 border border-emerald-border/40 space-y-1">
                  <div className="text-[11px] text-parchment-muted flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold-warm" />
                    <span>เบอร์โทรศัพท์ (Phone)</span>
                  </div>
                  <div className="text-sm font-semibold font-mono text-parchment-cream">
                    {member.phone || '-'}
                  </div>
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

              {/* Discord Sanctuary Integration Card */}
              <div
                id="discord-sanctuary"
                className="p-5 sm:p-6 rounded-2xl bg-[#0B1726]/80 border border-indigo-400/35 space-y-4 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-parchment-cream">
                          Discord Sanctuary • ชุมชนเสวนาและคลังสรุปบทเรียน
                        </h3>
                        {member.discordUserId ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-semibold">
                            เชื่อมต่อแล้ว
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-parchment-muted text-[10px]">
                            ยังไม่เชื่อมต่อ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-parchment-muted leading-relaxed">
                        สิทธิ์ยศ Discord ของคุณ:{' '}
                        <strong className="text-gold-light">
                          {member.paymentStatus === 'pending_verification' && member.tier !== 'free_tier_1'
                            ? 'Free (ชั่วคราวระหว่างรอแอดมินตรวจสลิป)'
                            : member.tier === 'founding_tier_3'
                            ? 'Member + ยศสีทอง Founding 100'
                            : member.tier === 'supporter_tier_2'
                            ? 'Member (ปลดล็อกทะเลน้ำลึก & ข่าว Deepdive)'
                            : 'Free (ทะเลน้ำตื้น 7 เกาะ & ข่าวเปิด)'}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                {discordStatusBanner && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      discordStatusBanner.type === 'success'
                        ? 'bg-emerald-950/60 border-emerald-400/40 text-emerald-200'
                        : discordStatusBanner.type === 'warning'
                        ? 'bg-amber-950/60 border-amber-400/40 text-amber-200'
                        : 'bg-red-950/60 border-red-400/40 text-red-200'
                    }`}
                  >
                    {discordStatusBanner.text}
                  </div>
                )}

                {member.discordUserId ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-parchment-cream/90">
                      บัญชีที่เชื่อมต่อ:{' '}
                      <span className="font-mono font-semibold text-indigo-300">
                        {member.discordUsername || member.discordUserId}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/YMHttezcdr'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>เข้าสู่ Discord Server</span>
                      </a>
                      <button
                        type="button"
                        disabled={discordBusy}
                        onClick={handleDiscordSyncMe}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/40 text-gold-light text-xs font-semibold transition disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${discordBusy ? 'animate-spin' : ''}`} />
                        <span>ซิงค์ยศล่าสุด</span>
                      </button>
                      <button
                        type="button"
                        disabled={discordBusy}
                        onClick={handleDiscordDisconnect}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-medium transition disabled:opacity-50"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        <span>ยกเลิกการเชื่อมต่อ</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href="/api/discord/connect"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition hover:scale-[1.02]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>เชื่อมต่อ Discord &amp; รับยศอัตโนมัติ</span>
                    </a>
                    <a
                      href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/YMHttezcdr'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-indigo-400/30 text-indigo-200 text-xs font-medium transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>เปิดดู Discord Server</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Navigation Options */}
              <div className="pt-4 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/portal"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm transition hover:scale-105 active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>สำรวจคลังสัมภาระบนเรือ</span>
                </Link>

                <Link
                  href="/journey"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-surface hover:bg-emerald-light border border-gold-warm/40 text-gold-light text-sm font-semibold transition"
                >
                  <Anchor className="w-4 h-4 text-gold-warm" />
                  <span>โดดขึ้นเรือ!</span>
                </Link>

                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-gold-warm/40 text-gold-light text-sm font-semibold transition"
                >
                  <FileText className="w-4 h-4 text-gold-warm" />
                  <span>อ่านข่าว KOR</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------------ */
          /* NOT LOGGED IN: Dual Tab Form (Login vs Register with QR & Slip)    */
          /* ------------------------------------------------------------------ */
          <div className="rounded-3xl bg-gradient-to-b from-[#0E2218] via-[#091510] to-[#060D0A] border border-gold-warm/30 p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-surface to-slate-abyss border border-gold-warm/50 flex items-center justify-center text-gold-warm shadow-gold-sm">
                <KeyRound className="w-7 h-7" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-thai-serif font-black text-parchment-cream">
                ระบบสมาชิก เกราะพิทักษ์ฟิฏเราะฮฺ
              </h1>

              <p className="max-w-md mx-auto text-xs sm:text-sm text-parchment-muted font-light">
                ลงชื่อเข้าใช้หรือลงทะเบียนเพื่อรับลำดับสิทธิ์สมาชิก (Member Sequence) ถาวร พร้อมเลือกหมวดหมู่เรือที่คุณต้องการ
              </p>
            </div>

            {discordStatusBanner && (
              <div
                className={`p-3.5 rounded-xl border text-xs text-center ${
                  discordStatusBanner.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-400/40 text-emerald-200'
                    : discordStatusBanner.type === 'warning'
                    ? 'bg-amber-950/60 border-amber-400/40 text-amber-200'
                    : 'bg-red-950/60 border-red-400/40 text-red-200'
                }`}
              >
                {discordStatusBanner.text}
              </div>
            )}

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
                สมัครสมาชิกใหม่
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
                    <span>ชื่อผู้ใช้งาน หรือ อีเมล (Username / Email)</span>
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="กรอกชื่อผู้ใช้งาน หรือ อีเมลของคุณ"
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
              </form>
            )}

            {/* TAB 2: REGISTER FORM WITH PHONE + TIER CATEGORY + IMMEDIATE QR & SLIP */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="max-w-xl mx-auto space-y-5">
                {regError && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-gold-warm/10 border border-gold-warm/30 text-gold-light text-xs flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-gold-warm shrink-0" />
                  <span>
                    ระบบจะจัดสรรลำดับสมาชิก (Member Sequence) ถัดไปให้โดยอัตโนมัติ และบันทึกหมวดหมู่ระดับเรือลงตารางสมาชิก
                  </span>
                </div>

                {/* Account & Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gold-warm" />
                      <span>ชื่อผู้ใช้งาน (Username) *</span>
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="เช่น sailor2026"
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
                      placeholder="ตั้งรหัสผ่านเข้าสู่ระบบ"
                      className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-parchment-cream text-sm placeholder:text-parchment-muted/40 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold-warm" />
                      <span>ชื่อ-นามสกุล หรือนามแฝง *</span>
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
                      <Phone className="w-3.5 h-3.5 text-gold-warm" />
                      <span>เบอร์โทรศัพท์ (Phone Number) *</span>
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full px-4 py-3 rounded-xl bg-emerald-card/60 border border-emerald-border focus:border-gold-warm focus:outline-none text-parchment-cream text-sm placeholder:text-parchment-muted/40 transition"
                      required
                    />
                  </div>
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

                {/* Tier Category Selection Cards */}
                <div className="space-y-2.5 pt-2">
                  <label className="text-xs font-bold text-gold-light flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-gold-warm" />
                    <span>เลือกหมวดหมู่ระดับเรือสมาชิก (ทันทีที่เลือกระดับชำระเงิน จะแสดง QR โอนเงินและช่องแนบสลิป)</span>
                  </label>

                  <div className="space-y-2.5">
                    {TIER_CATEGORIES.map((cat) => {
                      const active = regTier === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setRegTier(cat.id)}
                          className={`w-full p-4 rounded-2xl text-left border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            active
                              ? 'bg-gradient-to-r from-gold-warm/20 via-emerald-surface/80 to-emerald-card border-gold-warm shadow-gold-sm'
                              : 'bg-black/35 border-emerald-border/60 hover:border-gold-warm/40'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  active ? 'border-gold-warm bg-gold-warm' : 'border-white/30'
                                }`}
                              >
                                {active && <span className="w-1.5 h-1.5 rounded-full bg-slate-abyss" />}
                              </span>
                              <span className="text-sm font-bold text-parchment-cream">
                                {cat.vesselName}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-gold-light">
                                {cat.categoryLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-parchment-muted pl-5 font-light">
                              {cat.desc}
                            </p>
                          </div>

                          <div className="pl-5 sm:pl-0 sm:text-right shrink-0">
                            <span className="font-mono font-black text-sm text-gold-light">
                              {cat.priceLabel}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Monthly / Yearly Toggle when Supporter is selected */}
                  {regTier === 'supporter_tier_2' && (
                    <div className="flex items-center justify-end gap-2 pt-1 text-xs">
                      <span className="text-parchment-muted">รอบชำระเรือประมงน้ำลึก:</span>
                      <button
                        type="button"
                        onClick={() => setRegBillingCycle('monthly')}
                        className={`px-3 py-1 rounded-lg border font-semibold transition ${
                          regBillingCycle === 'monthly'
                            ? 'bg-gold-warm text-slate-abyss border-gold-warm'
                            : 'bg-black/40 text-parchment-muted border-white/10'
                        }`}
                      >
                        รายเดือน ฿199
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegBillingCycle('yearly')}
                        className={`px-3 py-1 rounded-lg border font-semibold transition ${
                          regBillingCycle === 'yearly'
                            ? 'bg-gold-warm text-slate-abyss border-gold-warm'
                            : 'bg-black/40 text-parchment-muted border-white/10'
                        }`}
                      >
                        รายปี ฿1,990 (ประหยัด 2 เดือน)
                      </button>
                    </div>
                  )}
                </div>

                {/* IMMEDIATE QR & SLIP ATTACHMENT WHEN PAID TIER SELECTED */}
                {(regTier === 'supporter_tier_2' || regTier === 'founding_tier_3') && (
                  <QrSlipPaymentBox
                    tier={regTier}
                    billingCycle={regBillingCycle}
                    slipDataUrl={regSlipDataUrl}
                    onSlipChange={(dataUrl) => setRegSlipDataUrl(dataUrl)}
                  />
                )}

                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="w-full py-4 px-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-sm shadow-gold-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {regSubmitting ? (
                    <span>กำลังบันทึกข้อมูลสมาชิกและไฟล์สลิป...</span>
                  ) : (
                    <>
                      <span>
                        {regTier === 'free_tier_1'
                          ? 'ยืนยันสมัครสมาชิกฟรี & รับลำดับ Member'
                          : 'ยืนยันการสมัคร & ส่งสลิปตรวจสอบรับลำดับ Member'}
                      </span>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08110D]" />}>
      <LoginContent />
    </Suspense>
  );
}

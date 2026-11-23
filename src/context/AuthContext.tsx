'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Member, TierType } from '@/types';
import { trackActivityEvent } from '@/lib/analytics';

export type ViewAsMode =
  | 'actual'
  | 'visitor'
  | 'free_tier_1'
  | 'supporter_tier_2'
  | 'founding_tier_3';

export interface RegisterPayload {
  username: string;
  email: string;
  phone: string;
  password: string;
  name?: string;
  tier?: TierType;
  paymentSlipDataUrl?: string;
  paymentAmount?: number;
  billingCycle?: 'free' | 'monthly' | 'yearly' | 'lifetime';
}

export interface UpgradePayload {
  tier: TierType;
  phone?: string;
  paymentSlipDataUrl: string;
  paymentAmount: number;
  billingCycle: 'monthly' | 'yearly' | 'lifetime';
}

interface AuthContextType {
  member: Member | null;
  rawMember: Member | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  viewAsMode: ViewAsMode;
  setViewAsMode: (mode: ViewAsMode) => void;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; member?: Member }>;
  register: (data: RegisterPayload) => Promise<{ success: boolean; error?: string; member?: Member }>;
  upgradeMembership: (data: UpgradePayload) => Promise<{ success: boolean; error?: string; member?: Member }>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const VIEW_AS_STORAGE_KEY = 'safesoul_admin_view_as';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [rawMember, setRawMember] = useState<Member | null>(null);
  const [viewAsMode, setViewAsModeState] = useState<ViewAsMode>('actual');
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = useMemo(() => {
    if (!rawMember) return false;
    return (
      rawMember.role === 'admin' ||
      rawMember.role === 'co_admin' ||
      rawMember.memberNumber === 1
    );
  }, [rawMember]);

  const setViewAsMode = (mode: ViewAsMode) => {
    setViewAsModeState(mode);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(VIEW_AS_STORAGE_KEY, mode);
      } catch {}
    }
  };

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (data.authenticated && data.member) {
        setRawMember(data.member);
        if (typeof window !== 'undefined') {
          localStorage.setItem('safesoul_member', JSON.stringify(data.member));
        }
      }
    } catch {}
  };

  // Load member from localStorage / cookie on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedViewAs = sessionStorage.getItem(VIEW_AS_STORAGE_KEY) as ViewAsMode | null;
        if (
          savedViewAs &&
          ['actual', 'visitor', 'free_tier_1', 'supporter_tier_2', 'founding_tier_3'].includes(
            savedViewAs
          )
        ) {
          setViewAsModeState(savedViewAs);
        }
      } catch {}

      const stored = localStorage.getItem('safesoul_member');
      if (stored) {
        try {
          setRawMember(JSON.parse(stored));
        } catch {
          localStorage.removeItem('safesoul_member');
        }
      }

      fetch('/api/auth/me', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.member) {
            setRawMember(data.member);
            localStorage.setItem('safesoul_member', JSON.stringify(data.member));
          } else if (!stored) {
            setRawMember(null);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, []);

  // Compute simulated member when Admin uses "View As"
  const effectiveMember: Member | null = useMemo(() => {
    if (!isAdmin || viewAsMode === 'actual') {
      return rawMember;
    }
    if (viewAsMode === 'visitor') {
      return null;
    }
    if (!rawMember) return null;

    const simulatedTier: TierType = viewAsMode;
    return {
      ...rawMember,
      tier: simulatedTier,
      role: 'member',
      paymentStatus: simulatedTier === 'free_tier_1' ? 'free' : 'verified',
      billingCycle:
        simulatedTier === 'founding_tier_3'
          ? 'lifetime'
          : simulatedTier === 'supporter_tier_2'
          ? 'monthly'
          : 'free',
    };
  }, [isAdmin, rawMember, viewAsMode]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'เข้าสู่ระบบไม่สำเร็จ' };
      }

      setRawMember(data.member);
      setViewAsMode('actual');
      if (typeof window !== 'undefined') {
        localStorage.setItem('safesoul_member', JSON.stringify(data.member));
        trackActivityEvent({
          eventType: 'login',
          path: '/login',
          targetId: data.member.id,
          targetTitle: `เข้าสู่ระบบ: ${data.member.name}`,
          member: data.member,
        });
      }
      return { success: true, member: data.member };
    } catch {
      return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' };
    }
  };

  const register = async (data: RegisterPayload) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();

      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'ลงทะเบียนไม่สำเร็จ' };
      }

      setRawMember(resData.member);
      setViewAsMode('actual');
      if (typeof window !== 'undefined') {
        localStorage.setItem('safesoul_member', JSON.stringify(resData.member));
        trackActivityEvent({
          eventType: 'login',
          path: '/login',
          targetId: resData.member.id,
          targetTitle: `ลงทะเบียน & เข้าสู่ระบบ: ${resData.member.name}`,
          member: resData.member,
        });
      }
      return { success: true, member: resData.member };
    } catch {
      return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' };
    }
  };

  const upgradeMembership = async (data: UpgradePayload) => {
    const targetMember = rawMember;
    if (!targetMember) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการอัปเกรด' };
    }
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: targetMember.id,
          ...data,
        }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'ส่งข้อมูลอัปเกรดไม่สำเร็จ' };
      }
      setRawMember(resData.member);
      if (typeof window !== 'undefined') {
        localStorage.setItem('safesoul_member', JSON.stringify(resData.member));
      }
      return { success: true, member: resData.member };
    } catch {
      return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setRawMember(null);
    setViewAsMode('actual');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('safesoul_member');
      try {
        sessionStorage.removeItem(VIEW_AS_STORAGE_KEY);
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        member: effectiveMember,
        rawMember,
        isLoggedIn: !!effectiveMember,
        isAdmin,
        viewAsMode,
        setViewAsMode,
        isLoading,
        login,
        register,
        upgradeMembership,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

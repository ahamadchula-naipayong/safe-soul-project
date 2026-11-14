'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Member, TierType } from '@/types';

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
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; member?: Member }>;
  register: (data: RegisterPayload) => Promise<{ success: boolean; error?: string; member?: Member }>;
  upgradeMembership: (data: UpgradePayload) => Promise<{ success: boolean; error?: string; member?: Member }>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (data.authenticated && data.member) {
        setMember(data.member);
        if (typeof window !== 'undefined') {
          localStorage.setItem('safesoul_member', JSON.stringify(data.member));
        }
      }
    } catch {}
  };

  // Load member from localStorage / cookie on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('safesoul_member');
      if (stored) {
        try {
          setMember(JSON.parse(stored));
        } catch {
          localStorage.removeItem('safesoul_member');
        }
      }

      fetch('/api/auth/me', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.member) {
            setMember(data.member);
            localStorage.setItem('safesoul_member', JSON.stringify(data.member));
          } else if (!stored) {
            setMember(null);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, []);

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

      setMember(data.member);
      if (typeof window !== 'undefined') {
        localStorage.setItem('safesoul_member', JSON.stringify(data.member));
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

      setMember(resData.member);
      if (typeof window !== 'undefined') {
        localStorage.setItem('safesoul_member', JSON.stringify(resData.member));
      }
      return { success: true, member: resData.member };
    } catch {
      return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' };
    }
  };

  const upgradeMembership = async (data: UpgradePayload) => {
    if (!member) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการอัปเกรด' };
    }
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          ...data,
        }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'ส่งข้อมูลอัปเกรดไม่สำเร็จ' };
      }
      setMember(resData.member);
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
    setMember(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('safesoul_member');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        member,
        isLoggedIn: !!member,
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

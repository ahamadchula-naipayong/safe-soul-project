import { Member, TierType } from '@/types';

export const SUBSCRIPTION_PRICING = {
  MONTHLY_PRICE: 199,
  YEARLY_PRICE: 1990,
  LIFETIME_PRICE: 3990,
  YEARLY_TO_LIFETIME_DIFF: 3990 - 1990, // 2,000 THB
  MONTHLY_DAYS: 30,
  YEARLY_DAYS: 365,
  GRACE_DAYS_AFTER_EXPIRY: 2,
} as const;

export type SubscriptionAlertState =
  | 'none'
  | 'active'
  | 'warning_7d'
  | 'warning_3d'
  | 'due_today'
  | 'grace_period'
  | 'expired';

export interface SubscriptionStatusInfo {
  hasExpiry: boolean;
  expiresAt: string | null;
  expiresAtThai: string;
  daysRemaining: number | null; // >0 before expiry, 0 = due today, -1..-2 = grace period, <-2 = expired
  graceDaysLeft: number; // 2, 1, or 0
  state: SubscriptionAlertState;
  isRevoked: boolean; // true once past expiry + 2 grace days
  shouldRemind: boolean; // true on <=7d, <=3d, 0d, grace, or expired
  reminderBadgeText: string;
  reminderDetailText: string;
  isActiveYearly: boolean; // eligible for 2,000 THB annual->lifetime upgrade diff
}

export function formatThaiDateOnly(iso?: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Bangkok',
    });
  } catch {
    return iso;
  }
}

function getBangkokDayStartMs(dateInput: Date | string | number): number {
  const d = new Date(dateInput);
  // Shift to UTC+7, floor to calendar date, return UTC ms representing BKK 00:00
  const bkkMs = d.getTime() + 7 * 60 * 60 * 1000;
  return Math.floor(bkkMs / 86400000) * 86400000;
}

/**
 * Computes next expiry ISO timestamp (Bangkok 23:59:59+07:00) when paying for monthly (30d) or yearly (365d).
 * If renewing before current expiry, extends from current expiry so the member never loses remaining days.
 */
export function calculateNextSubscriptionExpiry(
  billingCycle: 'monthly' | 'yearly',
  existingExpiresAt?: string | null,
  nowDate: Date = new Date()
): string {
  const daysToAdd =
    billingCycle === 'yearly'
      ? SUBSCRIPTION_PRICING.YEARLY_DAYS
      : SUBSCRIPTION_PRICING.MONTHLY_DAYS;

  let baseMs = nowDate.getTime();
  if (existingExpiresAt) {
    const existingMs = new Date(existingExpiresAt).getTime();
    if (!isNaN(existingMs) && existingMs > baseMs) {
      baseMs = existingMs;
    }
  }
  const target = new Date(baseMs + daysToAdd * 24 * 60 * 60 * 1000);
  // Format as YYYY-MM-DDT23:59:59+07:00 in Bangkok time
  const bkk = new Date(target.getTime() + 7 * 60 * 60 * 1000);
  const ymd = bkk.toISOString().slice(0, 10);
  return `${ymd}T23:59:59+07:00`;
}

/**
 * Evaluates Supporter (monthly/yearly) subscription status including:
 * - 7-day advance warning
 * - 3-day advance warning
 * - Due-today warning (0 days left)
 * - 2-day grace period after expiry
 * - Automatic access revocation after >2 days past expiry
 */
export function getSubscriptionStatus(
  member: Member | null | undefined,
  nowDate: Date = new Date()
): SubscriptionStatusInfo {
  if (!member || member.tier !== 'supporter_tier_2') {
    return {
      hasExpiry: false,
      expiresAt: null,
      expiresAtThai: member?.tier === 'founding_tier_3' ? 'ตลอดชีพ (ไม่มีวันหมดอายุ)' : '-',
      daysRemaining: null,
      graceDaysLeft: 0,
      state: 'none',
      isRevoked: false,
      shouldRemind: false,
      reminderBadgeText: '',
      reminderDetailText: '',
      isActiveYearly: false,
    };
  }

  // Admin / Co-Admin accounts never get revoked
  const isStaff = member.role === 'admin' || member.role === 'co_admin' || member.memberNumber === 1;
  if (isStaff) {
    return {
      hasExpiry: false,
      expiresAt: member.subscriptionExpiresAt || null,
      expiresAtThai: 'ตลอดชีพ (ผู้ดูแลระบบ)',
      daysRemaining: null,
      graceDaysLeft: 0,
      state: 'active',
      isRevoked: false,
      shouldRemind: false,
      reminderBadgeText: '',
      reminderDetailText: '',
      isActiveYearly: false,
    };
  }

  // Fallback expiry: if legacy verified supporter has no explicit column yet, derive from createdAt + cycle
  let expiresAt = member.subscriptionExpiresAt || null;
  if (!expiresAt && member.paymentStatus === 'verified') {
    const baseDate = member.updatedAt || member.createdAt;
    const cycle = member.billingCycle === 'yearly' ? 'yearly' : 'monthly';
    expiresAt = calculateNextSubscriptionExpiry(cycle, null, new Date(baseDate));
  }

  if (!expiresAt) {
    return {
      hasExpiry: false,
      expiresAt: null,
      expiresAtThai: 'รอการยืนยันงวดแรก',
      daysRemaining: null,
      graceDaysLeft: 0,
      state: 'none',
      isRevoked: false,
      shouldRemind: false,
      reminderBadgeText: '',
      reminderDetailText: '',
      isActiveYearly: false,
    };
  }

  const todayDayMs = getBangkokDayStartMs(nowDate);
  const expiryDayMs = getBangkokDayStartMs(expiresAt);
  const daysRemaining = Math.round((expiryDayMs - todayDayMs) / 86400000);
  const expiresAtThai = formatThaiDateOnly(expiresAt);
  const isYearly = member.billingCycle === 'yearly' || (member.paymentAmount ?? 0) >= 1990;

  if (daysRemaining > 7) {
    return {
      hasExpiry: true,
      expiresAt,
      expiresAtThai,
      daysRemaining,
      graceDaysLeft: SUBSCRIPTION_PRICING.GRACE_DAYS_AFTER_EXPIRY,
      state: 'active',
      isRevoked: false,
      shouldRemind: false,
      reminderBadgeText: `เหลืออีก ${daysRemaining} วัน`,
      reminderDetailText: `กำหนดชำระงวดถัดไป: ${expiresAtThai}`,
      isActiveYearly: isYearly && member.paymentStatus === 'verified',
    };
  }

  if (daysRemaining > 3) {
    return {
      hasExpiry: true,
      expiresAt,
      expiresAtThai,
      daysRemaining,
      graceDaysLeft: SUBSCRIPTION_PRICING.GRACE_DAYS_AFTER_EXPIRY,
      state: 'warning_7d',
      isRevoked: false,
      shouldRemind: true,
      reminderBadgeText: `แจ้งเตือนล่วงหน้า • เหลือ ${daysRemaining} วัน`,
      reminderDetailText: `สิทธิ์เรือประมงน้ำลึกของคุณจะครบกำหนดชำระในวันที่ ${expiresAtThai} (อีก ${daysRemaining} วัน) — สามารถต่อรายเดือน ฿199 หรือปรับเป็นรายปี ฿1,990 ได้ทันที`,
      isActiveYearly: isYearly && member.paymentStatus === 'verified',
    };
  }

  if (daysRemaining > 0) {
    return {
      hasExpiry: true,
      expiresAt,
      expiresAtThai,
      daysRemaining,
      graceDaysLeft: SUBSCRIPTION_PRICING.GRACE_DAYS_AFTER_EXPIRY,
      state: 'warning_3d',
      isRevoked: false,
      shouldRemind: true,
      reminderBadgeText: `ใกล้หมดอายุ • เหลือเพียง ${daysRemaining} วัน`,
      reminderDetailText: `สิทธิ์สมาชิกจะครบกำหนดในวันที่ ${expiresAtThai} (อีก ${daysRemaining} วัน) กรุณาต่ออายุเพื่อให้เข้าถึงทะเลน้ำลึกและข่าว Deepdive ได้อย่างต่อเนื่อง`,
      isActiveYearly: isYearly && member.paymentStatus === 'verified',
    };
  }

  if (daysRemaining === 0) {
    return {
      hasExpiry: true,
      expiresAt,
      expiresAtThai,
      daysRemaining: 0,
      graceDaysLeft: SUBSCRIPTION_PRICING.GRACE_DAYS_AFTER_EXPIRY,
      state: 'due_today',
      isRevoked: false,
      shouldRemind: true,
      reminderBadgeText: 'ครบกำหนดชำระวันนี้!',
      reminderDetailText: `วันนี้ (${expiresAtThai}) คือวันครบกำหนดชำระรอบบิลของคุณ กรุณาต่ออายุภายใน 2 วัน ก่อนระบบจะปรับสิทธิ์เป็น Free Tier อัตโนมัติ`,
      isActiveYearly: isYearly && member.paymentStatus === 'verified',
    };
  }

  const daysPastExpiry = Math.abs(daysRemaining);
  if (daysPastExpiry <= SUBSCRIPTION_PRICING.GRACE_DAYS_AFTER_EXPIRY) {
    const graceDaysLeft = SUBSCRIPTION_PRICING.GRACE_DAYS_AFTER_EXPIRY - daysPastExpiry;
    return {
      hasExpiry: true,
      expiresAt,
      expiresAtThai,
      daysRemaining,
      graceDaysLeft,
      state: 'grace_period',
      isRevoked: false,
      shouldRemind: true,
      reminderBadgeText: `เลยกำหนด ${daysPastExpiry} วัน (ผ่อนผันได้อีก ${graceDaysLeft} วัน)`,
      reminderDetailText: `เลยวันหมดอายุ (${expiresAtThai}) มาแล้ว ${daysPastExpiry} วัน ระบบยังคงสิทธิ์ไว้ให้ชั่วคราวและจะนำสิทธิ์ออกอัตโนมัติเมื่อครบ 2 วันหลังหมดอายุ`,
      isActiveYearly: isYearly && member.paymentStatus === 'verified',
    };
  }

  // > 2 days past expiry -> Revoked automatically to free_tier_1
  return {
    hasExpiry: true,
    expiresAt,
    expiresAtThai,
    daysRemaining,
    graceDaysLeft: 0,
    state: 'expired',
    isRevoked: true,
    shouldRemind: true,
    reminderBadgeText: `หมดอายุแล้ว (${expiresAtThai})`,
    reminderDetailText: `เลยกำหนดชำระเกิน 2 วันแล้ว ระบบปรับสิทธิ์ชั่วคราวเป็นเรือประมงน้ำตื้น (Free Tier) อัตโนมัติ — ชำระต่ออายุเพื่อปลดล็อกสิทธิ์กลับคืนทันที`,
    isActiveYearly: false,
  };
}

/**
 * Calculates the exact required payment amount for a member choosing a target tier & billing cycle.
 * Special rule: Active Yearly Supporter (paid ฿1,990) upgrading to Lifetime Founding 100 pays ONLY the difference (฿3,990 - ฿1,990 = ฿2,000)!
 */
export function calculateUpgradePrice(
  member: Member | null | undefined,
  targetTier: TierType,
  billingCycle: 'monthly' | 'yearly' = 'monthly'
): {
  amount: number;
  originalAmount: number;
  discountApplied: number;
  isAnnualToLifetimeDiff: boolean;
  label: string;
} {
  if (targetTier === 'free_tier_1') {
    return {
      amount: 0,
      originalAmount: 0,
      discountApplied: 0,
      isAnnualToLifetimeDiff: false,
      label: 'ฟรี ฿0',
    };
  }

  if (targetTier === 'supporter_tier_2') {
    const amt =
      billingCycle === 'yearly'
        ? SUBSCRIPTION_PRICING.YEARLY_PRICE
        : SUBSCRIPTION_PRICING.MONTHLY_PRICE;
    return {
      amount: amt,
      originalAmount: amt,
      discountApplied: 0,
      isAnnualToLifetimeDiff: false,
      label: billingCycle === 'yearly' ? 'รายปี ฿1,990 / ปี' : 'รายเดือน ฿199 / เดือน',
    };
  }

  // targetTier === 'founding_tier_3' (Lifetime)
  const subInfo = getSubscriptionStatus(member);
  if (subInfo.isActiveYearly) {
    return {
      amount: SUBSCRIPTION_PRICING.YEARLY_TO_LIFETIME_DIFF,
      originalAmount: SUBSCRIPTION_PRICING.LIFETIME_PRICE,
      discountApplied: SUBSCRIPTION_PRICING.YEARLY_PRICE,
      isAnnualToLifetimeDiff: true,
      label: 'ส่วนต่างตลอดชีพ ฿2,000 (หักค่ารายปี ฿1,990 แล้ว)',
    };
  }

  return {
    amount: SUBSCRIPTION_PRICING.LIFETIME_PRICE,
    originalAmount: SUBSCRIPTION_PRICING.LIFETIME_PRICE,
    discountApplied: 0,
    isAnnualToLifetimeDiff: false,
    label: 'ตลอดชีพ ฿3,990 ครั้งเดียว',
  };
}

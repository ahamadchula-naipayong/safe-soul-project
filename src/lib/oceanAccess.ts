import { Member, TierType, ArticleStatus } from '@/types';
import {
  SHALLOW_WATERS_RELEASE_ISO,
  getDeepOceanScheduledIso,
  isReleasedBySchedule,
  formatThaiScheduleDate,
} from '@/lib/releaseSchedule';

export type EffectiveTier = 'visitor' | TierType;

export interface OceanAccessResult {
  canAccess: boolean;
  effectiveTier: EffectiveTier;
  isPendingVerification: boolean;
  badgeText: string;
  scheduledAt: string;
  scheduledText: string;
  isReleased: boolean;
  lockReason?: 'login_required' | 'upgrade_required' | 'weekly_release_wait' | 'pending_slip';
  requiredVesselName?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function getEffectiveMemberTier(member: Member | null | undefined): {
  effectiveTier: EffectiveTier;
  isPendingVerification: boolean;
} {
  if (!member) {
    return { effectiveTier: 'visitor', isPendingVerification: false };
  }
  if (
    (member.tier === 'supporter_tier_2' || member.tier === 'founding_tier_3') &&
    member.paymentStatus === 'pending_verification'
  ) {
    return { effectiveTier: 'free_tier_1', isPendingVerification: true };
  }
  return { effectiveTier: member.tier, isPendingVerification: false };
}

export function getVesselDisplayName(tier: EffectiveTier): string {
  switch (tier) {
    case 'founding_tier_3':
      return 'เรือสำราญทุกมรสุม (Founding 100 ตลอดชีพ)';
    case 'supporter_tier_2':
      return 'เรือประมงน้ำลึก (Supporter รายเดือน)';
    case 'free_tier_1':
      return 'เรือประมงน้ำตื้น (Free-tier)';
    default:
      return 'ผู้มาเยือน (ยังไม่ได้ขึ้นเรือ)';
  }
}

export function checkOceanArticleAccess(params: {
  realm: 'shallow' | 'deep';
  archipelagoNumber?: number;
  chapterNumber: number;
  isUnlocked?: boolean;
  status?: ArticleStatus;
  publishedAt?: string;
  member: Member | null | undefined;
}): OceanAccessResult {
  const {
    realm,
    archipelagoNumber = 1,
    chapterNumber,
    isUnlocked = false,
    publishedAt,
    member,
  } = params;

  const { effectiveTier, isPendingVerification } = getEffectiveMemberTier(member);

  // 1. Shallow Waters (7 Islands) -> Released W1 (19 Nov 2026 05:00), Open sea for everyone
  if (realm === 'shallow') {
    const scheduledAt = publishedAt || SHALLOW_WATERS_RELEASE_ISO;
    const scheduledText = formatThaiScheduleDate(scheduledAt, true);
    return {
      canAccess: true,
      effectiveTier,
      isPendingVerification,
      badgeText: 'ทะเลเปิด • อ่านฟรีทุกคน',
      scheduledAt,
      scheduledText,
      isReleased: true,
    };
  }

  // 2. Deep Ocean (10 Archipelagos • 50 Sub-Islands)
  const scheduledAt =
    publishedAt || getDeepOceanScheduledIso(archipelagoNumber, chapterNumber);
  const scheduledText = formatThaiScheduleDate(scheduledAt, true);
  const scheduledShort = formatThaiScheduleDate(scheduledAt, false);
  const isReleased = isReleasedBySchedule(scheduledAt);

  const isFreeSampleChapter = isUnlocked || (archipelagoNumber <= 7 && chapterNumber === 1);

  // A. Founding 100 (ตลอดชีพ) -> Unlocks 100% of all 10 Archipelagos (50 chapters) immediately (Early Access)
  if (effectiveTier === 'founding_tier_3') {
    return {
      canAccess: true,
      effectiveTier,
      isPendingVerification,
      badgeText: isReleased
        ? 'ปลดล็อกครบ 100% (Founding 100)'
        : `สิทธิ์ Founding 100 อ่านล่วงหน้า (เผยแพร่ทั่วไป ${scheduledShort})`,
      scheduledAt,
      scheduledText,
      isReleased,
    };
  }

  // B. Supporter Tier 2 (รายเดือน) -> Unlocks all chapters whose scheduled release date (05:00) has arrived
  if (effectiveTier === 'supporter_tier_2') {
    if (isReleased) {
      return {
        canAccess: true,
        effectiveTier,
        isPendingVerification,
        badgeText: 'ปลดล็อกแล้วตามตารางเผยแพร่ (Supporter)',
        scheduledAt,
        scheduledText,
        isReleased,
      };
    }
    return {
      canAccess: false,
      effectiveTier,
      isPendingVerification,
      badgeText: `กำหนดเผยแพร่: ${scheduledShort}`,
      scheduledAt,
      scheduledText,
      isReleased,
      lockReason: 'weekly_release_wait',
      requiredVesselName: 'เรือสำราญทุกมรสุม (Founding 100 • อ่านล่วงหน้าทันที)',
      actionHref: '/pricing',
      actionLabel: 'อัปเกรดเป็น Founding 100 เพื่ออ่านล่วงหน้าทันที',
    };
  }

  // C. Free Member Tier 1 -> Unlocks Chapter 1 of Archipelagos 1-7 once scheduled release time arrives
  if (effectiveTier === 'free_tier_1') {
    if (isFreeSampleChapter && isReleased) {
      return {
        canAccess: true,
        effectiveTier,
        isPendingVerification,
        badgeText: 'ปลดล็อกบทที่ 1 (Free-tier)',
        scheduledAt,
        scheduledText,
        isReleased,
      };
    }

    if (isPendingVerification) {
      return {
        canAccess: false,
        effectiveTier,
        isPendingVerification,
        badgeText: 'รอแอดมินตรวจสอบสลิปโอนเงิน',
        scheduledAt,
        scheduledText,
        isReleased,
        lockReason: 'pending_slip',
        requiredVesselName:
          member?.tier === 'founding_tier_3'
            ? 'เรือสำราญทุกมรสุม (รอตรวจสลิป)'
            : 'เรือประมงน้ำลึก (รอตรวจสลิป)',
        actionHref: '/login',
        actionLabel: 'ตรวจสอบสถานะบัตรสมาชิก',
      };
    }

    if (isFreeSampleChapter && !isReleased) {
      return {
        canAccess: false,
        effectiveTier,
        isPendingVerification,
        badgeText: `เปิดอ่านฟรี: ${scheduledShort}`,
        scheduledAt,
        scheduledText,
        isReleased,
        lockReason: 'weekly_release_wait',
        requiredVesselName: 'เรือสำราญทุกมรสุม (Founding 100 • อ่านล่วงหน้าทันที)',
        actionHref: '/pricing',
        actionLabel: 'อัปเกรดเป็น Founding 100 เพื่ออ่านล่วงหน้าทันที',
      };
    }

    return {
      canAccess: false,
      effectiveTier,
      isPendingVerification,
      badgeText: isReleased
        ? 'เฉพาะสมาชิก รายเดือน / ตลอดชีพ'
        : `เผยแพร่ ${scheduledShort} (อ่านทันทีเฉพาะ Founding 100)`,
      scheduledAt,
      scheduledText,
      isReleased,
      lockReason: 'upgrade_required',
      requiredVesselName: isReleased
        ? 'เรือประมงน้ำลึก (฿199/เดือน) หรือ Founding 100'
        : 'เรือสำราญทุกมรสุม (Founding 100)',
      actionHref: '/pricing',
      actionLabel: 'อัปเกรดระดับเรือเพื่อปลดล็อก',
    };
  }

  // D. Visitor (Not logged in) -> All Deep Ocean locked
  return {
    canAccess: false,
    effectiveTier,
    isPendingVerification,
    badgeText: isFreeSampleChapter
      ? isReleased
        ? 'เข้าสู่ระบบฟรีเพื่ออ่านบทที่ 1'
        : `เปิดอ่านฟรี: ${scheduledShort}`
      : isReleased
      ? 'เฉพาะสมาชิกสนับสนุน / Founding 100'
      : `เผยแพร่ ${scheduledShort} (Founding 100 อ่านทันที)`,
    scheduledAt,
    scheduledText,
    isReleased,
    lockReason: 'login_required',
    requiredVesselName: isFreeSampleChapter
      ? 'เรือประมงน้ำตื้น (สมัครฟรี)'
      : 'เรือประมงน้ำลึก หรือ เรือสำราญทุกมรสุม',
    actionHref: isFreeSampleChapter ? '/login' : '/pricing',
    actionLabel: isFreeSampleChapter
      ? 'เข้าสู่ระบบ / สมัครฟรีเพื่ออ่าน'
      : 'ดูแผนระดับเรือ & สมัครสมาชิก',
  };
}

/**
 * Check Audio Playback Access according to Tier Rules:
 * - Visitor (Not logged in): Can listen ONLY to Shallow Waters Islands 1-3 (chapterNumber <= 3)
 * - Free Member (free_tier_1): Can listen to ALL 7 Islands of Shallow Waters (realm === 'shallow')
 * - Supporter (supporter_tier_2) & Founding 100 (founding_tier_3): Can listen to all 7 Shallow Waters + Deep Ocean chapters according to their package & schedule access
 */
export function checkOceanAudioAccess(params: {
  realm: 'shallow' | 'deep';
  archipelagoNumber?: number;
  chapterNumber: number;
  isUnlocked?: boolean;
  status?: ArticleStatus;
  publishedAt?: string;
  member: Member | null | undefined;
}): OceanAccessResult {
  const {
    realm,
    archipelagoNumber = 1,
    chapterNumber,
    isUnlocked = false,
    status = 'published',
    publishedAt,
    member,
  } = params;

  const { effectiveTier, isPendingVerification } = getEffectiveMemberTier(member);

  // 1. Shallow Waters (7 Islands)
  if (realm === 'shallow') {
    const scheduledAt = publishedAt || SHALLOW_WATERS_RELEASE_ISO;
    const scheduledText = formatThaiScheduleDate(scheduledAt, true);

    if (!member || effectiveTier === 'visitor') {
      if (chapterNumber <= 3) {
        return {
          canAccess: true,
          effectiveTier,
          isPendingVerification,
          badgeText: 'เปิดฟังฟรี (ทะเลน้ำตื้น เกาะ 1–3)',
          scheduledAt,
          scheduledText,
          isReleased: true,
        };
      }
      return {
        canAccess: false,
        effectiveTier,
        isPendingVerification,
        badgeText: 'เข้าสู่ระบบฟรีเพื่อฟังเกาะที่ 4–7',
        scheduledAt,
        scheduledText,
        isReleased: true,
        lockReason: 'login_required',
        requiredVesselName: 'เรือประมงน้ำตื้น (สมัครสมาชิกฟรี)',
        actionHref: '/login',
        actionLabel: 'เข้าสู่ระบบ / สมัครฟรีเพื่อฟังครบ 7 เกาะ',
      };
    }

    return {
      canAccess: true,
      effectiveTier,
      isPendingVerification,
      badgeText: 'ปลดล็อกเสียงครบ 7 เกาะน้ำตื้น',
      scheduledAt,
      scheduledText,
      isReleased: true,
    };
  }

  // 2. Deep Ocean (10 Archipelagos) -> Only Supporter & Founding 100 according to package & schedule access
  const scheduledAt =
    publishedAt || getDeepOceanScheduledIso(archipelagoNumber, chapterNumber);
  const scheduledText = formatThaiScheduleDate(scheduledAt, true);
  const isReleased = isReleasedBySchedule(scheduledAt);

  if (effectiveTier === 'supporter_tier_2' || effectiveTier === 'founding_tier_3') {
    const articleAccess = checkOceanArticleAccess({
      realm: 'deep',
      archipelagoNumber,
      chapterNumber,
      isUnlocked,
      status,
      publishedAt: scheduledAt,
      member,
    });
    if (articleAccess.canAccess) {
      return {
        ...articleAccess,
        badgeText:
          effectiveTier === 'founding_tier_3'
            ? 'ปลดล็อกเสียง 100% (Founding 100)'
            : 'ปลดล็อกเสียงตามตารางเผยแพร่ (Supporter)',
      };
    }
    return articleAccess;
  }

  return {
    canAccess: false,
    effectiveTier,
    isPendingVerification,
    badgeText: isPendingVerification
      ? 'รอแอดมินตรวจสลิปเพื่อปลดล็อกเสียงน้ำลึก'
      : 'เฉพาะแพ็กเกจเรือประมงน้ำลึก / Founding 100',
    scheduledAt,
    scheduledText,
    isReleased,
    lockReason: isPendingVerification ? 'pending_slip' : 'upgrade_required',
    requiredVesselName: 'เรือประมงน้ำลึก (฿199/เดือน) หรือ เรือสำราญทุกมรสุม (Founding 100)',
    actionHref: '/pricing',
    actionLabel: 'อัปเกรดแพ็กเกจเพื่อฟังเสียงทะเลน้ำลึก',
  };
}

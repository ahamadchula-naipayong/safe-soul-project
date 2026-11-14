import { Member, TierType, ArticleStatus } from '@/types';

export type EffectiveTier = 'visitor' | TierType;

export interface OceanAccessResult {
  canAccess: boolean;
  effectiveTier: EffectiveTier;
  isPendingVerification: boolean;
  badgeText: string;
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
      return 'เรือสำราญทุกมรสุม (Founding 100)';
    case 'supporter_tier_2':
      return 'เรือประมงน้ำลึก (Supporter)';
    case 'free_tier_1':
      return 'เรือประมงน้ำตื้น (Free Member)';
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
    status = 'published',
    publishedAt,
    member,
  } = params;

  const { effectiveTier, isPendingVerification } = getEffectiveMemberTier(member);

  // 1. Shallow Waters (7 Islands) -> Open sea for everyone
  if (realm === 'shallow') {
    return {
      canAccess: true,
      effectiveTier,
      isPendingVerification,
      badgeText: 'ทะเลเปิด • อ่านฟรีทุกคน',
    };
  }

  // Determine if chapter is live for weekly Supporter release
  const isLivePublished =
    status === 'published' ||
    (status === 'scheduled' && !!publishedAt && new Date(publishedAt).getTime() <= Date.now());

  const isFreeSampleChapter = isUnlocked || (archipelagoNumber <= 7 && chapterNumber === 1);

  // 2. Founding 100 -> Unlocks 100% of all 10 Archipelagos (50 chapters) immediately
  if (effectiveTier === 'founding_tier_3') {
    return {
      canAccess: true,
      effectiveTier,
      isPendingVerification,
      badgeText: 'ปลดล็อกครบ 100% (Founding 100)',
    };
  }

  // 3. Supporter Tier 2 -> Unlocks all published weekly chapters
  if (effectiveTier === 'supporter_tier_2') {
    if (isLivePublished || isFreeSampleChapter) {
      return {
        canAccess: true,
        effectiveTier,
        isPendingVerification,
        badgeText: 'ปลดล็อกแล้ว (Supporter)',
      };
    }
    return {
      canAccess: false,
      effectiveTier,
      isPendingVerification,
      badgeText: 'รอปลดล็อกรายสัปดาห์ / Founding 100',
      lockReason: 'weekly_release_wait',
      requiredVesselName: 'เรือสำราญทุกมรสุม (Founding 100)',
      actionHref: '/pricing',
      actionLabel: 'อัปเกรดเป็น Founding 100 เพื่ออ่านทันที',
    };
  }

  // 4. Free Member Tier 1 -> Unlocks Chapter 1 of Archipelagos 1-7
  if (effectiveTier === 'free_tier_1') {
    if (isFreeSampleChapter) {
      return {
        canAccess: true,
        effectiveTier,
        isPendingVerification,
        badgeText: 'ปลดล็อกบทที่ 1 (Free Member)',
      };
    }

    if (isPendingVerification) {
      return {
        canAccess: false,
        effectiveTier,
        isPendingVerification,
        badgeText: 'รอแอดมินตรวจสอบสลิปโอนเงิน',
        lockReason: 'pending_slip',
        requiredVesselName:
          member?.tier === 'founding_tier_3'
            ? 'เรือสำราญทุกมรสุม (รอตรวจสลิป)'
            : 'เรือประมงน้ำลึก (รอตรวจสลิป)',
        actionHref: '/login',
        actionLabel: 'ตรวจสอบสถานะบัตรสมาชิก',
      };
    }

    return {
      canAccess: false,
      effectiveTier,
      isPendingVerification,
      badgeText: isLivePublished
        ? 'เฉพาะเรือประมงน้ำลึก / Founding 100'
        : 'เฉพาะเรือสำราญทุกมรสุม (Founding 100)',
      lockReason: 'upgrade_required',
      requiredVesselName: isLivePublished
        ? 'เรือประมงน้ำลึก (฿199/เดือน) หรือ Founding 100'
        : 'เรือสำราญทุกมรสุม (Founding 100)',
      actionHref: '/pricing',
      actionLabel: 'อัปเกรดระดับเรือเพื่อปลดล็อก',
    };
  }

  // 5. Visitor (Not logged in) -> All Deep Ocean locked
  return {
    canAccess: false,
    effectiveTier,
    isPendingVerification,
    badgeText: isFreeSampleChapter
      ? 'เข้าสู่ระบบฟรีเพื่ออ่านบทที่ 1'
      : isLivePublished
      ? 'เฉพาะสมาชิกสนับสนุน / Founding 100'
      : 'เฉพาะสมาชิก Founding 100',
    lockReason: 'login_required',
    requiredVesselName: isFreeSampleChapter
      ? 'เรือประมงน้ำตื้น (สมัครฟรี)'
      : 'เรือประมงน้ำลึก หรือ เรือสำราญทุกมรสุม',
    actionHref: isFreeSampleChapter ? '/login' : '/pricing',
    actionLabel: isFreeSampleChapter ? 'เข้าสู่ระบบ / สมัครฟรีเพื่ออ่าน' : 'ดูแผนระดับเรือ & สมัครสมาชิก',
  };
}

/**
 * Check Audio Playback Access according to Tier Rules:
 * - Visitor (Not logged in): Can listen ONLY to Shallow Waters Islands 1-3 (chapterNumber <= 3)
 * - Free Member (free_tier_1): Can listen to ALL 7 Islands of Shallow Waters (realm === 'shallow')
 * - Supporter (supporter_tier_2) & Founding 100 (founding_tier_3): Can listen to all 7 Shallow Waters + Deep Ocean chapters according to their package access
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
    // Visitor (not logged in) -> Only Islands 1, 2, 3
    if (!member || effectiveTier === 'visitor') {
      if (chapterNumber <= 3) {
        return {
          canAccess: true,
          effectiveTier,
          isPendingVerification,
          badgeText: 'เปิดฟังฟรี (ทะเลน้ำตื้น เกาะ 1–3)',
        };
      }
      return {
        canAccess: false,
        effectiveTier,
        isPendingVerification,
        badgeText: 'เข้าสู่ระบบฟรีเพื่อฟังเกาะที่ 4–7',
        lockReason: 'login_required',
        requiredVesselName: 'เรือประมงน้ำตื้น (สมัครสมาชิกฟรี)',
        actionHref: '/login',
        actionLabel: 'เข้าสู่ระบบ / สมัครฟรีเพื่อฟังครบ 7 เกาะ',
      };
    }

    // Any logged-in member (free_tier_1, supporter_tier_2, founding_tier_3) -> Unlocks all 7 Shallow Waters islands!
    return {
      canAccess: true,
      effectiveTier,
      isPendingVerification,
      badgeText: 'ปลดล็อกเสียงครบ 7 เกาะน้ำตื้น',
    };
  }

  // 2. Deep Ocean (10 Archipelagos) -> Only Supporter & Founding 100 according to package access
  if (effectiveTier === 'supporter_tier_2' || effectiveTier === 'founding_tier_3') {
    const articleAccess = checkOceanArticleAccess({
      realm: 'deep',
      archipelagoNumber,
      chapterNumber,
      isUnlocked,
      status,
      publishedAt,
      member,
    });
    if (articleAccess.canAccess) {
      return {
        ...articleAccess,
        badgeText:
          effectiveTier === 'founding_tier_3'
            ? 'ปลดล็อกเสียง 100% (Founding 100)'
            : 'ปลดล็อกเสียงตามแพ็กเกจ (Supporter)',
      };
    }
    return articleAccess;
  }

  // Free Member or Visitor on Deep Ocean audio -> Locked (Requires Supporter or Founding 100)
  return {
    canAccess: false,
    effectiveTier,
    isPendingVerification,
    badgeText: isPendingVerification
      ? 'รอแอดมินตรวจสลิปเพื่อปลดล็อกเสียงน้ำลึก'
      : 'เฉพาะแพ็กเกจเรือประมงน้ำลึก / Founding 100',
    lockReason: isPendingVerification ? 'pending_slip' : 'upgrade_required',
    requiredVesselName: 'เรือประมงน้ำลึก (฿199/เดือน) หรือ เรือสำราญทุกมรสุม (Founding 100)',
    actionHref: '/pricing',
    actionLabel: 'อัปเกรดแพ็กเกจเพื่อฟังเสียงทะเลน้ำลึก',
  };
}

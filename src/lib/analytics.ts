export type ActivityEventType =
  | 'pageview'
  | 'login'
  | 'article_read'
  | 'news_read'
  | 'audio_play'
  | 'audio_complete';

export interface ActivityTrackPayload {
  eventType: ActivityEventType;
  path?: string;
  targetId?: string;
  targetTitle?: string;
  member?: {
    id?: string;
    memberNumber?: number;
    username?: string;
    name?: string;
    tier?: string;
  } | null;
}

export interface MemberActivitySummary {
  memberId: string;
  memberNumber: number | null;
  username: string;
  name: string;
  tier: string;
  visitCount: number;
  loginCount: number;
  deviceCount: number;
  devices: string[];
  articlesReadCount: number;
  articlesRead: { id: string; title: string; lastAt: string }[];
  newsReadCount: number;
  newsRead: { id: string; title: string; lastAt: string }[];
  audioStartedCount: number;
  audioCompletedCount: number;
  audioCompleted: { id: string; title: string; lastAt: string }[];
  lastActiveAt: string;
}

export interface AnalyticsSummaryResponse {
  success: boolean;
  overview: {
    totalPageviews: number;
    todayPageviews: number;
    last7DaysPageviews: number;
    uniqueVisitors: number;
    todayUniqueVisitors: number;
    totalLogins: number;
    totalArticleReads: number;
    totalNewsReads: number;
    totalAudioPlays: number;
    totalAudioCompletions: number;
    activeMembersCount: number;
  };
  dailyTraffic: {
    date: string;
    label: string;
    pageviews: number;
    uniqueVisitors: number;
    memberActions: number;
  }[];
  topPages: {
    path: string;
    title: string;
    count: number;
  }[];
  deviceBreakdown: {
    label: string;
    count: number;
  }[];
  memberStats: MemberActivitySummary[];
  recentEvents: {
    id: string;
    eventType: ActivityEventType;
    memberName: string;
    memberNumber: number | null;
    deviceLabel: string;
    path: string;
    targetTitle: string;
    createdAt: string;
  }[];
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    const existing = localStorage.getItem('fitrah_device_session_id');
    if (existing) return existing;
    const generated = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('fitrah_device_session_id', generated);
    return generated;
  } catch {
    return `ephemeral_${Date.now().toString(36)}`;
  }
}

export function detectDeviceAppLabel(): string {
  if (typeof navigator === 'undefined') return 'Unknown Device';
  const ua = navigator.userAgent || '';

  // Detect popular Thai in-app browsers first
  let app = 'Browser';
  if (/Line\//i.test(ua)) app = 'LINE In-App';
  else if (/FBAN|FBAV|FB_IAB/i.test(ua)) app = 'Facebook In-App';
  else if (/Instagram/i.test(ua)) app = 'Instagram In-App';
  else if (/Edg\//i.test(ua)) app = 'Edge';
  else if (/CriOS|Chrome\//i.test(ua) && !/Edg/i.test(ua)) app = 'Chrome';
  else if (/Firefox|FxiOS/i.test(ua)) app = 'Firefox';
  else if (/Safari/i.test(ua)) app = 'Safari';

  let os = 'Desktop';
  if (/iPhone|iPod/i.test(ua)) os = 'iPhone (iOS)';
  else if (/iPad/i.test(ua)) os = 'iPad (iPadOS)';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return `${os} • ${app}`;
}

function getStoredRawMember(): ActivityTrackPayload['member'] {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('safesoul_member');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id) return parsed;
  } catch {}
  return null;
}

export function trackActivityEvent(payload: ActivityTrackPayload): void {
  if (typeof window === 'undefined') return;
  try {
    const resolvedMember = payload.member !== undefined ? payload.member : getStoredRawMember();
    const sessionId = getOrCreateSessionId();
    const deviceLabel = detectDeviceAppLabel();

    const body = JSON.stringify({
      eventType: payload.eventType,
      path: payload.path || window.location.pathname,
      targetId: payload.targetId || '',
      targetTitle: payload.targetTitle || '',
      sessionId,
      deviceLabel,
      memberId: resolvedMember?.id || null,
      memberNumber: resolvedMember?.memberNumber ?? null,
      username: resolvedMember?.username || null,
      memberName: resolvedMember?.name || null,
      tier: resolvedMember?.tier || null,
    });

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

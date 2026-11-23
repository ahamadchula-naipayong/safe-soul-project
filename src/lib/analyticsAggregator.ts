import { AnalyticsSummaryResponse, MemberActivitySummary, ActivityEventType } from './analytics';

export interface RawActivityRow {
  id: string;
  event_type: string;
  member_id?: string | null;
  member_number?: number | null;
  username?: string | null;
  member_name?: string | null;
  tier?: string | null;
  session_id?: string | null;
  device_label?: string | null;
  path?: string | null;
  target_id?: string | null;
  target_title?: string | null;
  created_at: string;
}

export interface SimpleMemberRef {
  id: string;
  memberNumber?: number;
  member_number?: number;
  username?: string;
  name?: string;
  tier?: string;
}

function getBangkokDateKey(iso: string): string {
  try {
    const d = new Date(iso);
    // Shift UTC -> UTC+7
    const bkk = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return bkk.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export function aggregateAnalyticsEvents(
  events: RawActivityRow[],
  members: SimpleMemberRef[] = []
): AnalyticsSummaryResponse {
  const nowBkk = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const todayKey = nowBkk.toISOString().slice(0, 10);

  // Build last 7 days buckets in Bangkok time
  const dayBuckets: Record<
    string,
    { date: string; label: string; pageviews: number; sessions: Set<string>; memberActions: number }
  > = {};
  const dayKeys: string[] = [];
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowBkk.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const dayNum = parseInt(key.slice(8, 10), 10);
    const monthNum = parseInt(key.slice(5, 7), 10) - 1;
    dayKeys.push(key);
    dayBuckets[key] = {
      date: key,
      label: `${dayNum} ${thaiMonths[monthNum] || ''}`,
      pageviews: 0,
      sessions: new Set(),
      memberActions: 0,
    };
  }

  let totalPageviews = 0;
  let todayPageviews = 0;
  let totalLogins = 0;
  let totalArticleReads = 0;
  let totalNewsReads = 0;
  let totalAudioPlays = 0;
  let totalAudioCompletions = 0;

  const allSessions = new Set<string>();
  const todaySessions = new Set<string>();
  const pageCountMap = new Map<string, { path: string; title: string; count: number }>();
  const deviceCountMap = new Map<string, Set<string>>();

  // Initialize member stats map from known members
  const memberMap = new Map<
    string,
    {
      memberId: string;
      memberNumber: number | null;
      username: string;
      name: string;
      tier: string;
      visitCount: number;
      loginCount: number;
      sessionIds: Set<string>;
      devices: Set<string>;
      articlesMap: Map<string, { id: string; title: string; lastAt: string }>;
      newsMap: Map<string, { id: string; title: string; lastAt: string }>;
      audioStartedCount: number;
      audioCompletedMap: Map<string, { id: string; title: string; lastAt: string }>;
      lastActiveAt: string;
    }
  >();

  for (const m of members) {
    if (!m?.id) continue;
    memberMap.set(m.id, {
      memberId: m.id,
      memberNumber: m.memberNumber ?? m.member_number ?? null,
      username: m.username || '',
      name: m.name || m.username || m.id,
      tier: m.tier || 'free_tier_1',
      visitCount: 0,
      loginCount: 0,
      sessionIds: new Set(),
      devices: new Set(),
      articlesMap: new Map(),
      newsMap: new Map(),
      audioStartedCount: 0,
      audioCompletedMap: new Map(),
      lastActiveAt: '',
    });
  }

  for (const ev of events) {
    const type = ev.event_type as ActivityEventType;
    const sessionId = ev.session_id || 'anon';
    const deviceLabel = ev.device_label || 'Unknown';
    const dateKey = getBangkokDateKey(ev.created_at);
    const evPath = ev.path || '/';
    const evTitle = ev.target_title || evPath;

    allSessions.add(sessionId);
    if (dateKey === todayKey) todaySessions.add(sessionId);

    if (!deviceCountMap.has(deviceLabel)) deviceCountMap.set(deviceLabel, new Set());
    deviceCountMap.get(deviceLabel)!.add(sessionId);

    const bucket = dayBuckets[dateKey];
    if (bucket) {
      bucket.sessions.add(sessionId);
      if (ev.member_id) bucket.memberActions += 1;
    }

    if (type === 'pageview') {
      totalPageviews += 1;
      if (dateKey === todayKey) todayPageviews += 1;
      if (bucket) bucket.pageviews += 1;

      const prev = pageCountMap.get(evPath);
      if (prev) {
        prev.count += 1;
        if (evTitle && evTitle !== evPath) prev.title = evTitle;
      } else {
        pageCountMap.set(evPath, { path: evPath, title: evTitle, count: 1 });
      }
    } else if (type === 'login') {
      totalLogins += 1;
    } else if (type === 'article_read') {
      totalArticleReads += 1;
    } else if (type === 'news_read') {
      totalNewsReads += 1;
    } else if (type === 'audio_play') {
      totalAudioPlays += 1;
    } else if (type === 'audio_complete') {
      totalAudioCompletions += 1;
    }

    // Per-member aggregation
    if (ev.member_id) {
      let rec = memberMap.get(ev.member_id);
      if (!rec) {
        rec = {
          memberId: ev.member_id,
          memberNumber: ev.member_number ?? null,
          username: ev.username || '',
          name: ev.member_name || ev.username || ev.member_id,
          tier: ev.tier || 'free_tier_1',
          visitCount: 0,
          loginCount: 0,
          sessionIds: new Set(),
          devices: new Set(),
          articlesMap: new Map(),
          newsMap: new Map(),
          audioStartedCount: 0,
          audioCompletedMap: new Map(),
          lastActiveAt: '',
        };
        memberMap.set(ev.member_id, rec);
      }

      if (!rec.lastActiveAt || ev.created_at > rec.lastActiveAt) {
        rec.lastActiveAt = ev.created_at;
      }
      rec.sessionIds.add(sessionId);
      if (deviceLabel && deviceLabel !== 'Unknown') {
        rec.devices.add(deviceLabel);
      }

      if (type === 'pageview') rec.visitCount += 1;
      if (type === 'login') rec.loginCount += 1;
      if (type === 'article_read') {
        const key = ev.target_id || evPath;
        const existing = rec.articlesMap.get(key);
        if (!existing || ev.created_at > existing.lastAt) {
          rec.articlesMap.set(key, { id: key, title: evTitle, lastAt: ev.created_at });
        }
      }
      if (type === 'news_read') {
        const key = ev.target_id || evPath;
        const existing = rec.newsMap.get(key);
        if (!existing || ev.created_at > existing.lastAt) {
          rec.newsMap.set(key, { id: key, title: evTitle, lastAt: ev.created_at });
        }
      }
      if (type === 'audio_play') rec.audioStartedCount += 1;
      if (type === 'audio_complete') {
        const key = ev.target_id || evTitle;
        const existing = rec.audioCompletedMap.get(key);
        if (!existing || ev.created_at > existing.lastAt) {
          rec.audioCompletedMap.set(key, { id: key, title: evTitle, lastAt: ev.created_at });
        }
      }
    }
  }

  const dailyTraffic = dayKeys.map((k) => {
    const b = dayBuckets[k];
    return {
      date: b.date,
      label: b.label,
      pageviews: b.pageviews,
      uniqueVisitors: b.sessions.size,
      memberActions: b.memberActions,
    };
  });

  const last7DaysPageviews = dailyTraffic.reduce((acc, d) => acc + d.pageviews, 0);

  const topPages = Array.from(pageCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const deviceBreakdown = Array.from(deviceCountMap.entries())
    .map(([label, set]) => ({ label, count: set.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const memberStats: MemberActivitySummary[] = Array.from(memberMap.values())
    .map((m) => ({
      memberId: m.memberId,
      memberNumber: m.memberNumber,
      username: m.username,
      name: m.name,
      tier: m.tier,
      visitCount: m.visitCount,
      loginCount: m.loginCount,
      deviceCount: Math.max(m.devices.size, m.sessionIds.size > 0 ? 1 : 0),
      devices: Array.from(m.devices),
      articlesReadCount: m.articlesMap.size,
      articlesRead: Array.from(m.articlesMap.values()).sort((a, b) => b.lastAt.localeCompare(a.lastAt)),
      newsReadCount: m.newsMap.size,
      newsRead: Array.from(m.newsMap.values()).sort((a, b) => b.lastAt.localeCompare(a.lastAt)),
      audioStartedCount: m.audioStartedCount,
      audioCompletedCount: m.audioCompletedMap.size,
      audioCompleted: Array.from(m.audioCompletedMap.values()).sort((a, b) => b.lastAt.localeCompare(a.lastAt)),
      lastActiveAt: m.lastActiveAt,
    }))
    .sort((a, b) => {
      // Sort most active first, then by member number
      const scoreA = a.visitCount + a.loginCount * 3 + a.audioCompletedCount * 5;
      const scoreB = b.visitCount + b.loginCount * 3 + b.audioCompletedCount * 5;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (a.memberNumber ?? 9999) - (b.memberNumber ?? 9999);
    });

  const activeMembersCount = memberStats.filter(
    (m) => m.visitCount > 0 || m.loginCount > 0 || m.articlesReadCount > 0 || m.audioCompletedCount > 0
  ).length;

  const recentEvents = events.slice(0, 30).map((e) => ({
    id: e.id,
    eventType: e.event_type as ActivityEventType,
    memberName: e.member_name || e.username || 'ผู้มาเยือนทั่วไป',
    memberNumber: e.member_number ?? null,
    deviceLabel: e.device_label || 'Unknown',
    path: e.path || '/',
    targetTitle: e.target_title || e.path || '/',
    createdAt: e.created_at,
  }));

  return {
    success: true,
    overview: {
      totalPageviews,
      todayPageviews,
      last7DaysPageviews,
      uniqueVisitors: allSessions.size,
      todayUniqueVisitors: todaySessions.size,
      totalLogins,
      totalArticleReads,
      totalNewsReads,
      totalAudioPlays,
      totalAudioCompletions,
      activeMembersCount,
    },
    dailyTraffic,
    topPages,
    deviceBreakdown,
    memberStats,
    recentEvents,
  };
}

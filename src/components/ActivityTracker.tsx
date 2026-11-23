'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { trackActivityEvent } from '@/lib/analytics';

export function ActivityTracker() {
  const pathname = usePathname();
  const { rawMember } = useAuth();
  const lastTrackedRef = useRef<string>('');

  useEffect(() => {
    if (!pathname) return;
    // Skip /admin internal pages so site traffic stays accurate
    if (pathname.startsWith('/admin')) return;

    const dedupeKey = `${pathname}|${rawMember?.id || 'guest'}`;
    if (lastTrackedRef.current === dedupeKey) return;
    lastTrackedRef.current = dedupeKey;

    // Wait briefly so page <title> / heading updates before recording
    const timer = setTimeout(() => {
      const pageTitle =
        document.querySelector('h1')?.textContent?.trim() ||
        document.title?.replace(/\s*\|\s*The Fitrah Shield.*$/i, '').trim() ||
        pathname;

      trackActivityEvent({
        eventType: 'pageview',
        path: pathname,
        targetId: pathname,
        targetTitle: pageTitle.slice(0, 140),
        member: rawMember,
      });

      if (pathname.startsWith('/oneshot/') || pathname.startsWith('/ocean/')) {
        trackActivityEvent({
          eventType: 'article_read',
          path: pathname,
          targetId: pathname,
          targetTitle: pageTitle.slice(0, 140),
          member: rawMember,
        });
      } else if (pathname.startsWith('/news/') && pathname !== '/news') {
        const newsId = pathname.split('/').filter(Boolean).pop() || pathname;
        trackActivityEvent({
          eventType: 'news_read',
          path: pathname,
          targetId: newsId,
          targetTitle: pageTitle.slice(0, 140),
          member: rawMember,
        });
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [pathname, rawMember]);

  return null;
}

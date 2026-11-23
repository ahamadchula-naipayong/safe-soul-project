import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { aggregateAnalyticsEvents } from '@/lib/analyticsAggregator';

export const dynamic = 'force-dynamic';

const activityFilePath = path.join(process.cwd(), 'data', 'activity_events.json');
const membersFilePath = path.join(process.cwd(), 'data', 'members.json');

export async function GET() {
  try {
    const events = fs.existsSync(activityFilePath)
      ? JSON.parse(fs.readFileSync(activityFilePath, 'utf8'))
      : [];
    const members = fs.existsSync(membersFilePath)
      ? JSON.parse(fs.readFileSync(membersFilePath, 'utf8'))
      : [];

    const summary = aggregateAnalyticsEvents(events, members);
    return NextResponse.json(summary);
  } catch (err) {
    console.error('GET /api/analytics/summary error:', err);
    return NextResponse.json({ success: false, error: 'Failed to aggregate analytics' }, { status: 500 });
  }
}

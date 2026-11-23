import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const activityFilePath = path.join(process.cwd(), 'data', 'activity_events.json');

interface StoredActivityRow {
  id: string;
  event_type: string;
  member_id: string | null;
  member_number: number | null;
  username: string | null;
  member_name: string | null;
  tier: string | null;
  session_id: string;
  device_label: string;
  path: string;
  target_id: string;
  target_title: string;
  created_at: string;
}

function readEvents(): StoredActivityRow[] {
  try {
    if (!fs.existsSync(activityFilePath)) return [];
    return JSON.parse(fs.readFileSync(activityFilePath, 'utf8'));
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const row: StoredActivityRow = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      event_type: String(body.eventType || 'pageview'),
      member_id: body.memberId || null,
      member_number: body.memberNumber ?? null,
      username: body.username || null,
      member_name: body.memberName || null,
      tier: body.tier || null,
      session_id: String(body.sessionId || 'unknown'),
      device_label: String(body.deviceLabel || 'Unknown'),
      path: String(body.path || '/'),
      target_id: String(body.targetId || ''),
      target_title: String(body.targetTitle || '').slice(0, 180),
      created_at: new Date().toISOString(),
    };

    const events = readEvents();
    events.unshift(row);
    // Keep last 5,000 events locally
    const trimmed = events.slice(0, 5000);
    const dir = path.dirname(activityFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(activityFilePath, JSON.stringify(trimmed), 'utf8');

    return NextResponse.json({ success: true, id: row.id });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

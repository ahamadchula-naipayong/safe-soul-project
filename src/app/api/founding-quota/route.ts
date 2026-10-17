import { NextResponse } from 'next/server';
import { mockFoundingQuota } from '@/lib/supabase/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Can fetch from Supabase table founding_slots:
  // const { data } = await supabase.from('founding_slots').select('*').single();
  // Return current quota status
  return NextResponse.json(mockFoundingQuota);
}

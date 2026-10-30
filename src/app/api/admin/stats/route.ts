import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStatsAsync, getAuditLogsAsync } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase-client';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  if (!sessionCookie || !verifySessionToken(sessionCookie)) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const stats = await getDashboardStatsAsync();
    const recentAuditLogs = await getAuditLogsAsync(10);

    return NextResponse.json({
      stats,
      recentAuditLogs,
      databaseConnected: isSupabaseConfigured(),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
  }
}

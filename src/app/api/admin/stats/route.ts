import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStatsAsync, getAuditLogs } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import { isSupabaseConfigured, getCleanSupabaseUrl, getCleanSupabaseKey, getSupabaseClient } from '@/lib/supabase-client';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  if (!sessionCookie || !verifySessionToken(sessionCookie)) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const stats = await getDashboardStatsAsync();
    const recentAuditLogs = getAuditLogs(10);

    const isConfigured = isSupabaseConfigured();
    let supabaseTest: any = {
      isConfigured,
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      urlMasked: getCleanSupabaseUrl() ? getCleanSupabaseUrl().replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : 'NOT_CONFIGURED',
    };

    if (isConfigured) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { count, error } = await client.from('teams').select('*', { count: 'exact', head: true });
          if (error) {
            supabaseTest.error = error.message;
            supabaseTest.status = 'ERROR_QUERYING';
          } else {
            supabaseTest.status = 'CONNECTED';
            supabaseTest.remoteTeamCount = count;
          }
        }
      } catch (e: any) {
        supabaseTest.error = e.message;
        supabaseTest.status = 'CLIENT_EXCEPTION';
      }
    } else {
      supabaseTest.status = 'PERSISTENT_DATABASE_MISSING';
    }

    return NextResponse.json({
      stats,
      recentAuditLogs,
      databaseStatus: supabaseTest,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
  }
}


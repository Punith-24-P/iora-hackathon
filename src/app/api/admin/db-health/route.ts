import { NextResponse } from 'next/server';
import { getCleanSupabaseUrl, getCleanSupabaseKey, isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = getCleanSupabaseUrl();
  const key = getCleanSupabaseKey();

  const report: Record<string, any> = {
    isConfigured: isSupabaseConfigured(),
    urlMasked: url ? `${url.substring(0, 15)}...${url.substring(url.length - 12)}` : 'MISSING',
    keyLength: key ? key.length : 0,
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        report.clientError = 'Failed to create client';
      } else {
        const { data, error } = await supabase.from('event_settings').select('id, event_name').limit(1);
        if (error) {
          report.queryError = error.message;
          report.errorCode = error.code;
          report.errorDetails = error.details;
          report.errorHint = error.hint;
        } else {
          report.querySuccess = true;
          report.eventSettingsRow = data;
        }

        const { count, error: teamCountError } = await supabase.from('teams').select('*', { count: 'exact', head: true });
        if (teamCountError) {
          report.teamsTableError = teamCountError.message;
        } else {
          report.teamsCount = count;
        }
      }
    } catch (err: any) {
      report.exception = err?.message || String(err);
    }
  }

  return NextResponse.json(report);
}

import { NextResponse } from 'next/server';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  const result: Record<string, any> = {
    time: new Date().toISOString(),
    isVercel: Boolean(process.env.VERCEL),
    cwd: process.cwd(),
    supabaseConfigured: isSupabaseConfigured(),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
    supabaseKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ? 'PRESENT' : 'MISSING',
  };

  try {
    const { getDb, getSettings } = await import('@/lib/db');
    const settings = getSettings();
    result.sqliteStatus = 'OK';
    result.eventName = settings.event_name;
  } catch (err: any) {
    result.sqliteStatus = 'ERROR';
    result.sqliteError = err?.message || String(err);
    result.sqliteStack = err?.stack;
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('event_settings').select('*').limit(1);
        if (error) {
          result.supabaseQueryStatus = 'ERROR';
          result.supabaseError = error.message;
        } else {
          result.supabaseQueryStatus = 'OK';
          result.supabaseRows = data?.length;
        }
      }
    } catch (err: any) {
      result.supabaseQueryStatus = 'EXCEPTION';
      result.supabaseError = err?.message || String(err);
    }
  }

  return NextResponse.json(result);
}

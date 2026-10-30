import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function cleanEnvString(val: string | undefined): string {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
}

export function getCleanSupabaseUrl(): string {
  let url = cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

export function getCleanSupabaseKey(): string {
  const serviceKey = cleanEnvString(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (serviceKey) return serviceKey;
  return cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isSupabaseConfigured(): boolean {
  const url = getCleanSupabaseUrl();
  const key = getCleanSupabaseKey();
  return Boolean(url && key && url.includes('.supabase.co'));
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    const url = getCleanSupabaseUrl();
    const key = getCleanSupabaseKey();
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
}

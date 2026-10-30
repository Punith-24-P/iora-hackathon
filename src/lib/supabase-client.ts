import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function cleanEnvString(val: string | undefined): string {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
}

function extractProjectRefFromJwt(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const parts = token.trim().replace(/^['"]|['"]$/g, '').split('.');
    if (parts.length >= 2) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payloadBase64.padEnd(payloadBase64.length + (4 - (payloadBase64.length % 4)) % 4, '=');
      const jsonStr = Buffer.from(padded, 'base64').toString('utf8');
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed.ref === 'string' && parsed.ref.length >= 8) {
        return parsed.ref;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function getCleanSupabaseKey(): string {
  const serviceKey = cleanEnvString(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (serviceKey && serviceKey.length > 20) return serviceKey;
  const anonKey = cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (anonKey && anonKey.length > 20) return anonKey;
  return '';
}

export function getCleanSupabaseUrl(): string {
  let url = cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_URL);

  // If a valid supabase.co url was provided
  if (url && url.includes('.supabase.co')) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  }

  // If URL was missing, was literally "Publishable key", or an API key was pasted into the URL variable:
  // Automatically extract the project reference from the JWT key!
  const key = getCleanSupabaseKey();
  const refFromKey = extractProjectRefFromJwt(key);
  if (refFromKey) {
    return `https://${refFromKey}.supabase.co`;
  }

  // Also try extracting from the URL variable itself if a token was pasted there
  const refFromUrl = extractProjectRefFromJwt(url);
  if (refFromUrl) {
    return `https://${refFromUrl}.supabase.co`;
  }

  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

export function isSupabaseConfigured(): boolean {
  const url = getCleanSupabaseUrl();
  const key = getCleanSupabaseKey();
  return Boolean(url && key && url.includes('.supabase.co') && key.length > 20);
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

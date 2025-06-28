export function getSupabaseAccessToken() {
  if (typeof window === 'undefined') return undefined;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return undefined;
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
  const tokenData = localStorage.getItem(`sb-${projectRef}-auth-token`);
  if (!tokenData) return undefined;
  try {
    return JSON.parse(tokenData).access_token;
  } catch {
    return undefined;
  }
} 
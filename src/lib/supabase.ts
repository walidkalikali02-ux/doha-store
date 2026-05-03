import {createClient, type SupabaseClient} from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const configError =
  !supabaseUrl || !supabaseAnonKey
    ? 'Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    : null;

if (configError) {
  console.warn(configError);
}

const fallbackUrl = 'https://example.supabase.co';
const fallbackKey = 'public-anon-key';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export default supabase;

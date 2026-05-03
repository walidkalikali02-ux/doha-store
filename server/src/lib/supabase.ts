import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_KEY');
}

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('orders').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export default supabaseAdmin;
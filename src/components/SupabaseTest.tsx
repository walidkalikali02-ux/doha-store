import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test by fetching database metadata
        const { data, error } = await supabase.from('products').select('count');
        
        if (error) {
          console.error('Supabase error:', error);
          setError(error.message);
          setStatus('error');
        } else {
          console.log('Supabase connected! Count:', data);
          setStatus('success');
        }
      } catch (err) {
        console.error('Connection failed:', err);
        setError(String(err));
        setStatus('error');
      }
    }

    testConnection();
  }, []);

  if (status === 'loading') return <div>Testing Supabase connection...</div>;
  if (status === 'error') return <div>Connection failed: {error}</div>;
  
  return (
    <div className="p-4 bg-green-100 text-green-800">
      Supabase connected successfully!
    </div>
  );
}

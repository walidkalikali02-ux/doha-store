import { useEffect, useState } from 'react';
import { configError, supabase } from '@/lib/supabase';

export function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function testConnection() {
      if (configError) {
        setError(configError);
        setStatus('error');
        return;
      }

      try {
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Supabase error:', error);
          setError(error.message);
          setStatus('error');
        } else {
          setCount(count ?? 0);
          setStatus('success');
        }
      } catch (err) {
        console.error('Connection failed:', err);
        setError(err instanceof Error ? err.message : String(err));
        setStatus('error');
      }
    }

    testConnection();
  }, []);

  if (status === 'loading') return <div>Testing Supabase connection...</div>;
  if (status === 'error') return <div>Connection failed: {error}</div>;
  
  return (
    <div className="p-4 bg-green-100 text-green-800">
      Supabase connected successfully! Products: {count ?? 0}
    </div>
  );
}
